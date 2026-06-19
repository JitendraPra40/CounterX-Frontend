import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CreditCard, Banknote, Smartphone, CheckCircle, ArrowRight } from 'lucide-react';
import api from '../api/client.js';
import StatusMessage from '../components/StatusMessage.jsx';

const methods = [
  { id: 'CASH', icon: <Banknote size={20} /> },
  { id: 'UPI', icon: <Smartphone size={20} /> },
  { id: 'CARD', icon: <CreditCard size={20} /> }
];

export default function Payment() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [method, setMethod] = useState('UPI');
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/api/orders/${orderId}`)
      .then((response) => setOrder(response.data))
      .catch(() => setError('Could not load bill.'));
  }, [orderId]);

  async function completePayment() {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/api/payments', { orderId: Number(orderId), paymentMethod: method });
      setPayment(data);
    } catch (err) {
      setError(err.response?.data?.messages?.[0] || 'Payment could not be completed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="payment-page">
      <section className="bill-panel">
        <p className="eyebrow">Order #{orderId}</p>
        <h1 style={{ marginBottom: '1.5rem' }}>{payment ? 'Payment successful' : 'Review your bill'}</h1>
        <StatusMessage type="error">{error}</StatusMessage>
        {order && (
          <>
            <div className="bill-lines">
              {order.items.map((item) => (
                <div className="bill-line" key={item.menuItemId}>
                  <span>{item.itemName} <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>x {item.quantity}</span></span>
                  <strong>₹{Number(item.lineTotal).toFixed(0)}</strong>
                </div>
              ))}
            </div>
            <div className="cart-total" style={{ borderTop: '2px dashed var(--line)', marginTop: '1rem', paddingTop: '1rem' }}>
              <span style={{ fontSize: '1.1rem', color: 'var(--muted)' }}>Total Amount</span>
              <strong style={{ fontSize: '1.8rem', color: 'var(--primary)' }}>₹{Number(order.totalAmount).toFixed(0)}</strong>
            </div>
          </>
        )}
        {!payment && (
          <>
            <div className="method-grid" style={{ marginTop: '2rem' }}>
              {methods.map((option) => (
                <button 
                  className={method === option.id ? 'method active' : 'method'} 
                  type="button" 
                  key={option.id} 
                  onClick={() => setMethod(option.id)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1rem' }}
                >
                  {option.icon}
                  {option.id}
                </button>
              ))}
            </div>
            <button className="primary-button" type="button" disabled={!order || loading} onClick={completePayment} style={{ width: '100%', marginTop: '1.5rem', padding: '1rem' }}>
              {loading ? 'Processing...' : `Pay ₹${Number(order?.totalAmount || 0).toFixed(0)}`}
            </button>
          </>
        )}
        {payment && (
          <div className="success-box" style={{ marginTop: '2rem', textAlign: 'center', padding: '2rem 1rem' }}>
            <CheckCircle size={48} style={{ margin: '0 auto 1rem', color: 'var(--success)' }} />
            <strong style={{ fontSize: '1.25rem', display: 'block', marginBottom: '0.25rem' }}>{payment.paymentStatus}</strong>
            <span style={{ color: 'var(--teal-dark)', fontFamily: 'monospace', background: 'rgba(255,255,255,0.5)', padding: '0.25rem 0.5rem', borderRadius: '4px', display: 'inline-block', marginBottom: '1.5rem' }}>
              {payment.transactionId}
            </span>
            <Link to={`/order/${order?.tableNumber || 1}`} className="primary-button" style={{ display: 'flex', justifyContent: 'center', textDecoration: 'none' }}>
              Start another order <ArrowRight size={18} />
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
