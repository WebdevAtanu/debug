import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Signup from './components/Signup';
import BugList from './components/BugList';
import BugDetail from './components/BugDetail';
import Notifications from './components/Notifications';
import './App.css';

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-brand">
            <a href="/">Bug Hunter</a>
          </div>
          <div className="nav-links">
            {isAuthenticated ? (
              <>
                <a href="/">Bugs</a>
                <a href="/notifications">Notifications</a>
              </>
            ) : (
              <>
                <a href="/login">Login</a>
                <a href="/signup">Sign Up</a>
              </>
            )}
          </div>
        </nav>
        <Routes>
          <Route
            path="/login"
            element={!isAuthenticated ? <Login /> : <Navigate to="/" />}
          />
          <Route
            path="/signup"
            element={!isAuthenticated ? <Signup /> : <Navigate to="/" />}
          />
          <Route
            path="/"
            element={isAuthenticated ? <BugList /> : <Navigate to="/login" />}
          />
          <Route
            path="/bugs/:bugId"
            element={isAuthenticated ? <BugDetail /> : <Navigate to="/login" />}
          />
          <Route
            path="/notifications"
            element={isAuthenticated ? <Notifications /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
