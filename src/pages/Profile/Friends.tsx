import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { AppUser } from '../../types';

export const Friends: React.FC = () => {
  const { 
    currentUser, searchFriendCode, sendFriendRequest, acceptFriendRequest, 
    rejectFriendRequest, removeFriend, blockUser, unblockUser,
    friendRequests, friendships, blocks
  } = useApp();

  const [searchCode, setSearchCode] = useState('');
  const [searchResult, setSearchResult] = useState<AppUser | null>(null);
  const [searchError, setSearchError] = useState('');

  if (!currentUser) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    setSearchResult(null);
    if (!searchCode.trim()) return;
    
    if (searchCode.toUpperCase() === currentUser.friendCode?.toUpperCase()) {
      setSearchError("You cannot friend yourself.");
      return;
    }

    const res = await searchFriendCode(searchCode);
    if (res) {
      setSearchResult(res);
    } else {
      setSearchError('No user found with that Friend Code.');
    }
  };

  const myIncomingRequests = friendRequests.filter(r => r.receiverId === currentUser.id && r.status === 'PENDING');
  const myOutgoingRequests = friendRequests.filter(r => r.senderId === currentUser.id && r.status === 'PENDING');
  const myActiveFriendships = friendships.filter(f => f.status === 'ACTIVE');
  const myBlocks = blocks.filter(b => b.initiatedBy === currentUser.id);

  // Helper to extract the friend's ID from a pair array
  const getFriendId = (userIds: string[]) => userIds.find(id => id !== currentUser.id) || '';

  return (
    <div style={{ maxWidth: 800 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Friends</h1>
          <p className="page-desc">Connect with others and manage your network.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 24, gridTemplateColumns: '1fr 1fr' }}>
        
        {/* Search & Add Friend */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Add Friend</div>
              <div className="card-subtitle">Search by their unique Friend Code</div>
            </div>
          </div>
          <div className="card-body">
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <input 
                type="text" 
                placeholder="Enter Friend Code..." 
                value={searchCode}
                onChange={e => setSearchCode(e.target.value)}
                style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface)', color: 'var(--text-primary)' }}
              />
              <button type="submit" className="btn btn-primary">Search</button>
            </form>

            {searchError && <div style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{searchError}</div>}

            {searchResult && (
              <div style={{ padding: 12, border: '1px solid var(--border)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <img src={searchResult.photoURL || 'https://via.placeholder.com/40'} alt={searchResult.name} style={{ width: 40, height: 40, borderRadius: '50%' }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{searchResult.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{searchResult.college}</div>
                  </div>
                </div>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    sendFriendRequest(searchResult.id);
                    setSearchResult(null);
                    setSearchCode('');
                  }}
                  disabled={
                    myOutgoingRequests.some(r => r.receiverId === searchResult.id) ||
                    myActiveFriendships.some(f => f.userIds.includes(searchResult.id)) ||
                    blocks.some(b => b.userIds.includes(searchResult.id))
                  }
                >
                  Send Request
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Incoming Requests */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Incoming Requests</div>
              <div className="card-subtitle">People who want to connect</div>
            </div>
          </div>
          <div className="card-body" style={{ maxHeight: 250, overflowY: 'auto' }}>
            {myIncomingRequests.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No incoming requests.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {myIncomingRequests.map(req => (
                  <div key={req.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 8, border: '1px solid var(--border)', borderRadius: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>User: {req.senderId}</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => acceptFriendRequest(req.senderId)}>Accept</button>
                      <button className="btn" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => rejectFriendRequest(req.senderId)}>Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active Friends */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <div>
              <div className="card-title">My Friends</div>
              <div className="card-subtitle">Your active connections</div>
            </div>
          </div>
          <div className="card-body">
            {myActiveFriendships.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>You don't have any friends yet.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {myActiveFriendships.map(f => {
                  const friendId = getFriendId(f.userIds);
                  return (
                    <div key={f.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, border: '1px solid var(--border)', borderRadius: 8 }}>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>User: {friendId}</div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => removeFriend(friendId)}>Remove</button>
                        <button className="btn" style={{ padding: '4px 10px', fontSize: 12, color: 'var(--danger)' }} onClick={() => blockUser(friendId)}>Block</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Blocked Users */}
        {myBlocks.length > 0 && (
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <div className="card-header">
              <div>
                <div className="card-title">Blocked Users</div>
                <div className="card-subtitle">Users you have blocked</div>
              </div>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {myBlocks.map(b => {
                  const targetId = getFriendId(b.userIds);
                  return (
                    <div key={b.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, border: '1px solid var(--border)', borderRadius: 8 }}>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>User: {targetId}</div>
                      <button className="btn" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => unblockUser(targetId)}>Unblock</button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
