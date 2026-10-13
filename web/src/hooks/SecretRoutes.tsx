import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import type { JSX } from 'react/jsx-runtime';

function SecretRoutes({ children }: { children: JSX.Element }) {
    const { isAuthenticated } = useAuth();

    console.log('Auth state:', isAuthenticated);

    if (!isAuthenticated) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;

}

export default SecretRoutes;