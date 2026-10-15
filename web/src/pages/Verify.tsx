import { useAuth } from "../hooks/AuthContext";

function Verify() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div>
      <h1>Welcome, {user.username}!</h1>

      <p>Discord ID: {user.id}</p>

      <p>
        Steam ID: {user.steamID ?? "Not provided"}
      </p>

      <p>
        Verification Status:
        {user.verified ? " Verified" : " Not Verified"}
      </p>

      <button onClick={logout}>
        Logout
      </button>
    </div>
  );
}

export default Verify;