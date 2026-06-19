import { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import api from '../api/client.js';
import StatusMessage from '../components/StatusMessage.jsx';

const emptyForm = {
  name: '',
  category: 'BREAKFAST',
  price: '',
  available: true,
  imageUrl: '',
};

export default function MenuAdmin() {
  const [menu, setMenu] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function loadMenu() {
    const { data } = await api.get('/api/admin/menu');
    setMenu(data);
  }

  useEffect(() => {
    loadMenu().catch(() => setError('Could not load menu items.'));
  }, []);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function startEdit(item) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      category: item.category,
      price: item.price,
      available: item.available,
      imageUrl: item.imageUrl || '',
    });
    setMessage('');
    setError('');
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    const payload = {
      ...form,
      price: Number(form.price),
      available: Boolean(form.available),
    };

    try {
      if (editingId) {
        await api.put(`/api/admin/menu/${editingId}`, payload);
        setMessage('Menu item updated.');
      } else {
        await api.post('/api/admin/menu', payload);
        setMessage('Menu item added.');
      }
      resetForm();
      await loadMenu();
    } catch (err) {
      const fallback = err.response?.data?.error || err.message || 'Menu action failed.';
      setError(err.response?.data?.messages?.[0] || fallback);
    } finally {
      setLoading(false);
    }
  }

  async function deleteItem(id) {
    setError('');
    setMessage('');
    try {
      await api.delete(`/api/admin/menu/${id}`);
      setMessage('Menu item deleted.');
      await loadMenu();
    } catch (err) {
      setError('Could not delete menu item.');
    }
  }

  return (
    <section className="page-stack">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Food Catalog</p>
          <h2>Menu Management</h2>
        </div>
      </div>
      
      <StatusMessage type="success">{message}</StatusMessage>
      <StatusMessage type="error">{error}</StatusMessage>

      <div className="inventory-layout">
        <form className="panel form-panel" onSubmit={handleSubmit}>
          <h3 style={{ marginBottom: '1rem' }}>{editingId ? 'Edit Menu Item' : 'Add Menu Item'}</h3>
          <label>
            Name
            <input required value={form.name} onChange={(event) => updateField('name', event.target.value)} placeholder="Paneer Butter Masala" />
          </label>
          <div className="form-grid">
            <label>
              Price (₹)
              <input required type="number" min="0" step="1" value={form.price} onChange={(event) => updateField('price', event.target.value)} />
            </label>
            <label>
              Category
              <select value={form.category} onChange={(event) => updateField('category', event.target.value)}>
                <option value="BREAKFAST">Breakfast</option>
                <option value="LUNCH">Lunch</option>
                <option value="DINNER">Dinner</option>
                <option value="SNACKS">Snacks</option>
                <option value="BEVERAGE">Beverage</option>
                <option value="DESSERT">Dessert</option>
              </select>
            </label>
          </div>
          <label>
            Image URL
            <input type="url" value={form.imageUrl} onChange={(event) => updateField('imageUrl', event.target.value)} placeholder="https://example.com/image.jpg" />
          </label>
          <label>
            Availability
            <select value={form.available} onChange={(event) => updateField('available', event.target.value === 'true')}>
              <option value="true">Available</option>
              <option value="false">Out of Stock</option>
            </select>
          </label>
          <div className="button-row" style={{ marginTop: '0.5rem' }}>
            <button className="primary-button" type="submit" disabled={loading}>{loading ? 'Saving...' : editingId ? 'Update item' : 'Add item'}</button>
            {editingId && <button className="ghost-button" type="button" onClick={resetForm}>Cancel</button>}
          </div>
        </form>

        <div className="menu-grid">
          {menu.map((item) => (
            <article className="admin-menu-card" key={item.id}>
              <div className="food-art" style={{ width: '80px', height: '80px', overflow: 'hidden', backgroundImage: item.imageUrl ? `url(${item.imageUrl})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', margin: 0 }}>
                {!item.imageUrl && item.name.slice(0, 1)}
              </div>
              <div style={{ alignSelf: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{item.name}</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{item.category}</p>
                <div>
                  <span className={item.available ? 'success-pill' : 'danger-pill'}>
                    {item.available ? 'Available' : 'Out of Stock'}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', height: '100%' }}>
                <strong style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>₹{Number(item.price).toFixed(0)}</strong>
                <div className="table-actions">
                  <button type="button" onClick={() => startEdit(item)} title="Edit"><Pencil size={14} /></button>
                  <button type="button" className="danger-text" onClick={() => deleteItem(item.id)} title="Delete"><Trash2 size={14} /></button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
