import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from '../components/dashboard/Dashboard';
import { useAuth } from '../hooks/useAuth';
import { FaCoins } from 'react-icons/fa6';

const DashboardPage = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
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
                © {new Date().getFullYear()} Crypto Portfolio Tracker • {' '}
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
