import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (username, password) => {
    const result = await login(username, password);
    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      alert(result.error);
    }
  };

  return <LoginForm onLogin={handleLogin} loading={loading} />;
};

export default Login;
