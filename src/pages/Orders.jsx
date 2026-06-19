import { useEffect, useState } from 'react';
import api from '../api/client.js';
import StatusMessage from '../components/StatusMessage.jsx';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/admin/orders')
      .then((response) => setOrders(response.data))
      .catch(() => setError('Could not load orders.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="page-stack">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Order Desk</p>
          <h2>Orders Monitoring</h2>
        </div>
      </div>
      <StatusMessage type="error">{error}</StatusMessage>
      
      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 && !error ? (
        <div className="panel empty-state">
          <h3>No orders yet</h3>
          <p>When customers place orders, they will appear here.</p>
        </div>
      ) : (
        <div className="panel table-panel">
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Table</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Time</th>
                  <th>Items</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.orderId}>
                    <td><strong>{order.orderId}</strong></td>
                    <td>{order.tableNumber}</td>
                    <td>
                      <span className={order.status === 'COMPLETED' ? 'success-pill' : (order.status === 'CANCELLED' ? 'danger-pill' : 'soft-pill')}>
                        {order.status}
                      </span>
                    </td>
                    <td><strong>₹{Number(order.totalAmount).toFixed(0)}</strong></td>
                    <td>{new Date(order.createdAt).toLocaleString()}</td>
                    <td>
                      <div style={{ display: 'grid', gap: '0.2rem', fontSize: '0.85rem' }}>
                        {order.items.map((item, idx) => (
                          <div key={idx}>{item.quantity}x {item.itemName}</div>
                        ))}
                      </div>
                    </td>
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
