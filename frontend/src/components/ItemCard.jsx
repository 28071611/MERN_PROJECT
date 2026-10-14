import { useState } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, Calendar, Phone, Trash2, Edit2, CheckCircle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const ItemCard = ({ item, currentUser, onDelete, onStatusChange, onViewMatches }) => {
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);
  const [claimsDialogOpen, setClaimsDialogOpen] = useState(false);
  const [verificationInfo, setVerificationInfo] = useState('');
  const [claimMessage, setClaimMessage] = useState('');
  const [claims, setClaims] = useState([]);
  const [claimsLoading, setClaimsLoading] = useState(false);
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [claimActionId, setClaimActionId] = useState('');
  const [claimError, setClaimError] = useState('');
  const [claimSuccess, setClaimSuccess] = useState('');
  const [isRecovered, setIsRecovered] = useState(item.status === 'recovered');
  const isOwner = currentUser && item.reporter === (currentUser._id || currentUser.id);
  const isAdmin = currentUser && currentUser.isAdmin;
  const canModify = isOwner || isAdmin;

  const getStatusBadge = () => {
    if (isRecovered) {
      return <span className="badge badge-resolved">Resolved</span>;
    }
    return item.type === 'lost' ? (
      <span className="badge badge-lost">Lost</span>
    ) : (
      <span className="badge badge-found">Found</span>
    );
  };

  const handleUnauthorized = () => {
    localStorage.removeItem('user');
    window.location.assign('/login');
  };

  const handleSubmitClaim = async (event) => {
    event.preventDefault();
    setClaimError('');
    setClaimSuccess('');
    setClaimSubmitting(true);

    try {
      const response = await fetch(`http://localhost:5000/api/items/${item._id || item.id}/claims`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({
          verificationInfo: verificationInfo.trim(),
          message: claimMessage.trim()
        })
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Could not submit your claim.');
      }

      setClaimSuccess('Claim submitted. The reporter will review your verification details.');
    } catch (error) {
      setClaimError(error.message || 'Could not connect to the server. Please try again.');
    } finally {
      setClaimSubmitting(false);
    }
  };

  const handleOpenClaims = async () => {
    setClaimsDialogOpen(true);
    setClaimsLoading(true);
    setClaimError('');
    setClaimSuccess('');

    try {
      const response = await fetch(`http://localhost:5000/api/items/${item._id || item.id}/claims`, {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Could not load claims for this item.');
      }

      setClaims(data);
    } catch (error) {
      setClaimError(error.message || 'Could not connect to the server. Please try again.');
    } finally {
      setClaimsLoading(false);
    }
  };

  const handleClaimDecision = async (claimId, status) => {
    setClaimActionId(claimId);
    setClaimError('');
    setClaimSuccess('');

    try {
      const response = await fetch(`http://localhost:5000/api/claims/${claimId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({ status })
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Could not ${status} this claim.`);
      }

      setClaims((currentClaims) => currentClaims.map((claim) => (
        claim._id === claimId ? { ...claim, status: data.status } : claim
      )));
      if (status === 'accepted') {
        setIsRecovered(true);
      }
      setClaimSuccess(`Claim ${status}.`);
    } catch (error) {
      setClaimError(error.message || 'Could not connect to the server. Please try again.');
    } finally {
      setClaimActionId('');
    }
  };

  return (
    <>
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
        background: isRecovered
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
        {!isRecovered && onViewMatches && (
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
        {!isRecovered && item.type === 'found' && !isOwner && currentUser && (
          <button
            onClick={() => {
              setVerificationInfo('');
              setClaimMessage('');
              setClaimError('');
              setClaimSuccess('');
              setClaimDialogOpen(true);
            }}
            className="btn btn-warning"
            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
          >
            Claim
          </button>
        )}

        <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
          {canModify && !isRecovered && onStatusChange && (
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
              {item.type === 'found' && (
                <button
                  onClick={handleOpenClaims}
                  className="btn btn-info"
                  title="View Claims"
                  style={{ padding: '8px', borderRadius: 'var(--radius-sm)' }}
                >
                  View Claims
                </button>
              )}
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

      {(claimDialogOpen || claimsDialogOpen) && createPortal(
        <div
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setClaimDialogOpen(false);
              setClaimsDialogOpen(false);
            }
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            background: 'rgba(5, 7, 15, 0.82)',
            backdropFilter: 'blur(8px)'
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="claim-dialog-title"
            className="glow-card"
            style={{ width: '100%', maxWidth: '560px', maxHeight: '85vh', overflowY: 'auto', padding: '28px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <h2 id="claim-dialog-title" style={{ fontSize: '1.4rem' }}>
                {claimDialogOpen ? 'Claim this item' : 'Claims for this item'}
              </h2>
              <button
                type="button"
                className="btn btn-secondary"
                aria-label="Close"
                onClick={() => {
                  setClaimDialogOpen(false);
                  setClaimsDialogOpen(false);
                }}
                style={{ padding: '6px 10px' }}
              >
                Close
              </button>
            </div>

            {claimError && <div className="alert-banner alert-banner-info" role="alert">{claimError}</div>}
            {claimSuccess && <div className="alert-banner alert-banner-success" role="status">{claimSuccess}</div>}

            {claimDialogOpen && (
              claimSuccess ? null : (
                <form onSubmit={handleSubmitClaim}>
                  <div className="form-group">
                    <label className="form-label" htmlFor={`claim-verification-${item._id || item.id}`}>
                      Ownership verification <span aria-hidden="true">*</span>
                    </label>
                    <textarea
                      id={`claim-verification-${item._id || item.id}`}
                      className="form-control"
                      rows={3}
                      value={verificationInfo}
                      onChange={(event) => setVerificationInfo(event.target.value)}
                      placeholder="Describe a detail that can verify this item is yours."
                      required
                      maxLength={1000}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor={`claim-message-${item._id || item.id}`}>Message (optional)</label>
                    <textarea
                      id={`claim-message-${item._id || item.id}`}
                      className="form-control"
                      rows={2}
                      value={claimMessage}
                      onChange={(event) => setClaimMessage(event.target.value)}
                      maxLength={1000}
                    />
                  </div>
                  <button className="btn btn-primary" type="submit" disabled={claimSubmitting || !verificationInfo.trim()}>
                    {claimSubmitting ? 'Submitting…' : 'Submit claim'}
                  </button>
                </form>
              )
            )}

            {claimsDialogOpen && (
              claimsLoading ? (
                <p role="status" style={{ color: 'var(--text-secondary)' }}>Loading claims…</p>
              ) : claims.length === 0 && !claimError ? (
                <p style={{ color: 'var(--text-secondary)' }}>No claims have been submitted for this item yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {claims.map((claim) => (
                    <article key={claim._id} style={{ padding: '16px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
                        <strong>{claim.claimantName}</strong>
                        <span className={`badge ${claim.status === 'accepted' ? 'badge-resolved' : claim.status === 'rejected' ? 'badge-lost' : 'badge-found'}`}>
                          {claim.status}
                        </span>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        <strong>Verification:</strong> {claim.verificationInfo || 'Not provided'}
                      </p>
                      {claim.message && <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>{claim.message}</p>}
                      {claim.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                          <button
                            type="button"
                            className="btn btn-success"
                            disabled={claimActionId === claim._id}
                            onClick={() => handleClaimDecision(claim._id, 'accepted')}
                          >
                            {claimActionId === claim._id ? 'Saving…' : 'Accept'}
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger"
                            disabled={claimActionId === claim._id}
                            onClick={() => handleClaimDecision(claim._id, 'rejected')}
                          >
                            {claimActionId === claim._id ? 'Saving…' : 'Reject'}
                          </button>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )
            )}
          </section>
        </div>,
        document.body
      )}
    </>
  );
};

export default ItemCard;
