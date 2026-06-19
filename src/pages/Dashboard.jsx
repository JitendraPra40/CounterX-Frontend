import { useEffect, useMemo, useState } from 'react';
import api from '../api/client.js';
import StatusMessage from '../components/StatusMessage.jsx';

export default function Dashboard() {
  const [inventory, setInventory] = useState([]);
  const [menu, setMenu] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [inventoryResponse, menuResponse] = await Promise.all([
          api.get('/api/admin/inventory'),
          api.get('/api/menu'),
        ]);
        setInventory(inventoryResponse.data);
        setMenu(menuResponse.data);
      } catch (err) {
        setError('Could not load dashboard data. Make sure the backend is running and your login token is valid.');
      }
    }
    loadDashboard();
  }, []);

  const stats = useMemo(() => {
    const lowStock = inventory.filter((item) => item.lowStock).length;
    const availableItems = menu.filter((item) => item.available).length;
    return [
      { label: 'Menu Items', value: availableItems, tone: 'teal' },
      { label: 'Inventory Items', value: inventory.length, tone: 'orange' },
      { label: 'Low Stock', value: lowStock, tone: lowStock ? 'red' : 'green' },
      { label: 'QR Tables', value: 5, tone: 'blue' },
    ];
  }, [inventory, menu]);

  return (
    <section className="page-stack">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Overview</p>
          <h2>Dashboard</h2>
        </div>
        <span className="soft-pill">Live from backend APIs</span>
      </div>
      <StatusMessage type="error">{error}</StatusMessage>
      <div className="stat-grid">
        {stats.map((stat) => (
          <article className={`stat-card ${stat.tone}`} key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </article>
        ))}
      </div>
      <div className="split-grid">
        <article className="panel">
          <div className="panel-heading">
            <h3>Low Stock Watch</h3>
            <span>{inventory.filter((item) => item.lowStock).length} alerts</span>
          </div>
          <div className="list">
            {inventory.filter((item) => item.lowStock).map((item) => (
              <div className="list-row" key={item.id}>
                <div>
                  <strong>{item.itemName}</strong>
                  <small>{item.quantity} {item.unit} available</small>
                </div>
                <span className="danger-pill">Low</span>
              </div>
            ))}
            {!inventory.some((item) => item.lowStock) && <p className="empty-copy">No low-stock items right now.</p>}
          </div>
        </article>
        <article className="panel">
          <div className="panel-heading">
            <h3>Available Menu</h3>
            <span>{menu.length} items</span>
          </div>
          <div className="list">
            {menu.slice(0, 5).map((item) => (
              <div className="list-row" key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <small>{item.category}</small>
                </div>
                <span className="price">₹{Number(item.price).toFixed(0)}</span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
