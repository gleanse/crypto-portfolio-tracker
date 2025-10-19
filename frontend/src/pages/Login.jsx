import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import Toast from '../components/ui/Toast';

const Login = () => {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const { toast, success, error, hideToast } = useToast();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    // only auto redirect if user is already authenticated and not in the middle of logging in
    if (isAuthenticated && !isLoggingIn) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate, isLoggingIn]);

  const handleLogin = async (username, password) => {
    setIsLoggingIn(true);
    const result = await login(username, password);
    if (result.success) {
      success('Login successful! Welcome back!', 1500);
      // wait for toast to show before redirecting
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1500);
    } else {
      error('Login failed. Please check your credentials.', 1500);
      setIsLoggingIn(false);
    }
  };

  return (
    <>
      <LoginForm onLogin={handleLogin} loading={loading} />

      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    </>
  );
};

export default Login;
