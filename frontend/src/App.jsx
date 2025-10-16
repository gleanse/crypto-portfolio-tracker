// src/App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';

// TODO: remove this later and repalce the idk porfolio or whatever homepage of the app
// simple dashboard component for testing auth
const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-4">Welcome!</h1>
        <p className="text-foreground mb-6">You're successfully logged in!</p>
        <button
          onClick={logout}
          className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
