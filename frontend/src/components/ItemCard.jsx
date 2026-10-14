import { MapPin, Calendar, Phone, Trash2, Edit2, CheckCircle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const ItemCard = ({ item, currentUser, onDelete, onStatusChange, onViewMatches }) => {
  const isOwner = currentUser && item.reporter === (currentUser._id || currentUser.id);
  const isAdmin = currentUser && currentUser.isAdmin;
  const canModify = isOwner || isAdmin;

  const getStatusBadge = () => {
    if (item.status === 'recovered') {
      return <span className="badge badge-resolved">Resolved</span>;
    }
    return item.type === 'lost' ? (
      <span className="badge badge-lost">Lost</span>
    ) : (
      <span className="badge badge-found">Found</span>
    );
  };

  return (
    <div className="glow-card animate-fade-in" style={{
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Dynamic top highlight line based on status/type */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '4px',
        background: item.status === 'recovered' 
          ? 'var(--text-muted)' 
          : item.type === 'lost' 
            ? 'var(--color-lost)' 
            : 'var(--color-found)'
      }} />

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
          <span style={{
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            {item.category}
          </span>
          {getStatusBadge()}
        </div>

        <h3 style={{
          fontSize: '1.15rem',
          color: 'var(--text-primary)',
          marginBottom: '8px',
          fontWeight: 600
        }}>
          {item.name}
        </h3>

        {item.images && item.images.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <img src={item.images[0]} alt={item.name} style={{ maxWidth: '160px', maxHeight: '120px', objectFit: 'cover', borderRadius: '8px' }} />
          </div>
        )}

        <p style={{
          fontSize: '0.9rem',
          color: 'var(--text-secondary)',
          lineHeight: '1.5',
          marginBottom: '20px',
          minHeight: '42px'
        }}>
          {item.description || 'No description provided.'}
        </p>

        {/* Location & Date */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <MapPin size={16} color="var(--color-brand)" />
            <span>{item.location}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <Calendar size={16} color="var(--color-brand)" />
            <span>{item.date}</span>
          </div>
        </div>

        {/* Contact details */}
        <div style={{
          padding: '12px 16px',
          background: 'transparent',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--color-border)',
          fontSize: '0.85rem',
          marginBottom: '20px'
        }}>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Contact Finder/Owner:</div>
          <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Phone size={14} />
            <span>{item.contact}</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Reported by {item.reporterName}
          </div>
        </div>
      </div>

      {/* Action panel */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTop: '1px solid var(--color-border)',
        paddingTop: '16px'
      }}>
        {item.status === 'active' && onViewMatches && (
          <button 
            onClick={() => onViewMatches(item)} 
            className="btn btn-secondary"
            style={{
              padding: '6px 12px',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              borderColor: 'var(--color-border)',
              color: 'var(--text-secondary)',
              background: 'transparent'
            }}
          >
            <Sparkles size={12} />
            Find Matches
          </button>
        )}

        {/* Claim button for non-owners when item is found */}
        {item.status === 'active' && item.type === 'found' && !isOwner && currentUser && (
          <button
            onClick={async () => {
              const verificationInfo = window.prompt('Enter verification info (e.g. lock screen text, case color, last 4 digits):');
              if (!verificationInfo) return;
              try {
                const res = await fetch(`http://localhost:5000/api/items/${item._id || item.id}/claims`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentUser.token}` },
                  body: JSON.stringify({ verificationInfo, message: '' })
                });
                if (res.ok) {
                  alert('Claim submitted. The reporter will review it.');
                } else if (res.status === 401) {
                  alert('Session expired. Please log in again.');
                  localStorage.removeItem('user');
                  window.location.assign('/login');
                } else {
                  const data = await res.json();
                  alert(data.message || 'Failed to submit claim.');
                }
              } catch (err) {
                console.error(err);
                alert('Error submitting claim.');
              }
            }}
            className="btn btn-warning"
            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
          >
            Claim
          </button>
        )}

        <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
          {canModify && item.status === 'active' && onStatusChange && (
            <button
              onClick={() => onStatusChange(item._id || item.id, 'recovered')}
              className="btn btn-success"
              title="Mark as Resolved/Recovered"
              style={{ padding: '8px', borderRadius: 'var(--radius-sm)' }}
            >
              <CheckCircle size={14} />
            </button>
          )}

          {canModify && (
            <>
              <Link 
                to={`/edit/${item._id || item.id}`}
                className="btn btn-secondary"
                title="Edit Post"
                style={{ padding: '8px', borderRadius: 'var(--radius-sm)' }}
              >
                <Edit2 size={14} />
              </Link>
              {/* Owner can view claims */}
              <button
                onClick={async () => {
                  try {
                    const res = await fetch(`http://localhost:5000/api/items/${item._id || item.id}/claims`, {
                      headers: { 'Authorization': `Bearer ${currentUser.token}` }
                    });
                    if (res.ok) {
                      const claims = await res.json();
                      if (!claims.length) return alert('No claims yet.');
                      const list = claims.map(c => `- ${c.claimantName}: ${c.verificationInfo} (${c.status})`).join('\n');
                      // Prompt to accept a claim
                      const pick = window.prompt(`Claims:\n${list}\n\nEnter the claimant name to accept/reject, or leave empty to close.`);
                      if (!pick) return;
                      const matched = claims.find(c => c.claimantName === pick);
                      if (!matched) return alert('Claim not found.');
                      const action = window.prompt('Type ACCEPT to accept this claim, or REJECT to reject');
                      if (!action) return;
                      const status = action.toLowerCase() === 'accept' || action.toLowerCase() === 'accepted' ? 'accepted' : 'rejected';
                      const updateRes = await fetch(`http://localhost:5000/api/claims/${matched._id}/status`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentUser.token}` },
                        body: JSON.stringify({ status })
                      });
                      if (updateRes.ok) {
                        alert(`Claim ${status}.`);
                        window.location.reload();
                      } else {
                        const d = await updateRes.json();
                        alert(d.message || 'Failed to update claim.');
                      }
                    } else if (res.status === 401) {
                      alert('Session expired. Please log in again.');
                      localStorage.removeItem('user');
                      window.location.assign('/login');
                    } else {
                      alert('Failed to load claims.');
                    }
                  } catch (err) {
                    console.error(err);
                    alert('Error loading claims.');
                  }
                }}
                className="btn btn-info"
                title="View Claims"
                style={{ padding: '8px', borderRadius: 'var(--radius-sm)' }}
              >
                View Claims
              </button>
              <button
                onClick={() => onDelete(item._id || item.id)}
                className="btn btn-danger"
                title="Delete Post"
                style={{ padding: '8px', borderRadius: 'var(--radius-sm)' }}
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
