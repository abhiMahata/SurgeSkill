import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import type { EventItem, Hackathon, Course } from '../../types';

interface Msg { id: string; role: 'ai' | 'user'; text: string; streaming?: boolean }

const PROMPTS = [
  'Which courses have the most enrollments?',
  'Show upcoming hackathons',
  'Summarize registration analytics for events',
  'What is the overall engagement across all content?',
];

function generateReply(q: string, events: EventItem[], hackathons: Hackathon[], courses: Course[]): string {
  const lower = q.toLowerCase();
  
  const evRegs = events.reduce((s, e) => s + e.registrationsCount, 0);
  const evCap  = events.reduce((s, e) => s + e.capacity, 0);
  
  const hackRegs = hackathons.reduce((s, h) => s + h.registrationsCount, 0);
  const hackCap  = hackathons.reduce((s, h) => s + h.capacity, 0);
  
  const courseRegs = courses.reduce((s, c) => s + c.enrolledCount, 0);
  const courseCap  = courses.reduce((s, c) => s + c.capacity, 0);

  if (lower.includes('course') && lower.includes('enrollment')) {
    const sorted = [...courses].sort((a, b) => b.enrolledCount - a.enrolledCount).slice(0, 3);
    if (sorted.length === 0) return 'No courses available.';
    return `**Top Enrolled Courses:**\n\n${sorted.map(c => `• ${c.title} — ${c.enrolledCount}/${c.capacity} enrolled`).join('\n')}\n\nThese courses are driving the most engagement.`;
  }
  if (lower.includes('hackathon')) {
    const upcoming = hackathons.filter(h => h.status === 'Upcoming');
    if (upcoming.length === 0) return 'There are no upcoming hackathons currently scheduled.';
    return `**Upcoming Hackathons:**\n\n${upcoming.map(h => `• ${h.title} (${h.mode}) — ${h.registrationsCount}/${h.capacity} registered`).join('\n')}\n\nConsider running an email campaign to boost registrations.`;
  }
  if (lower.includes('event')) {
    return `**Event Analytics:**\n\n• **Total Events:** ${events.length}\n• **Total Registrations:** ${evRegs.toLocaleString()} of ${evCap.toLocaleString()} capacity\n• **Fill Rate:** ${evCap > 0 ? Math.round((evRegs/evCap)*100) : 0}%\n\nLet me know if you want to drill down into specific events.`;
  }
  
  const totalEng = evRegs + hackRegs + courseRegs;
  return `**Platform Snapshot:**\n\n• **Total Engagement:** ${totalEng.toLocaleString()} users across all content\n• **Events:** ${events.length} (${evRegs} registered)\n• **Hackathons:** ${hackathons.length} (${hackRegs} registered)\n• **Courses:** ${courses.length} (${courseRegs} enrolled)\n\nAsk me about specific courses, hackathons, or events for deeper analysis.`;
}

function renderMd(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
}

export const NexusAI: React.FC = () => {
  const { events, hackathons, courses } = useApp();
  const [msgs, setMsgs]     = useState<Msg[]>([{
    id: 'welcome', role: 'ai',
    text: "Hi, I'm **Nexus AI** — your community intelligence assistant. I have full access to courses, hackathons, and events. Ask me about engagement, enrollments, or analytics.",
  }]);
  const [input, setInput]   = useState('');
  const [busy, setBusy]     = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, busy]);

  const send = (text: string) => {
    if (!text.trim() || busy) return;
    const userMsg: Msg = { id: `u${Date.now()}`, role: 'user', text };
    setMsgs(p => [...p, userMsg]);
    setInput('');
    setBusy(true);

    setTimeout(() => {
      const reply = generateReply(text, events, hackathons, courses);
      const id = `a${Date.now()}`;
      setMsgs(p => [...p, { id, role: 'ai', text: '', streaming: true }]);
      setBusy(false);

      let i = 0;
      const iv = setInterval(() => {
        if (i < reply.length) {
          i = Math.min(i + 3, reply.length);
          setMsgs(p => p.map(m => m.id === id ? { ...m, text: reply.slice(0, i) } : m));
        } else {
          clearInterval(iv);
          setMsgs(p => p.map(m => m.id === id ? { ...m, streaming: false } : m));
        }
      }, 8);
    }, 700);
  };

  const totalEng = events.reduce((s, e) => s + e.registrationsCount, 0) + hackathons.reduce((s, h) => s + h.registrationsCount, 0) + courses.reduce((s, c) => s + c.enrolledCount, 0);

  return (
    <div style={{ maxWidth: 1060 }}>
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 className="page-title">Nexus AI</h1>
            <span className="badge badge-green">
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
              Online
            </span>
          </div>
          <p className="page-desc">Community intelligence assistant — analytics, insights, and engagement tracking.</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => setMsgs([{ id: 'r', role: 'ai', text: 'Conversation cleared. How can I help?' }])}>
          Clear chat
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 20, alignItems: 'start' }}>

        {/* Chat */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: 560 }}>
          {/* Messages */}
          <div className="chat-messages">
            {msgs.map(msg => (
              <div key={msg.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                {msg.role === 'ai' && (
                  <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#fff' }}>auto_awesome</span>
                  </div>
                )}
                <div
                  className={`chat-bubble ${msg.role}`}
                  dangerouslySetInnerHTML={{ __html: renderMd(msg.text) + (msg.streaming ? '<span style="opacity:0.4;animation:blink 0.8s infinite">▋</span>' : '') }}
                />
              </div>
            ))}

            {busy && (
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#fff' }}>auto_awesome</span>
                </div>
                <div className="chat-bubble ai" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  {[0, 0.15, 0.3].map((d, i) => (
                    <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--text-muted)', display: 'inline-block', animation: `pulse 1s ${d}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="chat-input-row">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
              placeholder="Ask Nexus about your community…"
              disabled={busy}
              style={{
                flex: 1, padding: '8px 12px', fontSize: 13.5,
                border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                background: '#fff', color: 'var(--text-primary)',
                outline: 'none', fontFamily: 'Inter, sans-serif',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--text-primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <button
              className="btn btn-primary"
              onClick={() => send(input)}
              disabled={busy || !input.trim()}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 17 }}>send</span>
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Prompts */}
          <div className="card">
            <div className="card-header" style={{ padding: '12px 16px' }}>
              <div className="card-title" style={{ fontSize: 13 }}>Suggested questions</div>
            </div>
            <div style={{ padding: '4px 0' }}>
              {PROMPTS.map(p => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  style={{
                    width: '100%', textAlign: 'left', padding: '9px 16px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.4,
                    borderBottom: '1px solid var(--border)', transition: 'background 120ms',
                    display: 'flex', gap: 8, alignItems: 'flex-start',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg)'}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'none'}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 1, flexShrink: 0 }}>chevron_right</span>
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Portfolio snapshot */}
          <div className="card">
            <div className="card-header" style={{ padding: '12px 16px' }}>
              <div className="card-title" style={{ fontSize: 13 }}>Platform snapshot</div>
            </div>
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { l: 'Total Content', v: events.length + hackathons.length + courses.length },
                { l: 'Engagement', v: totalEng.toLocaleString() },
                { l: 'Communities', v: 'Active' },
              ].map(row => (
                <div key={row.l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{row.l}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>{row.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:0.3} 50%{opacity:1} }
        @keyframes pulse { 0%,100%{opacity:0.4;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }
      `}</style>
    </div>
  );
};
