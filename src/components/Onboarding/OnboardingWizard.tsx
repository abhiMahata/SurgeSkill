import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { COUNTRIES, getStates, getCities, getColleges } from '../../utils/locationData';

const sel: React.CSSProperties = {
  width: '100%', padding: '10px 12px', fontSize: 14,
  border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
  background: '#fff', color: 'var(--text-primary)',
  outline: 'none', fontFamily: 'Inter, sans-serif',
  transition: 'border-color 120ms', boxSizing: 'border-box', cursor: 'pointer',
};
const inp: React.CSSProperties = { ...sel, cursor: 'text' };

const AGES = ['Under 16', '16–17', '18–20', '21–23', '24–27', '28–35', '36–45', '46+'];

export const OnboardingWizard: React.FC = () => {
  const { currentUser, completeOnboarding, showToast } = useApp();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1
  const [name, setName] = useState(currentUser?.name || '');
  const [age, setAge]   = useState('');

  // Step 2
  const [country, setCountry] = useState('India');
  const [state, setState]     = useState('');
  const [city, setCity]       = useState('');
  const [college, setCollege] = useState('');

  const states   = getStates(country);
  const cities   = state  ? getCities(country, state)   : [];
  const colleges = city   ? getColleges(country, state, city) : [];

  const canStep1 = name.trim().length >= 2 && age;
  const canStep2 = country && state && city && college;

  const handleFinish = async () => {
    if (!canStep2) return;
    setLoading(true);
    const res = await completeOnboarding({ name: name.trim(), role: 'student', age, country, state, city, college });
    setLoading(false);
    if (res.success) showToast(`Welcome to SurgeSkill, ${name.split(' ')[0]}! 🎉`);
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
                Welcome! Let's set up your profile 👋
              </h2>
              <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginBottom: 28, lineHeight: 1.6 }}>
                Tell us a bit about yourself to personalize your experience.
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

              <button
                style={{
                  width: '100%', marginTop: 28, padding: '12px',
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
            </>
          )}

          {/* ── STEP 2: Location ──────────────────────────────── */}
          {step === 2 && (
            <>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>
                Where are you from? 📍
              </h2>
              <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginBottom: 6, lineHeight: 1.6 }}>
                This connects you with communities at your institution.
              </p>
              <div style={{
                fontSize: 12, color: '#b45309', background: '#fef3c7', border: '1px solid #fde68a',
                borderRadius: 8, padding: '8px 12px', marginBottom: 24,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 15 }}>lock</span>
                Location cannot be changed after this step.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Country */}
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Country *</label>
                  <select style={sel} value={country} onChange={e => { setCountry(e.target.value); setState(''); setCity(''); setCollege(''); }}>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* State */}
                {states.length > 0 && (
                  <div>
                    <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>State / Province *</label>
                    <select style={sel} value={state} onChange={e => { setState(e.target.value); setCity(''); setCollege(''); }}>
                      <option value="">Select state…</option>
                      {states.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}

                {/* City */}
                {state && cities.length > 0 && (
                  <div>
                    <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>City *</label>
                    <select style={sel} value={city} onChange={e => { setCity(e.target.value); setCollege(''); }}>
                      <option value="">Select city…</option>
                      {cities.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                )}

                {/* College */}
                {city && colleges.length > 0 && (
                  <div>
                    <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                      College / University *
                    </label>
                    <select style={sel} value={college} onChange={e => setCollege(e.target.value)}>
                      <option value="">Select institution…</option>
                      {colleges.map(c => <option key={c} value={c}>{c}</option>)}
                      <option value="Other">Other (not listed)</option>
                    </select>
                    {college === 'Other' && (
                      <input style={{ ...inp, marginTop: 8 }} placeholder="Enter your institution name"
                        onChange={e => setCollege(e.target.value === '' ? 'Other' : e.target.value)} />
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
                <button
                  onClick={() => setStep(1)}
                  style={{
                    padding: '12px 20px', borderRadius: 10, border: '1px solid var(--border)',
                    background: '#fff', color: 'var(--text-primary)', fontSize: 14, fontWeight: 600,
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
