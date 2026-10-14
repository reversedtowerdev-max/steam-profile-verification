import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function Callback() {
    const navigate = useNavigate();
    const { setIsAuthenticated } = useAuth();
    
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
      // Send code to your backend for token exchange
      fetch(`/api/callback?code=${code}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setIsAuthenticated(true);
            console.log("Auth set, navigating to /verify");
            navigate('/verify');
          } else {
            console.log("Unauthorized, navigating to /unauthorized");
            navigate('/unauthorized');
          }
        });
    }
  }, [navigate, setIsAuthenticated]);

  return <p>Logging you in...</p>;
}

export default Callback;
