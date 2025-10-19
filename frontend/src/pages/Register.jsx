import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import Toast from '../components/ui/Toast';

const Register = () => {
  const { register, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const { toast, success, error, hideToast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleRegister = async (email, password, username) => {
    const result = await register(email, password, username);
    if (result.success) {
      success('Registration successful! Please login.', 1500);
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1500);
    } else {
      error(result.error || 'Registration failed. Please try again.', 1500);
    }
  };

  return (
    <>
      <RegisterForm onRegister={handleRegister} loading={loading} />
      <div className="text-center mt-4">
        <p className="text-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    </>
  );
};

export default Register;
