
import type { StoredUser } from "./auth";

import {
  getRequiredAvatarPixels,
  verifySteamProfile
} from "./steamVerification";

import {
  sendDiscordReport,
  type DailyVerificationReport
} from "./discordNotification";

export async function runDailyVerification(
  env: Env
): Promise<void> {
  console.log("Starting daily Steam verification");

  // Create a fresh report for every scheduled execution.
  const report: DailyVerificationReport = {
    checked: 0,
    stillVerified: 0,
    revoked: 0,
    failed: 0,
    skipped: 0,
    revokedUsers: []
  };

  // Fetch the required Steam avatar once.
  // If this fails, abort without changing any users.
  const requiredPixels = await getRequiredAvatarPixels(env);

  let cursor: string | undefined;

  do {
    const page = await env.USER_KV.list({
      prefix: "user:",
      limit: 100,
      ...(cursor ? { cursor } : {})
    });

    // Sequential processing to avoid excessive Steam API requests.
    for (const key of page.keys) {
      try {
        const user = await env.USER_KV.get<StoredUser>(
          key.name,
          "json"
        );

        // Skip missing records or users without a SteamID.
        if (!user?.steamID) {
          report.skipped++;
          continue;
        }

        // Only recheck currently verified users.
        if (!user.verified) {
          report.skipped++;
          continue;
        }

        const steamID = user.steamID;

        report.checked++;

        // Check the user's current Steam avatar.
        const result = await verifySteamProfile(
          steamID,
          env,
          requiredPixels
        );

        // An unavailable profile is not a confirmed mismatch.
        if (!result) {
          report.failed++;

          console.warn(
            "Steam profile unavailable:",
            steamID
          );

          continue;
        }

        // Retrieve the latest record before updating it.
        const latestUser = await env.USER_KV.get<StoredUser>(
          key.name,
          "json"
        );

        // Avoid overwriting a different SteamID submitted
        // while this scheduled verification was running.
        if (
          !latestUser ||
          latestUser.steamID !== steamID
        ) {
          report.skipped++;
          continue;
        }

        // The user may have manually changed their
        // verification status during this scheduled check.
        if (!latestUser.verified) {
          report.skipped++;
          continue;
        }

        // The profile still uses the required avatar.
        if (result.isEqual) {
          report.stillVerified++;

          console.log(
            `User ${latestUser.id} remains verified`
          );

          continue;
        }

        // The profile no longer uses the required avatar.
        latestUser.verified = false;

        // Save the updated verification status.
        await env.USER_KV.put(
          key.name,
          JSON.stringify(latestUser)
        );

        // Only count revocation after the KV write succeeds.
        report.revoked++;
        report.revokedUsers.push(latestUser.id);

        console.log(
          `Verification revoked for user ${latestUser.id}`
        );

      } catch (error) {
        // One user's failure should not stop other users.
        report.failed++;

        console.error(
          `Failed to recheck ${key.name}:`,
          error
        );
      }
    }

    // Continue until every KV page has been processed.
    if (page.list_complete) {
      break;
    }

    cursor = page.cursor;

  } while (cursor);

  console.log(
    "Daily Steam verification completed:",
    report
  );

  // Send one Discord summary after processing all users.
  await sendDiscordReport(env, report);

  console.log("Discord verification report sent");
}
