import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { refreshToken, getMe } from '../../services/authApi';
import { useAuth } from '../../contexts/AuthContext';

const OAuthRedirect = () => {
  const navigate = useNavigate();
  const { setAccessToken, setUser } = useAuth();

  useEffect(() => {
    async function finishLogin() {
      try {
        const r = await refreshToken();
        const accessToken = r.data.accessToken;
        setAccessToken(accessToken);

        const me = await getMe(accessToken);
        setUser(me.data.user);

        navigate('/dashboard');
      } catch (err) {
        navigate('/signin');
      }
    }
    finishLogin();
  }, [navigate, setAccessToken, setUser]);

  return <div className="min-h-screen flex items-center justify-center">Signing you in…</div>;
};

export default OAuthRedirect;
