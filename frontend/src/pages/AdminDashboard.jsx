import { useState, useEffect } from 'react';
import { ShieldAlert, Users, Trash, Award, Database, RefreshCw } from 'lucide-react';

const AdminDashboard = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [itemsList, setItemsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch Stats
      const statsRes = await fetch('http://localhost:5000/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch Users list
      const usersRes = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsersList(usersData);
      }

      // Fetch all items list for direct control
      const itemsRes = await fetch('http://localhost:5000/api/items');
      if (itemsRes.ok) {
        const itemsData = await itemsRes.json();
        setItemsList(itemsData);
      }
    } catch {
      setError('Error communicating with administration backend services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch Stats
        const statsRes = await fetch('http://localhost:5000/api/admin/stats', {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        const usersRes = await fetch('http://localhost:5000/api/admin/users', {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsersList(usersData);
        }

        const itemsRes = await fetch('http://localhost:5000/api/items');
        if (itemsRes.ok) {
          const itemsData = await itemsRes.json();
          setItemsList(itemsData);
        }
      } catch {
        setError('Error communicating with administration backend services.');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [user]);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Deleting this user will permanently remove their profile and all items they reported. Proceed?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });

      if (response.ok) {
        fetchAdminData(); // Refresh all datasets
      } else {
        alert('Could not complete deletion request.');
      }
    } catch {
      alert('Connection error.');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this reported item?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/items/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });

      if (response.ok) {
        fetchAdminData();
      } else {
        alert('Could not complete deletion request.');
      }
    } catch {
      alert('Connection error.');
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '40px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldAlert color="var(--color-lost)" size={32} />
          Administration Command Center
        </h1>
        <button onClick={fetchAdminData} className="btn btn-secondary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RefreshCw size={16} />
          Refresh Control
        </button>
      </div>

      {error && <div className="alert-banner alert-banner-info">{error}</div>}

      {loading ? (
        <div style={{ color: 'var(--text-muted)' }}>Querying administrative endpoints...</div>
      ) : (
        <>
          {/* Stats Bar */}
          {stats && (
            <div className="grid grid-cols-3" style={{ marginBottom: '40px' }}>
              <div className="glow-card" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <Users size={32} color="var(--color-brand)" />
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Registered Accounts</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{stats.totalUsers}</div>
                </div>
              </div>

              <div className="glow-card" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <Database size={32} color="var(--color-found)" />
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Reported Items</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{stats.totalItems}</div>
                </div>
              </div>

              <div className="glow-card" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <Award size={32} color="#60a5fa" />
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Success Recovery Rate</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                    {stats.totalItems > 0 ? `${Math.round((stats.recoveredItems / stats.totalItems) * 100)}%` : '0%'}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', alignItems: 'start' }}>
            {/* Items Management */}
            <div className="glow-card" style={{ padding: '30px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '20px' }}>Item Listings ({itemsList.length})</h2>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border)', color: 'var(--text-secondary)' }}>
                      <th style={{ paddingBottom: '12px' }}>Name</th>
                      <th style={{ paddingBottom: '12px' }}>Type</th>
                      <th style={{ paddingBottom: '12px' }}>Reporter</th>
                      <th style={{ paddingBottom: '12px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemsList.map(item => (
                      <tr key={item._id || item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td style={{ padding: '12px 0', fontWeight: 600 }}>{item.name}</td>
                        <td style={{ padding: '12px 0' }}>
                          <span className={`badge ${item.type === 'lost' ? 'badge-lost' : 'badge-found'}`} style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                            {item.type}
                          </span>
                        </td>
                        <td style={{ padding: '12px 0', color: 'var(--text-secondary)' }}>{item.reporterName}</td>
                        <td style={{ padding: '12px 0', textAlign: 'right' }}>
                          <button 
                            onClick={() => handleDeleteItem(item._id || item.id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--color-lost)',
                              cursor: 'pointer',
                              padding: '4px'
                            }}
                            title="Remove Post"
                          >
                            <Trash size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Users Directory */}
            <div className="glow-card" style={{ padding: '30px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '20px' }}>Registered Portals ({usersList.length})</h2>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border)', color: 'var(--text-secondary)' }}>
                      <th style={{ paddingBottom: '12px' }}>User</th>
                      <th style={{ paddingBottom: '12px' }}>Account</th>
                      <th style={{ paddingBottom: '12px', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map(u => (
                      <tr key={u._id || u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td style={{ padding: '12px 0' }}>
                          <div style={{ fontWeight: 600 }}>{u.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                        </td>
                        <td style={{ padding: '12px 0' }}>
                          <span className={`badge ${u.isAdmin ? 'badge-lost' : 'badge-found'}`} style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                            {u.isAdmin ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 0', textAlign: 'right' }}>
                          {!u.isAdmin && (
                            <button 
                              onClick={() => handleDeleteUser(u._id || u.id)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--color-lost)',
                                cursor: 'pointer',
                                padding: '4px'
                              }}
                              title="Delete Account"
                            >
                              <Trash size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
