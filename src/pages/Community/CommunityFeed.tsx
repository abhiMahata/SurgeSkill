import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { db, storage } from '../../firebase';
import { collection, query, onSnapshot, doc, getDoc, setDoc, deleteDoc, updateDoc, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { Post, Comment, AppUser } from '../../types';

const PostComments: React.FC<{
  postId: string;
  communityId: string;
  postAuthorId: string;
  profiles: Record<string, AppUser>;
  setProfiles: React.Dispatch<React.SetStateAction<Record<string, AppUser>>>;
}> = ({ postId, communityId, postAuthorId, profiles, setProfiles }) => {
  const { currentUser, showToast, notifyUser, parseMentions } = useApp();
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'communities', communityId, 'posts', postId, 'comments'));
    const unsub = onSnapshot(q, snap => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as Comment));
      all.sort((a, b) => a.createdAt - b.createdAt);
      setComments(all);
    });
    return () => unsub();
  }, [communityId, postId]);

  useEffect(() => {
    const fetchProfiles = async () => {
      const needed = new Set<string>();
      comments.forEach(c => { if (!profiles[c.authorId]) needed.add(c.authorId); });
      if (needed.size === 0) return;
      const next = { ...profiles };
      for (const id of needed) {
        try {
          const snap = await getDoc(doc(db, 'users', id));
          if (snap.exists()) next[id] = { id: snap.id, ...snap.data() } as AppUser;
        } catch (e) {}
      }
      setProfiles(next);
    };
    fetchProfiles();
  }, [comments]); // depend on comments, use functional update for setProfiles if needed, but this is fine

  const handleAddComment = async () => {
    if (!currentUser || !commentInput.trim()) return;
    try {
      const { collection, addDoc } = await import('firebase/firestore');
      await addDoc(collection(db, 'communities', communityId, 'posts', postId, 'comments'), {
        collegeId: currentUser.collegeId,
        communityId,
        postId,
        authorId: currentUser.id,
        content: commentInput.trim(),
        status: 'ACTIVE',
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      if (postAuthorId !== currentUser.id) {
        await notifyUser(postAuthorId, 'POST_COMMENT', 'post', postId, `${currentUser.displayName} commented on your post.`);
      }
      await parseMentions(commentInput.trim(), 'post', postId);
      setCommentInput('');
    } catch (e) {
      showToast('Failed to add comment.');
    }
  };

  return (
    <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px dashed var(--border)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
        {comments.map(c => {
          const cAuthor = profiles[c.authorId];
          return (
            <div key={c.id} style={{ display: 'flex', gap: 12 }}>
              <img src={cAuthor?.photoURL || 'https://via.placeholder.com/32'} style={{ width: 32, height: 32, borderRadius: '50%' }} />
              <div style={{ flex: 1, background: 'var(--bg)', padding: '8px 12px', borderRadius: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{cAuthor?.name || c.authorId}</div>
                <div style={{ fontSize: 14 }}>{c.content}</div>
              </div>
              {(currentUser?.id === c.authorId || currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'COLLEGE_ADMIN') && (
                <button className="btn btn-ghost btn-sm" onClick={async () => {
                  if (!window.confirm('Delete comment?')) return;
                  try {
                    const { doc, deleteDoc } = await import('firebase/firestore');
                    await deleteDoc(doc(db, 'communities', communityId, 'posts', postId, 'comments', c.id));
                  } catch (e) {
                    showToast('Failed to delete comment.');
                  }
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--danger)' }}>delete</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <img src={currentUser?.photoURL || 'https://via.placeholder.com/32'} style={{ width: 32, height: 32, borderRadius: '50%' }} />
        <input 
          type="text" value={commentInput} 
          onChange={e => setCommentInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleAddComment(); }}
          placeholder="Write a comment..." 
          style={{ flex: 1, padding: '8px 12px', borderRadius: 20, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none' }}
        />
      </div>
    </div>
  );
};

export const CommunityFeed: React.FC<{ communityId: string }> = ({ communityId }) => {
  const { currentUser, showToast, notifyUser, parseMentions } = useApp();
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [profiles, setProfiles] = useState<Record<string, AppUser>>({});

  // Removed legacy comments listener to prevent listener churn.
  // Comments are now managed by PostComments component per post.

  const handleCreatePost = async (e: React.FormEvent, file?: File) => {
    e?.preventDefault();
    if (!currentUser || (!content.trim() && !file)) return;
    setSending(true);
    try {
      const attachments = [];
      if (file) {
        const storageRef = ref(storage, `communities/${communityId}/posts/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        attachments.push({ storagePath: storageRef.fullPath, fileName: file.name, mimeType: file.type, size: file.size, url });
      }

      const { collection, addDoc } = await import('firebase/firestore');
      await addDoc(collection(db, 'communities', communityId, 'posts'), {
        collegeId: currentUser.collegeId,
        communityId,
        authorId: currentUser.id,
        content: content.trim(),
        attachments,
        likeCount: 0,
        commentCount: 0,
        status: 'ACTIVE',
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      await parseMentions(content.trim(), 'post', communityId);
      setContent('');
      showToast('Post created!');
    } catch (err) {
      showToast('Failed to create post.');
    }
    setSending(false);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('File must be under 2 MB.'); return; }
    handleCreatePost(null as any, file);
    e.target.value = '';
  };

  const handleLike = async (postId: string) => {
    if (!currentUser) return;
    try {
      const likeRef = doc(db, 'communities', communityId, 'posts', postId, 'likes', currentUser.id);
      const snap = await getDoc(likeRef);
      if (snap.exists()) {
        await deleteDoc(likeRef);
      } else {
        await setDoc(likeRef, { userId: currentUser.id, createdAt: Date.now() });
        const p = posts.find(x => x.id === postId);
        if (p && p.authorId !== currentUser.id) {
          await notifyUser(p.authorId, 'POST_LIKE', 'post', postId, `${currentUser.displayName} liked your post.`);
        }
      }
    } catch (e) {
      showToast('Failed to like post.');
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Delete this post?')) return;
    try {
      await deleteDoc(doc(db, 'communities', communityId, 'posts', postId));
      showToast('Post deleted.');
    } catch (e) {
      showToast('Failed to delete post.');
    }
  };

  // Add comment moved to PostComments

  return (
    <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
      {/* Composer */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-body">
          <form onSubmit={handleCreatePost} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <img src={currentUser?.photoURL || 'https://via.placeholder.com/40'} style={{ width: 40, height: 40, borderRadius: '50%' }} />
            <div style={{ flex: 1 }}>
              <textarea 
                value={content} onChange={e => setContent(e.target.value)}
                placeholder="Share something with the community..." disabled={sending}
                style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none', minHeight: 80, resize: 'vertical' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
                <label className="btn" style={{ padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>image</span>
                  <input type="file" hidden accept="image/*" onChange={handleFile} disabled={sending} />
                </label>
                <button type="submit" className="btn btn-primary" disabled={sending || !content.trim()}>Post</button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Feed */}
      {posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No posts yet. Be the first to share!</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {posts.map(p => {
            const author = profiles[p.authorId];
            return (
              <div key={p.id} className="card">
                <div className="card-body" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <img src={author?.photoURL || 'https://via.placeholder.com/40'} style={{ width: 40, height: 40, borderRadius: '50%' }} />
                      <div>
                        <div style={{ fontWeight: 600 }}>{author?.name || p.authorId}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(p.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                    {(currentUser?.id === p.authorId || currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'COLLEGE_ADMIN') && (
                      <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(p.id)}>
                        <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--danger)' }}>delete</span>
                      </button>
                    )}
                  </div>

                  {p.content && <div style={{ fontSize: 15, marginBottom: 16, whiteSpace: 'pre-wrap' }}>{p.content}</div>}
                  
                  {p.attachments?.map((a, i) => (
                    <img key={i} src={a.url} style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 8, marginBottom: 16 }} />
                  ))}

                  <div style={{ display: 'flex', gap: 16, borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 12 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleLike(p.id)} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>favorite</span>
                      Like
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setExpandedComments(prev => ({ ...prev, [p.id]: !prev[p.id] }))} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>chat_bubble</span>
                      Comment
                    </button>
                  </div>

                  {/* Comments Section */}
                  {expandedComments[p.id] && (
                    <PostComments 
                      postId={p.id} 
                      communityId={communityId} 
                      postAuthorId={p.authorId} 
                      profiles={profiles} 
                      setProfiles={setProfiles} 
                    />
                  )}

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
