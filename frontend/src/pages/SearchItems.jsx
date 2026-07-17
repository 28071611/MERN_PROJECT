import { useState, useEffect } from 'react';
import { Search, Compass, SlidersHorizontal, Sparkles, X, ChevronRight } from 'lucide-react';
import ItemCard from '../components/ItemCard';

const CATEGORIES = [
  'All Categories',
  'Mobile Phone',
  'Wallet / Purse',
  'ID Card / Badge',
  'Keys',
  'Documents / Books',
  'Electronics / Laptop',
  'Bags / Backpack',
  'Clothing / Accessories',
  'Other'
];

const SearchItems = ({ user }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search parameters
  const [searchType, setSearchType] = useState(''); // '' means All, 'lost', 'found'
  const [category, setCategory] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');

  // Matching Modal state
  const [selectedItemForMatch, setSelectedItemForMatch] = useState(null);
  const [matchingItems, setMatchingItems] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const typeParam = searchType ? `type=${searchType}` : '';
      const catParam = category !== 'All Categories' ? `category=${encodeURIComponent(category)}` : '';
      const queryParam = searchQuery ? `search=${encodeURIComponent(searchQuery)}` : '';
      const locParam = location ? `location=${encodeURIComponent(location)}` : '';

      const queryParts = [typeParam, catParam, queryParam, locParam].filter(Boolean);
      const queryStr = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

      const response = await fetch(`http://localhost:5000/api/items${queryStr}`);
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch {
      console.error('Error fetching items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      await fetchItems();
    };
    run();
  }, [searchType, category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchItems();
  };

  const handleViewMatches = async (item) => {
    if (!user || !user.token) {
      alert('Please log in to view matches.');
      return;
    }
    
    setSelectedItemForMatch(item);
    setLoadingMatches(true);
    setMatchingItems([]);

    try {
      const response = await fetch(`http://localhost:5000/api/items/${item._id || item.id}/matches`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMatchingItems(data);
      } else if (response.status === 401) {
        alert('Session expired. Please log in again.');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } catch {
      console.error('Error fetching matches.');
    } finally {
      setLoadingMatches(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    
    if (!user || !user.token) {
      alert('Authentication error. Please log in again.');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/api/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (response.ok) {
        setItems(items.filter(item => (item._id || item.id) !== itemId));
      } else if (response.status === 401) {
        alert('Session expired. Please log in again.');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else {
        alert('Failed to delete report.');
      }
    } catch {
      alert('Error connecting to backend.');
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '40px 0' }}>
      <h1 style={{ fontSize: '2.25rem', marginBottom: '28px', fontWeight: 800 }}>Search Database</h1>

      {/* Filter and Search Form */}
      <form onSubmit={handleSearchSubmit} className="glow-card" style={{ padding: '24px', marginBottom: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 150px', gap: '16px', marginBottom: '16px' }}>
          
          {/* Keyword Search */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Search Keyword</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. key, iPhone, black backpack..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Location */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Filter by Location</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. Science block, library..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Search Action */}
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '48px' }}>
              <Search size={18} />
              Filter
            </button>
          </div>

        </div>

        {/* Quick filters row */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '20px',
          borderTop: '1px solid var(--color-border)',
          paddingTop: '18px',
          marginTop: '18px'
        }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <SlidersHorizontal size={16} />
            <span>Refine Search:</span>
          </div>

          {/* Type Selector (All, Lost, Found) */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              type="button"
              onClick={() => setSearchType('')}
              className="btn"
              style={{
                padding: '6px 12px',
                fontSize: '0.8rem',
                borderRadius: '9999px',
                background: searchType === '' ? 'var(--color-brand)' : 'var(--bg-tertiary)',
                color: '#fff',
                border: searchType === '' ? 'none' : '1px solid var(--color-border)'
              }}
            >
              All Items
            </button>
            <button 
              type="button"
              onClick={() => setSearchType('lost')}
              className="btn"
              style={{
                padding: '6px 12px',
                fontSize: '0.8rem',
                borderRadius: '9999px',
                background: searchType === 'lost' ? 'var(--color-lost)' : 'var(--bg-tertiary)',
                color: '#fff',
                border: searchType === 'lost' ? 'none' : '1px solid var(--color-border)'
              }}
            >
              Lost Items
            </button>
            <button 
              type="button"
              onClick={() => setSearchType('found')}
              className="btn"
              style={{
                padding: '6px 12px',
                fontSize: '0.8rem',
                borderRadius: '9999px',
                background: searchType === 'found' ? 'var(--color-found)' : 'var(--bg-tertiary)',
                color: '#fff',
                border: searchType === 'found' ? 'none' : '1px solid var(--color-border)'
              }}
            >
              Found Items
            </button>
          </div>

          {/* Category Dropdown */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Category:</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="form-control"
              style={{ padding: '6px 12px', fontSize: '0.85rem', minWidth: '160px' }}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </form>

      {/* Database Search Results Grid */}
      {loading ? (
        <div style={{ color: 'var(--text-muted)' }}>Searching database...</div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-3">
          {items.map(item => (
            <ItemCard 
              key={item._id || item.id} 
              item={item} 
              currentUser={user}
              onDelete={handleDelete}
              onViewMatches={user ? handleViewMatches : null}
            />
          ))}
        </div>
      ) : (
        <div className="glow-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Compass size={40} style={{ margin: '0 auto 16px auto', color: 'var(--text-muted)' }} />
          <h3>No matching items found</h3>
          <p style={{ marginTop: '8px', fontSize: '0.9rem' }}>Try clearing filters or expanding search keywords.</p>
        </div>
      )}

      {/* Smart Matching Overlay Modal */}
      {selectedItemForMatch && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(5, 7, 15, 0.85)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '24px'
        }}>
          <div className="glow-card animate-fade-in" style={{
            width: '100%',
            maxWidth: '1000px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '30px',
            position: 'relative'
          }}>
            {/* Close Button */}
            <button 
              onClick={() => setSelectedItemForMatch(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--color-border)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>

            {/* Modal Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <Sparkles size={24} color="var(--color-brand)" />
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Smart Match Suggestions</h2>
            </div>

            {/* Split Screen showing selected item side-by-side with suggestions */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1px 1.5fr',
              gap: '30px'
            }}>
              {/* Target Item (Left Panel) */}
              <div>
                <h3 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '16px' }}>
                  Your Reported Item
                </h3>
                <div style={{
                  padding: '20px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{selectedItemForMatch.category}</span>
                    <span className={`badge ${selectedItemForMatch.type === 'lost' ? 'badge-lost' : 'badge-found'}`}>
                      {selectedItemForMatch.type}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{selectedItemForMatch.name}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    {selectedItemForMatch.description}
                  </p>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <div>Location: {selectedItemForMatch.location}</div>
                    <div>Date: {selectedItemForMatch.date}</div>
                  </div>
                </div>
              </div>

              {/* Vertical line divider */}
              <div style={{ background: 'var(--color-border)' }} />

              {/* Matching Candidates (Right Panel) */}
              <div>
                <h3 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '16px' }}>
                  Potential Matches Found
                </h3>

                {loadingMatches ? (
                  <div style={{ color: 'var(--text-muted)' }}>Searching possible matches...</div>
                ) : matchingItems.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {matchingItems.map(match => (
                      <div key={match._id || match.id} style={{
                        padding: '16px',
                        background: 'rgba(139, 92, 246, 0.05)',
                        border: '1px solid rgba(139, 92, 246, 0.2)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-brand)', fontWeight: 600, textTransform: 'uppercase' }}>
                            {match.category} • {match.location}
                          </div>
                          <h4 style={{ fontSize: '1.1rem', margin: '4px 0', color: '#fff' }}>{match.name}</h4>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            Contact details: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{match.contact}</span>
                          </p>
                        </div>
                        <ChevronRight size={20} color="var(--text-muted)" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    padding: '30px',
                    textAlign: 'center',
                    color: 'var(--text-secondary)',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)'
                  }}>
                    No close match recommendations found yet. Matches automatically populate based on shared category, keywords, and proximity.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchItems;
