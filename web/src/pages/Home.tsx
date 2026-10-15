
import logo from "../../public/requirement.jpeg";
import LoginButton from "../components/DiscordLoginButton";

export default function Home() {
  return (
    <main className="page">
      <section className="hero">
        <img
          src={logo}
          alt="Website logo"
          className="hero-logo"
        />

        <h1>Egg Sherran Steam Profile Promotional Event.</h1>

        <p>
          Connect your Discord account, submit your Steam
          profile, and complete verification for rewards in discord.
        </p>

        <div className="hero-actions">
          <LoginButton />
        </div>
      </section>
    </main>
  );
}
