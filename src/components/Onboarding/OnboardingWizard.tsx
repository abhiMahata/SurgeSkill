import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { auth, db } from '../../firebase';
import { collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';

const sel: React.CSSProperties = {
  width: '100%', padding: '10px 12px', fontSize: 14,
  border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
  background: 'var(--surface)', color: 'var(--text-primary)',
  outline: 'none', fontFamily: 'Inter, sans-serif',
  transition: 'border-color 120ms', boxSizing: 'border-box', cursor: 'pointer',
};
const inp: React.CSSProperties = { ...sel, cursor: 'text' };

const AGES = ['Under 16', '16–17', '18–20', '21–23', '24–27', '28–35', '36–45', '46+'];

export const OnboardingWizard: React.FC<{ isMigration?: boolean }> = ({ isMigration }) => {
  const { currentUser, completeOnboarding, showToast, logout } = useApp();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1
  const [name, setName] = useState(currentUser?.name || '');
  const [age, setAge]   = useState(currentUser?.age || '');

  // Step 2
  const [collegeIdOptions, setCollegeIdOptions] = useState<{id: string, domain: string}[]>([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState(currentUser?.collegeId || '');
  const [resolvingDomain, setResolvingDomain] = useState(true);
  const [domainError, setDomainError] = useState('');

  useEffect(() => {
    const resolveDomain = async () => {
      const user = auth.currentUser;
      if (!user || !user.email) {
        setDomainError('No authenticated email found.');
        setResolvingDomain(false);
        return;
      }
      // Support legacy users who might already have collegeId
      if (isMigration && currentUser?.collegeId) {
        setCollegeIdOptions([{ id: currentUser.collegeId, domain: user.email.split('@')[1] }]);
        setSelectedCollegeId(currentUser.collegeId);
        setResolvingDomain(false);
        return;
      }

      const domain = user.email.split('@')[1];
      if (!domain) {
        setDomainError('Invalid email format.');
        setResolvingDomain(false);
        return;
      }
      try {
        const q = query(collection(db, 'collegeDomains'), where('domain', '==', domain));
        const snap = await getDocs(q);
        if (snap.empty) {
          setDomainError(`Email domain @${domain} is not currently supported by SurgeSkill.`);
        } else {
          const options = snap.docs.map(d => ({ id: d.id, domain: d.data().domain }));
          setCollegeIdOptions(options);
          if (options.length === 1) setSelectedCollegeId(options[0].id);
        }
      } catch (err) {
        setDomainError('Error verifying college domain.');
      }
      setResolvingDomain(false);
    };
    resolveDomain();
  }, [isMigration, currentUser]);

  const generateFriendCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const claimFriendCode = async (userId: string): Promise<string> => {
    if (isMigration && currentUser?.friendCode) return currentUser.friendCode;
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = generateFriendCode();
      try {
        await setDoc(doc(db, 'friendCodes', code), { userId });
        return code;
      } catch (e) {
        // Collision, retry
      }
    }
    throw new Error('Could not generate unique friend code after multiple attempts.');
  };

  const canStep1 = name.trim().length >= 2 && age;
  const canStep2 = selectedCollegeId && !resolvingDomain && !domainError;

  const handleFinish = async () => {
    if (!canStep2) return;
    setLoading(true);
    try {
      const friendCode = await claimFriendCode(auth.currentUser!.uid);
      const res = await completeOnboarding({ 
        name: name.trim(), 
        age, 
        collegeId: selectedCollegeId, 
        friendCode, 
        isMigration: !!isMigration 
      });
      if (res.success) showToast(`Welcome to SurgeSkill, ${name.split(' ')[0]}! 🎉`);
      else throw new Error(res.message);
    } catch (err: any) {
      showToast(err.message || 'Setup failed.');
    }
    setLoading(false);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        background: 'var(--surface)', borderRadius: 20, width: '100%', maxWidth: 520,
        boxShadow: '0 24px 80px rgba(0,0,0,0.25)', overflow: 'hidden',
      }}>
        {/* Progress bar */}
        <div style={{ height: 4, background: 'var(--border)' }}>
          <div style={{
            height: '100%', borderRadius: 99, transition: 'width 0.4s ease',
            background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
            width: step === 1 ? '50%' : '100%',
          }} />
        </div>

        <div style={{ padding: '32px 36px' }}>
          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            {[1, 2].map(s => (
              <div key={s} style={{
                width: 28, height: 28, borderRadius: '50%', fontSize: 12, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: s <= step ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'var(--bg)',
                color: s <= step ? '#fff' : 'var(--text-muted)',
                border: s <= step ? 'none' : '1px solid var(--border)',
                transition: 'all 0.3s',
              }}>{s}</div>
            ))}
            <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>
              Step {step} of 2
            </span>
          </div>

          {/* ── STEP 1: About You ─────────────────────────────── */}
          {step === 1 && (
            <>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>
                {isMigration ? 'Update your profile 👋' : 'Welcome! Let\'s set up your profile 👋'}
              </h2>
              <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginBottom: 28, lineHeight: 1.6 }}>
                {isMigration ? 'We need a little more information to finalize your SurgeSkill account.' : 'Tell us a bit about yourself to personalize your experience.'}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {/* Name */}
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                    Full Name *
                  </label>
                  <input style={inp} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Arjun Sharma" />
                </div>

                {/* Age */}
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                    Age Group *
                  </label>
                  <select style={sel} value={age} onChange={e => setAge(e.target.value)}>
                    <option value="">Select age group…</option>
                    {AGES.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
                <button
                  onClick={logout}
                  style={{
                    padding: '12px 20px', borderRadius: 10, border: '1px solid var(--border)',
                    background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 14, fontWeight: 600,
                    cursor: 'pointer',
                  }}>
                  Sign Out
                </button>
                <button
                  style={{
                    flex: 1, padding: '12px',
                    background: canStep1 ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'var(--border)',
                    color: canStep1 ? '#fff' : 'var(--text-muted)',
                    border: 'none', borderRadius: 10, fontSize: 14.5, fontWeight: 700,
                    cursor: canStep1 ? 'pointer' : 'not-allowed', transition: 'all 150ms',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                  disabled={!canStep1}
                  onClick={() => canStep1 && setStep(2)}
                >
                  Continue
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
                </button>
              </div>
            </>
          )}

          {/* ── STEP 2: Location ──────────────────────────────── */}
          {step === 2 && (
            <>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>
                Verify your Campus 🎓
              </h2>
              <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginBottom: 6, lineHeight: 1.6 }}>
                SurgeSkill connects you with communities at your institution based on your email domain.
              </p>
              
              {!currentUser?.collegeId && (
                <div style={{
                  fontSize: 12, color: '#b45309', background: '#fef3c7', border: '1px solid #fde68a',
                  borderRadius: 8, padding: '8px 12px', marginBottom: 24,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 15 }}>lock</span>
                  Campus assignment is permanent and cannot be changed later.
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {resolvingDomain ? (
                  <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                    Resolving your email domain...
                  </div>
                ) : domainError ? (
                  <div style={{ padding: 16, background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, color: '#b91c1c', fontSize: 13.5 }}>
                    {domainError}
                    <div style={{ marginTop: 12 }}>
                      <button onClick={logout} style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: '#b91c1c', color: '#fff', fontSize: 12, cursor: 'pointer' }}>
                        Use a different account
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                      Select Campus *
                    </label>
                    <select style={sel} value={selectedCollegeId} onChange={e => setSelectedCollegeId(e.target.value)}>
                      <option value="">Select your campus…</option>
                      {collegeIdOptions.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                    </select>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
                <button
                  onClick={() => setStep(1)}
                  style={{
                    padding: '12px 20px', borderRadius: 10, border: '1px solid var(--border)',
                    background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 14, fontWeight: 600,
                    cursor: 'pointer',
                  }}>
                  Back
                </button>
                <button
                  style={{
                    flex: 1, padding: '12px',
                    background: canStep2 ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'var(--border)',
                    color: canStep2 ? '#fff' : 'var(--text-muted)',
                    border: 'none', borderRadius: 10, fontSize: 14.5, fontWeight: 700,
                    cursor: canStep2 && !loading ? 'pointer' : 'not-allowed', transition: 'all 150ms',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                  disabled={!canStep2 || loading}
                  onClick={handleFinish}
                >
                  {loading ? 'Setting up…' : (
                    <>
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
                      Complete Setup
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
