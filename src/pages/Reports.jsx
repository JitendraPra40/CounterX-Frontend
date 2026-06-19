import { useEffect, useState } from 'react';
import api from '../api/client.js';
import StatusMessage from '../components/StatusMessage.jsx';

export default function Reports() {
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/admin/reports')
      .then((response) => setReport(response.data))
      .catch(() => setError('Could not load reports.'))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date();
  const dailyDateString = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const monthlyDateString = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <section className="page-stack">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Insights</p>
          <h2>Reports</h2>
        </div>
      </div>
      <StatusMessage type="error">{error}</StatusMessage>
      
      {loading ? (
        <p>Loading reports...</p>
      ) : report ? (
        <div className="report-grid">
          <article className="panel report-card">
            <span className="mini-chart" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <h3 style={{ margin: 0 }}>Daily Sales</h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{dailyDateString}</span>
            </div>
            <p style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--teal)', margin: '0' }}>
              ₹{Number(report.dailySales).toFixed(0)}
            </p>
          </article>
          
          <article className="panel report-card">
            <span className="mini-chart" style={{ filter: 'hue-rotate(140deg)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <h3 style={{ margin: 0 }}>Monthly Sales</h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{monthlyDateString}</span>
            </div>
            <p style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--blue)', margin: '0' }}>
              ₹{Number(report.monthlySales).toFixed(0)}
            </p>
          </article>
          
          <article className="panel report-card">
            <span className="mini-chart" style={{ filter: 'hue-rotate(280deg)' }} />
            <h3>Top Selling Items</h3>
            <div className="list">
              {report.topSellingItems.map((item, index) => (
                <div className="list-row" key={index} style={{ padding: '0.4rem 0' }}>
                  <div>
                    <strong>{item.itemName}</strong>
                  </div>
                  <span className="soft-pill">{item.quantitySold} sold</span>
                </div>
              ))}
              {report.topSellingItems.length === 0 && (
                <p className="empty-copy">No sales yet.</p>
              )}
            </div>
          </article>
        </div>
      ) : null}
    </section>
  );
}
