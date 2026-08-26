import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FilePlus, Edit, ArrowLeft, Send } from 'lucide-react';

const CATEGORIES = [
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

const ReportItem = ({ user }) => {
  const { id } = useParams(); // For edit page
  const isEdit = !!id;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    category: 'Mobile Phone',
    description: '',
    type: 'lost',
    location: '',
    date: '',
    contact: ''
  });

  // Support detailed location and images
  // fields: building, block, floor, room, area, images (FileList)
  useEffect(() => {
    setFormData(fd => ({ ...fd, building: fd.building || '', block: fd.block || '', floor: fd.floor || '', room: fd.room || '', area: fd.area || '' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      const fetchItemDetails = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/items/${id}`);
          if (response.ok) {
            const data = await response.json();
            setFormData({
              name: data.name,
              category: data.category,
              description: data.description || '',
              type: data.type,
              location: data.location,
              date: data.date,
              contact: data.contact
              ,
              building: data.detailedLocation?.building || '',
              block: data.detailedLocation?.block || '',
              floor: data.detailedLocation?.floor || '',
              room: data.detailedLocation?.room || '',
              area: data.detailedLocation?.area || ''
            });
          } else {
            setError('Failed to load item details.');
          }
        } catch {
          setError('Server connection failed.');
        }
      };
      fetchItemDetails();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFilesChange = (e) => {
    setFormData({ ...formData, images: e.target.files });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const url = isEdit 
      ? `http://localhost:5000/api/items/${id}`
      : 'http://localhost:5000/api/items';

    const method = isEdit ? 'PUT' : 'POST';

    // Check if user has token
    if (!user || !user.token) {
      setError('Authentication error: Please log in again.');
      setLoading(false);
      return;
    }

    try {
      // Use FormData to support image upload
      const body = new FormData();
      body.append('name', formData.name);
      body.append('category', formData.category);
      body.append('description', formData.description || '');
      body.append('type', formData.type);
      body.append('location', formData.location);
      body.append('date', formData.date);
      body.append('contact', formData.contact);
      // detailed location fields
      if (formData.building) body.append('building', formData.building);
      if (formData.block) body.append('block', formData.block);
      if (formData.floor) body.append('floor', formData.floor);
      if (formData.room) body.append('room', formData.room);
      if (formData.area) body.append('area', formData.area);

      if (formData.images && formData.images.length) {
        for (let i = 0; i < formData.images.length; i += 1) {
          body.append('images', formData.images[i]);
        }
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${user.token}`
        },
        body
      });

      if (response.ok) {
        navigate('/dashboard');
      } else {
        const data = await response.json();
        if (response.status === 401) {
          setError('Session expired. Please log in again.');
          // Clear invalid user data
          localStorage.removeItem('user');
          window.location.href = '/login';
        } else {
          setError(data.message || 'Operation failed.');
        }
      }
    } catch {
      setError('Cannot connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '40px 0', maxWidth: '650px', margin: '0 auto' }}>
      <button 
        onClick={() => navigate(-1)} 
        className="btn btn-secondary" 
        style={{
          padding: '8px 16px',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '24px'
        }}
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="glow-card" style={{ padding: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--color-brand) 0%, #c084fc 100%)',
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px var(--color-brand-glow)'
          }}>
            {isEdit ? <Edit size={22} color="#fff" /> : <FilePlus size={22} color="#fff" />}
          </div>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>
              {isEdit ? 'Edit Item Post' : 'Report Item'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px' }}>
              Fill in the details to publish your report on Retrievo.
            </p>
          </div>
        </div>

        {error && (
          <div className="alert-banner alert-banner-info" style={{ marginBottom: '24px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Item Type (Lost vs Found) */}
          <div className="form-group">
            <label className="form-label">Report Type</label>
            <div style={{ display: 'flex', gap: '16px' }}>
              <label style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${formData.type === 'lost' ? 'var(--color-lost)' : 'var(--color-border)'}`,
                background: formData.type === 'lost' ? 'var(--color-lost-glow)' : 'transparent',
                cursor: 'pointer',
                fontWeight: 600,
                color: formData.type === 'lost' ? 'var(--color-lost)' : 'var(--text-secondary)',
                transition: 'var(--transition-fast)'
              }}>
                <input 
                  type="radio" 
                  name="type" 
                  value="lost" 
                  checked={formData.type === 'lost'}
                  onChange={handleChange}
                  style={{ display: 'none' }}
                />
                I Lost This Item
              </label>

              <label style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${formData.type === 'found' ? 'var(--color-found)' : 'var(--color-border)'}`,
                background: formData.type === 'found' ? 'var(--color-found-glow)' : 'transparent',
                cursor: 'pointer',
                fontWeight: 600,
                color: formData.type === 'found' ? 'var(--color-found)' : 'var(--text-secondary)',
                transition: 'var(--transition-fast)'
              }}>
                <input 
                  type="radio" 
                  name="type" 
                  value="found" 
                  checked={formData.type === 'found'}
                  onChange={handleChange}
                  style={{ display: 'none' }}
                />
                I Found This Item
              </label>
            </div>
          </div>

          {/* Name & Category */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Item Name</label>
              <input 
                type="text" 
                name="name"
                className="form-control" 
                placeholder="e.g. iPhone 13, Leather Wallet"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select 
                name="category"
                className="form-control"
                value={formData.category}
                onChange={handleChange}
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description / Distinguishing Features</label>
            <textarea 
              name="description"
              className="form-control" 
              rows="3"
              placeholder="Provide color, brand, condition, tags, or any unique characteristics..."
              value={formData.description}
              onChange={handleChange}
              style={{ resize: 'none' }}
            />
          </div>

          {/* Location & Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input 
                type="text" 
                name="location"
                className="form-control" 
                placeholder="e.g. Science Block, Cafeteria"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date (Lost/Found)</label>
              <input 
                type="date" 
                name="date"
                className="form-control"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Detailed Location & Image Upload */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Building / Block</label>
                <input type="text" name="building" className="form-control" placeholder="e.g. CSE Block" value={formData.building || ''} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label className="form-label">Floor / Room</label>
                <input type="text" name="floor" className="form-control" placeholder="e.g. 2nd Floor / R-203" value={formData.floor || ''} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label className="form-label">Block</label>
                <input type="text" name="block" className="form-control" placeholder="e.g. Block A" value={formData.block || ''} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label className="form-label">Area / Notes</label>
                <input type="text" name="area" className="form-control" placeholder="e.g. Near library steps" value={formData.area || ''} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label className="form-label">Room</label>
                <input type="text" name="room" className="form-control" placeholder="e.g. Room 101" value={formData.room || ''} onChange={handleChange} />
              </div>
            </div>

            <div>
              <label className="form-label">Upload Item Image(s)</label>
              <input type="file" name="images" accept="image/*" multiple onChange={handleFilesChange} />
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px' }}>Optional — attach clear images to help matching.</p>
            </div>
          </div>

          {/* Contact details */}
          <div className="form-group" style={{ marginBottom: '32px' }}>
            <label className="form-label">Contact Info (Phone / Email)</label>
            <input 
              type="text" 
              name="contact"
              className="form-control" 
              placeholder="e.g. Phone: +1 234 567 890, Email: contact@me.com"
              value={formData.contact}
              onChange={handleChange}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ width: '100%', display: 'flex', gap: '8px' }}
          >
            <Send size={18} />
            {loading ? 'Submitting...' : isEdit ? 'Save Changes' : 'Publish Report'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportItem;
