import React from 'react';
import { HelpCircle, ShieldCheck, FileText, AlertCircle, MessageSquare } from 'lucide-react';

const FAQs = [
  {
    q: "How do I get my earnings verified?",
    a: "Upload a screenshot of your platform earnings page or import a CSV. Our Verifiers will audit the data against the digital evidence and mark it as 'Verified' within 24-48 hours.",
    icon: <ShieldCheck size={20} />
  },
  {
    q: "What is an Income Certificate?",
    a: "It is a professional document showing your verified gig earnings history. You can use it to prove your income to banks, landlords, or for visa applications.",
    icon: <FileText size={20} />
  },
  {
    q: "How does Anomaly Detection work?",
    a: "Our AI compares your logs with the city's average and your historical data. If there's a significant drop or suspicious calculation, we flag it so you can investigate platform errors.",
    icon: <AlertCircle size={20} />
  },
  {
    q: "Is the Community Bulletin really anonymous?",
    a: "Yes. We do not store your user ID with the public post data. It is a safe space for workers to share warnings about platform changes or support each other.",
    icon: <MessageSquare size={20} />
  }
];

export default function SupportFAQ() {
  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="header-title">Worker Support & Help Center</h1>
          <p className="header-subtitle">Everything you need to know about navigating the FairGig ecosystem.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {FAQs.map((faq, i) => (
          <div key={i} className="chart-box" style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
            <div style={{ padding: '1rem', background: 'rgba(61,165,138,0.1)', color: 'var(--accent-teal)', borderRadius: '12px' }}>
              {faq.icon}
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{faq.q}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>{faq.a}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="chart-box" style={{ marginTop: '2rem', textAlign: 'center', background: 'var(--accent-blue)', color: 'white' }}>
        <h3 style={{ marginBottom: '0.5rem' }}>Still need help?</h3>
        <p style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '1.5rem' }}>Our Advocates are here to support you in disputes with platforms.</p>
        <button 
          onClick={() => window.location.href='/worker/grievances'}
          style={{ background: 'white', color: 'var(--accent-blue)', border: 'none', padding: '0.8rem 2rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Contact an Advocate
        </button>
      </div>
    </div>
  );
}
