import React from 'react';
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
          fontSize: '1.25rem',
          color: '#fff',
          marginBottom: '8px',
          fontWeight: 700
        }}>
          {item.name}
        </h3>

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
          background: 'rgba(255,255,255,0.03)',
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
              borderColor: 'var(--color-brand)',
              color: '#d8b4fe'
            }}
          >
            <Sparkles size={12} />
            Find Matches
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
