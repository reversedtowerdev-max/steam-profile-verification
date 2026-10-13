import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Verify from './pages/Verify'
import Admin from './pages/Admin'
import SecretRoutes from './hooks/SecretRoutes'
import Callback from './hooks/Callback'
import UnAuthorized from './pages/UnAuthorized'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/callback" element={<Callback />} />
        <Route path="/unauthorized" element={<UnAuthorized />} />
        <Route path="/verify" element={
          <SecretRoutes>
            <Verify />
          </SecretRoutes>
        } />
        <Route path="/admin" element={
          <SecretRoutes>
            <Admin />
          </SecretRoutes>
        } />
      </Routes>
    </>
  )
}

export default App