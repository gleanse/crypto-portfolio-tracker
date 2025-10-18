import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';
import { useAuth } from '../hooks/useAuth';

const Register = () => {
  const { register, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleRegister = async (email, password, username) => {
    const result = await register(email, password, username);
    if (result.success) {
      // TODO: use toast later
      alert('Registration successful! Please login.');
      navigate('/login', { replace: true });
    } else {
      alert(result.error);
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
    </>
  );
};

export default Register;
