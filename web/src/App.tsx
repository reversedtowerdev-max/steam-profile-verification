
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Verify from "./pages/Verify";
import Admin from "./pages/Admin";
import UnAuthorized from "./pages/UnAuthorized";

import SecretRoutes from "./hooks/SecretRoutes";
import AdminRoutes from "./hooks/AdminRoutes";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/unauthorized" element={<UnAuthorized />} />

      <Route
        path="/verify"
        element={
          <SecretRoutes>
            <Verify />
          </SecretRoutes>
        }
      />

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