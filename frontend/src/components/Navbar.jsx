// ============================================
// NAVBAR — Top navigation bar
// ============================================
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.info("You have been logged out.");
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          ✍️ BlogApp
        </Link>

        {/* Navigation links */}
        <div className="navbar-links">
          <Link to="/" className="navbar-link">
            Home
          </Link>

          {isLoggedIn ? (
            <>
              <Link to="/create" className="btn btn-primary btn-sm">
                + New Post
              </Link>
              <Link to="/profile" className="navbar-link">
                {/* Show first letter of username as avatar */}
                <span className="navbar-avatar">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
                {user?.username}
              </Link>
              <button onClick={handleLogout} className="btn btn-outline btn-sm">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
