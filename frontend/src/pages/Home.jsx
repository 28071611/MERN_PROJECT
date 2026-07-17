import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Compass, ArrowRight, Activity, Smile, FileText } from 'lucide-react';
import ItemCard from '../components/ItemCard';

const Home = ({ user }) => {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({
    lost: 0,
    found: 0,
    resolved: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/items');
        if (response.ok) {
          const data = await response.json();
          setItems(data.slice(0, 3)); // show top 3 recent items

          const lostCount = data.filter(i => i.type === 'lost' && i.status === 'active').length;
          const foundCount = data.filter(i => i.type === 'found' && i.status === 'active').length;
          const resolvedCount = data.filter(i => i.status === 'recovered').length;

          setStats({
            lost: lostCount,
            found: foundCount,
            resolved: resolvedCount
          });
        }
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div className="animate-fade-in" style={{ padding: '60px 0' }}>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: '80px' }}>
        <h1 style={{
          fontSize: '4.5rem',
          fontWeight: 600,
          background: 'linear-gradient(135deg, #fafafa 0%, #d4af37 50%, #f4cf57 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '24px',
          lineHeight: 1.1,
          letterSpacing: '-0.02em'
        }}>
          Lost it? Find it.<br/>Found it? Return it.
        </h1>
        <p style={{
          fontSize: '1.2rem',
          color: 'var(--text-secondary)',
          maxWidth: '640px',
          margin: '0 auto 40px auto',
          lineHeight: 1.6
        }}>
          A centralized, modern lost and found portal facilitating rapid item identification, reporting, and matching for campuses, organizations, and neighborhoods.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <Link to="/search" className="btn btn-primary" style={{ padding: '14px 28px' }}>
            <Search size={20} />
            Search Database
          </Link>
          {user ? (
            <Link to="/report" className="btn btn-secondary" style={{ padding: '14px 28px' }}>
              Report Lost/Found
              <ArrowRight size={18} />
            </Link>
          ) : (
            <Link to="/login" className="btn btn-secondary" style={{ padding: '14px 28px' }}>
              Get Started
              <ArrowRight size={18} />
            </Link>
          )}
        </div>
      </div>

      {/* Stats Counter Section */}
      <div className="grid grid-cols-3" style={{ marginBottom: '80px' }}>
        <div className="glow-card" style={{ padding: '30px', textAlign: 'center' }}>
          <Activity size={32} color="var(--color-lost)" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '8px' }}>{stats.lost}</h2>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Active Lost Reports</p>
        </div>
        <div className="glow-card" style={{ padding: '30px', textAlign: 'center' }}>
          <Compass size={32} color="var(--color-found)" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '8px' }}>{stats.found}</h2>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Active Found Reports</p>
        </div>
        <div className="glow-card" style={{ padding: '30px', textAlign: 'center' }}>
          <Smile size={32} color="var(--color-brand)" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '8px' }}>{stats.resolved}</h2>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Recovered belongings</p>
        </div>
      </div>

      {/* Recent Items Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Recently Reported Items</h2>
        <Link to="/search" style={{ color: 'var(--color-brand)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
          View All Items
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Item Display Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>Loading items...</div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-3">
          {items.map(item => (
            <ItemCard key={item._id || item.id} item={item} currentUser={user} />
          ))}
        </div>
      ) : (
        <div className="glow-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <FileText size={40} style={{ margin: '0 auto 16px auto', color: 'var(--text-muted)' }} />
          <h3>No items reported yet</h3>
          <p style={{ marginTop: '8px', fontSize: '0.9rem' }}>Be the first to create a post!</p>
        </div>
      )}
    </div>
  );
};

export default Home;
