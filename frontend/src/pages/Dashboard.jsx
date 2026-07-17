import { useState, useEffect } from 'react';
import { User, Mail, Calendar, FileSpreadsheet } from 'lucide-react';
import ItemCard from '../components/ItemCard';

const Dashboard = ({ user }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMyItems = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/items/my', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      } else {
        setError('Failed to fetch reported items.');
      }
    } catch {
      setError('Cannot connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    const run = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/items/my', {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setItems(data);
          setError('');
        } else {
          setError('Failed to fetch reported items.');
        }
      } catch {
        setError('Cannot connect to backend server.');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [user]);

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (response.ok) {
        setItems(items.filter(item => (item._id || item.id) !== itemId));
      } else {
        alert('Failed to delete report.');
      }
    } catch {
      alert('Error connecting to backend.');
    }
  };

  const handleStatusChange = async (itemId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchMyItems(); // Refresh items
      } else {
        alert('Failed to update status.');
      }
    } catch {
      alert('Error connecting to backend.');
    }
  };

  const totalLost = items.filter(i => i.type === 'lost').length;
  const totalFound = items.filter(i => i.type === 'found').length;
  const totalResolved = items.filter(i => i.status === 'recovered').length;

  return (
    <div className="animate-fade-in" style={{ padding: '40px 0' }}>
      <h1 style={{ fontSize: '2.25rem', marginBottom: '32px', fontWeight: 800 }}>User Dashboard</h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '350px 1fr',
        gap: '30px',
        alignItems: 'start'
      }}>
        {/* Profile Card */}
        <div className="glow-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--color-brand) 0%, #c084fc 100%)',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px var(--color-brand-glow)'
            }}>
              <User size={30} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{user.name}</h2>
              <span className={`badge ${user.isAdmin ? 'badge-lost' : 'badge-found'}`} style={{ marginTop: '4px' }}>
                {user.isAdmin ? 'System Admin' : 'Portal User'}
              </span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <Mail size={16} />
              <span>{user.email}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <Calendar size={16} />
              <span>Registered User</span>
            </div>
          </div>

          {/* User Quick Stats */}
          <div style={{
            borderTop: '1px solid var(--color-border)',
            paddingTop: '20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            textAlign: 'center',
            gap: '8px'
          }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--color-lost)' }}>{totalLost}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Lost</div>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--color-found)' }}>{totalFound}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Found</div>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--color-brand)' }}>{totalResolved}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Resolved</div>
            </div>
          </div>
        </div>

        {/* User Items List */}
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', fontWeight: 700 }}>My Reported Items</h2>

          {loading ? (
            <div style={{ color: 'var(--text-muted)' }}>Loading records...</div>
          ) : error ? (
            <div className="alert-banner alert-banner-info">{error}</div>
          ) : items.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {items.map(item => (
                <ItemCard 
                  key={item._id || item.id} 
                  item={item} 
                  currentUser={user} 
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          ) : (
            <div className="glow-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <FileSpreadsheet size={48} style={{ margin: '0 auto 16px auto', color: 'var(--text-muted)' }} />
              <h3>No reported items found</h3>
              <p style={{ marginTop: '8px', fontSize: '0.9rem' }}>If you lose or find any belongings, report them here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
