import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from '../components/dashboard/Dashboard';
import { useAuth } from '../hooks/useAuth';
import { FaCoins } from 'react-icons/fa6';
import { FiUser, FiLogOut, FiChevronDown } from 'react-icons/fi';
import { authApi } from '../api/authApi';
import { userApi } from '../api/userApi';

const DashboardPage = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated) {
        try {
          const userData = await userApi.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Failed to fetch user data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (!authLoading) {
      if (!isAuthenticated) {
        navigate('/login', { replace: true });
      } else {
        fetchUserData();
      }
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    authApi.logout();
    navigate('/login', { replace: true });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* NAVIGATION BAR */}
      <nav className="bg-card border-b border-inputbrdr sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* APP LOGO AND NAME */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
                <FaCoins className="w-4 h-4 text-accent" />
              </div>
              <span className="text-xl font-bold text-foreground">
                Crypto Portfolio
              </span>
            </div>

            {/* USER DROPDOWN */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-light border border-surface-border hover:bg-surface-hover transition-colors cursor-pointer"
              >
                <FiUser className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  {user?.username || user?.email || 'User'}
                </span>
                <FiChevronDown
                  className={`w-4 h-4 text-muted transition-transform ${
                    showDropdown ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* DROPDOWN MENU */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-surface border border-surface-border rounded-lg shadow-lg py-1 z-50">
                  <div className="px-4 py-2 text-xs text-muted border-b border-surface-border">
                    Signed in as
                    <br />
                    <span className="font-medium text-foreground">
                      {user?.email}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-negative hover:bg-negative/10 transition-colors cursor-pointer"
                  >
                    <FiLogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* DASHBOARD CONTENT */}
      <div className="flex-1">
        <Dashboard />
      </div>

      {/* FOOTER */}
      <footer className="bg-card border-t border-inputbrdr py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center gap-3">
            {/* LOGO AND NAME */}
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
                <FaCoins className="w-4 h-4 text-accent" />
              </div>
              <span className="text-lg font-bold text-foreground">
                Crypto Portfolio
              </span>
            </div>

            {/* COPYRIGHT AND NAME */}
            <div className="text-center">
              <p className="text-sm text-muted">
                © {new Date().getFullYear()} Crypto Portfolio Tracker •{' '}
                <span className="font-semibold text-primary">Auldey Glen</span>
              </p>
            </div>

            {/* SMALL ATTRIBUTION */}
            <div className="text-xs text-muted/80">
              Powered by CoinGecko API
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DashboardPage;
