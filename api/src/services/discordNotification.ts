
export interface DailyVerificationReport {
  checked: number;
  stillVerified: number;
  revoked: number;
  failed: number;
  skipped: number;
  revokedUsers: string[];
}

export async function sendDiscordReport(
  env: Env,
  report: DailyVerificationReport
): Promise<void> {
  const timestamp = new Date().toISOString();

  const revokedList = report.revokedUsers.length
    ? report.revokedUsers
        .slice(0, 15)
        .map(id => `• Discord ID: ${id}`)
        .join("\n")
    : "None";

  const extraCount = Math.max(
    0,
    report.revokedUsers.length - 15
  );

  const response = await fetch(env.DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username: "Steam Verification System",

      // Prevent accidental mentions from user-supplied content.
      allowed_mentions: {
        parse: []
      },

      embeds: [
        {
          title: "Daily Steam Verification Report",

          description:
            "The scheduled Steam profile recheck has completed.",

          color: report.revoked > 0
            ? 0xff818a
            : 0x65d6a0,

          fields: [
            {
              name: "Profiles Checked",
              value: String(report.checked),
              inline: true
            },
            {
              name: "Still Verified",
              value: String(report.stillVerified),
              inline: true
            },
            {
              name: "Verification Revoked",
              value: String(report.revoked),
              inline: true
            },
            {
              name: "Failed Checks",
              value: String(report.failed),
              inline: true
            },
            {
              name: "Skipped",
              value: String(report.skipped),
              inline: true
            },
            {
              name: "Revoked Users",
              value:
                revokedList +
                (extraCount > 0
                  ? `\n...and ${extraCount} more.`
                  : ""),
              inline: false
            }
          ],

          footer: {
            text: "Automated daily verification"
          },

          timestamp
        }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.text();

    throw new Error(
      `Discord webhook failed (${response.status}): ${error}`
    );
  }
}
