import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import loginBg from '../assets/login-bg.png';
import restaurantMark from '../assets/restaurant-mark.svg';
import StatusMessage from '../components/StatusMessage.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import './Login.css';

export default function Login() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const from = location.state?.from?.pathname || '/admin/dashboard';

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form.username, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.messages?.[0] || 'Login failed. Check backend server and admin credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrapper">
      <div className="login-visual-panel">
        <img src={loginBg} alt="Premium Restaurant" className="login-bg-img" />
        <div className="visual-overlay"></div>
        <div className="visual-content">
          <div className="brand-logo-container">
            <img src={restaurantMark} alt="Restaurant Mark" className="brand-logo" />
            <span className="brand-text">Aura</span>
          </div>
          <h1 className="visual-headline">Elevate your dining experience.</h1>
          <p className="visual-subhead">
            Seamlessly manage tables, orders, and payments with our premium dashboard built for modern gastronomy.
          </p>
        </div>
      </div>
      
      <div className="login-form-panel">
        <div className="login-form-container">
          <div className="form-header">
            <h2>Welcome Back</h2>
            <p>Enter your credentials to access the admin portal</p>
          </div>
          
          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <StatusMessage type="error">{error}</StatusMessage>}
            
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <div className="input-wrapper">
                <input 
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={form.username} 
                  onChange={(event) => setForm({ ...form, username: event.target.value })} 
                  required
                />
              </div>
            </div>
            
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <input 
                  id="password"
                  type="password" 
                  placeholder="Enter your password"
                  value={form.password} 
                  onChange={(event) => setForm({ ...form, password: event.target.value })} 
                  required
                />
              </div>
            </div>
            
            <button className="login-submit-btn" type="submit" disabled={loading}>
              {loading ? (
                <span className="btn-content">
                  <svg className="spinner" viewBox="0 0 50 50">
                    <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                  </svg>
                  Authenticating...
                </span>
              ) : (
                <span className="btn-content">Sign In to Dashboard</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
