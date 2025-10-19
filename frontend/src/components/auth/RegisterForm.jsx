import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import Button from '../ui/Button';

const RegisterForm = ({ onRegister, loading }) => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onRegister(formData.email, formData.password, formData.username);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
              Create your account
            </h2>
            <p className="text-sm text-muted">Join your crypto portfolio</p>
          </div>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-muted" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg placeholder-muted text-foreground focus:outline-none focus:ring-2 focus:ring-inputfocus bg-inputbg transition-colors ${
                    errors.email
                      ? 'border-negative'
                      : 'border-inputbrdr focus:border-inputfocus'
                  }`}
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              {errors.email && (
                <p className="text-negative text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="username"
                className="text-sm font-medium text-foreground"
              >
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-muted" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg placeholder-muted text-foreground focus:outline-none focus:ring-2 focus:ring-inputfocus bg-inputbg transition-colors ${
                    errors.username
                      ? 'border-negative'
                      : 'border-inputbrdr focus:border-inputfocus'
                  }`}
                  placeholder="Enter a username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
              {errors.username && (
                <p className="text-negative text-sm mt-1">{errors.username}</p>
              )}
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
                  <FiLock className="h-5 w-5 text-muted" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className={`block w-full pl-10 pr-10 py-3 border rounded-lg placeholder-muted text-foreground focus:outline-none focus:ring-2 focus:ring-inputfocus bg-inputbg transition-colors ${
                    errors.password
                      ? 'border-negative'
                      : 'border-inputbrdr focus:border-inputfocus'
                  }`}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted hover:text-inputfocus transition-colors"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <FiEye className="h-5 w-5" />
                  ) : (
                    <FiEyeOff className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-negative text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-foreground"
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-muted" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  className={`block w-full pl-10 pr-10 py-3 border rounded-lg placeholder-muted text-foreground focus:outline-none focus:ring-2 focus:ring-inputfocus bg-inputbg transition-colors ${
                    errors.confirmPassword
                      ? 'border-negative'
                      : 'border-inputbrdr focus:border-inputfocus'
                  }`}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted hover:text-inputfocus transition-colors"
                  onClick={toggleConfirmPasswordVisibility}
                >
                  {showConfirmPassword ? (
                    <FiEye className="h-5 w-5" />
                  ) : (
                    <FiEyeOff className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-negative text-sm mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          <div>
            <Button
              type="submit"
              variant="accent"
              loading={loading}
              className="w-full flex justify-center py-3 text-base font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
            >
              Create Account
            </Button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-foreground">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-accent hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
