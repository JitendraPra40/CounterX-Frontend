import { useEffect, useState } from 'react';
import api from '../api/client.js';
import StatusMessage from '../components/StatusMessage.jsx';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/admin/payments')
      .then((response) => setPayments(response.data))
      .catch(() => setError('Could not load payment history.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="page-stack">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Payment Desk</p>
          <h2>Payments History</h2>
        </div>
      </div>
      <StatusMessage type="error">{error}</StatusMessage>
      
      {loading ? (
        <p>Loading payments...</p>
      ) : payments.length === 0 && !error ? (
        <div className="panel empty-state">
          <h3>No payments yet</h3>
          <p>Once customers complete mock payments, they will appear here.</p>
        </div>
      ) : (
        <div className="panel table-panel">
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Order #</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.paymentId}>
                    <td><strong>{payment.transactionId}</strong></td>
                    <td>{payment.orderId}</td>
                    <td>{payment.paymentMethod}</td>
                    <td>
                      <span className={payment.paymentStatus === 'SUCCESS' ? 'success-pill' : 'danger-pill'}>
                        {payment.paymentStatus}
                      </span>
                    </td>
                    <td><strong>₹{Number(payment.amount).toFixed(0)}</strong></td>
                    <td>{new Date(payment.paidAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
