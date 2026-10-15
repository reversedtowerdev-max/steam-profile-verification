
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Verify from "./pages/Verify";
import Admin from "./pages/Admin";
import UnAuthorized from "./pages/UnAuthorized";
import UserDashboard from "./pages/Dashboard";
import SecretRoutes from "./hooks/SecretRoutes";
import AdminRoutes from "./hooks/AdminRoutes";
import GuestRoutes from "./hooks/GuestRoutes";

function App() {
  return (
    <Routes>
      <Route element={<GuestRoutes />}>
        <Route path="/" element={<Home />} />
      </Route>

      <Route path="/unauthorized" element={<UnAuthorized />} />

      <Route element={<SecretRoutes />}>
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/verify" element={<Verify />} />
      </Route>

      <Route
        path="/admin"
        element={
          <AdminRoutes>
            <Admin />
          </AdminRoutes>
        }
      />

      <Route path="*" element={<UnAuthorized />} />
    </Routes>
  );
}

export default App;