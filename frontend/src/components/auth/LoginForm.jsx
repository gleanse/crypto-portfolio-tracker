import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import Button from '../ui/Button';

// this part is medyo confusing kasi the fast api works weird in OAuth2 like backend expect the key as username but the value is email so yeah
const LoginForm = ({ onLogin, loading }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(formData.username, formData.password);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-sm sm:max-w-md space-y-8">
        {/* HEADER */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 bg-accent rounded-full flex items-center justify-center">
            <FiUser className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Welcome back
            </h2>
            <p className="text-sm text-muted">
              Sign in to your crypto portfolio
            </p>
          </div>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="text-sm font-medium text-foreground"
              >
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-inputbrdr" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-inputbrdr rounded-lg placeholder-muted text-foreground focus:outline-none focus:ring-2 focus:ring-inputfocus focus:border-inputfocus bg-inputbg transition-colors"
                  placeholder="Enter your email"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
              {/* NOTE:  EMAIL ADDRESS KASI LITERAL VALUE EMAIL EXPECT NG BACKEND but it wanted to be insert in username key in json */}
            </div>
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-inputbrdr" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="block w-full pl-10 pr-10 py-3 border border-inputbrdr rounded-lg placeholder-muted text-foreground focus:outline-none focus:ring-2 focus:ring-inputfocus focus:border-inputfocus bg-inputbg transition-colors"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-inputbrdr hover:text-inputfocus transition-colors"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <FiEye className="h-5 w-5" />
                  ) : (
                    <FiEyeOff className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              variant="accent"
              loading={loading}
              className="w-full flex justify-center py-3 text-base font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
            >
              Sign in
            </Button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-foreground">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-accent hover:underline font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
