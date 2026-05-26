import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import type { EventItem } from '../../context/AppContext';

interface Msg { id: string; role: 'ai' | 'user'; text: string; streaming?: boolean }

const PROMPTS = [
  'Summarize registration analytics for all events',
  'Which events are at full capacity?',
  'Suggest a pricing strategy for the next workshop',
  'Show revenue projections across my portfolio',
];

function generateReply(q: string, events: EventItem[]): string {
  const lower = q.toLowerCase();
  const totalRegs = events.reduce((s, e) => s + e.registrationsCount, 0);
  const totalCap  = events.reduce((s, e) => s + e.capacity, 0);
  const fillPct   = totalCap > 0 ? ((totalRegs / totalCap) * 100).toFixed(1) : '0';
  const revenue   = events.reduce((s, e) => {
    if (e.price === 'Free' || !e.price.startsWith('$')) return s;
    return s + parseInt(e.price.replace('$', ''), 10) * e.registrationsCount;
  }, 0);
  const full = events.filter(e => e.registrationsCount >= e.capacity);

  if (lower.includes('capacity') || lower.includes('full')) {
    return full.length === 0
      ? 'No events are currently at full capacity. All events have available spots.'
      : `**Events at full capacity:**\n\n${full.map(e => `• ${e.title} — ${e.registrationsCount}/${e.capacity}`).join('\n')}\n\nConsider expanding capacity or enabling a waitlist for these events.`;
  }
  if (lower.includes('pric') || lower.includes('strategy')) {
    return `**Pricing Recommendations:**\n\n• The UX Paradigm Shift is at 88% capacity — consider a 10–15% price increase for the remaining seats.\n• Free networking events drive community growth; keep them free.\n• For premium conferences at <60% fill: offer early-bird discounts 3 weeks out.\n\nEstimated uplift from dynamic pricing: **$800–$1,200**.`;
  }
  if (lower.includes('revenue') || lower.includes('projection')) {
    return `**Revenue Overview:**\n\n• Confirmed revenue from paid registrations: **$${revenue.toLocaleString()}**\n• Total registrations: ${totalRegs.toLocaleString()} of ${totalCap.toLocaleString()} capacity\n• Average fill rate: **${fillPct}%**\n\nProjected final revenue (assuming current velocity): **$${Math.round(revenue * 1.15).toLocaleString()}**.`;
  }
  return `**Portfolio Summary:**\n\n• **Total events:** ${events.length}\n• **Total registrations:** ${totalRegs.toLocaleString()} / ${totalCap.toLocaleString()} capacity\n• **Fill rate:** ${fillPct}%\n• **Projected revenue:** $${revenue.toLocaleString()}\n• **Events at capacity:** ${full.length}\n\nAsk me about pricing, capacity, or specific events for deeper analysis.`;
}

function renderMd(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
}

export const NexusAI: React.FC = () => {
  const { events } = useApp();
  const [msgs, setMsgs]     = useState<Msg[]>([{
    id: 'welcome', role: 'ai',
    text: "Hi, I'm **Nexus AI** — your event intelligence assistant. I have full access to your event portfolio. Ask me about registrations, revenue, capacity, or pricing recommendations.",
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
      const reply = generateReply(text, events);
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
          <p className="page-desc">Event intelligence assistant — analytics, pricing, and insights on demand.</p>
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
              placeholder="Ask Nexus about your events…"
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
              <div className="card-title" style={{ fontSize: 13 }}>Portfolio snapshot</div>
            </div>
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { l: 'Total events', v: events.length },
                { l: 'Registrations', v: events.reduce((s, e) => s + e.registrationsCount, 0).toLocaleString() },
                { l: 'Fill rate', v: (() => {
                  const c = events.reduce((s, e) => s + e.capacity, 0);
                  const r = events.reduce((s, e) => s + e.registrationsCount, 0);
                  return c > 0 ? `${Math.round((r/c)*100)}%` : '0%';
                })() },
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
