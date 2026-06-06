import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, PlusCircle, User, LogOut, Shield, Compass, Layers } from 'lucide-react';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout();
    navigate('/');
  };

  return (
    <nav style={{
      borderBottom: '1px solid var(--color-border)',
      background: 'rgba(7, 10, 22, 0.8)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '74px'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontWeight: 800,
          fontSize: '1.4rem',
          color: '#fff',
          fontFamily: 'var(--font-heading)'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--color-brand) 0%, #a78bfa 100%)',
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px var(--color-brand-glow)'
          }}>
            <Compass size={20} color="#fff" />
          </div>
          <span>Retriev<span style={{ color: 'var(--color-brand)' }}>o</span></span>
        </Link>

        {/* Links */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px'
        }}>
          <Link to="/search" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-secondary)',
            fontWeight: 500
          }} className="nav-link">
            <Search size={18} />
            Search
          </Link>

          {user ? (
            <>
              <Link to="/report" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--text-secondary)',
                fontWeight: 500
              }}>
                <PlusCircle size={18} />
                Report Item
              </Link>

              {user.isAdmin && (
                <Link to="/admin" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--color-lost)',
                  fontWeight: 600
                }}>
                  <Shield size={18} />
                  Admin
                </Link>
              )}

              <Link to="/dashboard" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--text-secondary)',
                fontWeight: 500
              }}>
                <User size={18} />
                Dashboard
              </Link>

              <button 
                onClick={handleLogoutClick} 
                className="btn btn-secondary" 
                style={{
                  padding: '8px 16px',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '12px' }}>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                Login
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .nav-link:hover {
          color: var(--text-primary) !important;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
