import { useEffect, useState } from 'react';
import api from '../api/client.js';
import StatusMessage from '../components/StatusMessage.jsx';

const emptyForm = {
  itemName: '',
  quantity: '',
  unit: 'kg',
  lowStockThreshold: '',
};

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function loadInventory() {
    const { data } = await api.get('/api/admin/inventory');
    setItems(data);
  }

  useEffect(() => {
    loadInventory().catch(() => setError('Could not load inventory. Please login again or start the backend server.'));
  }, []);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function startEdit(item) {
    setEditingId(item.id);
    setForm({
      itemName: item.itemName,
      quantity: item.quantity,
      unit: item.unit,
      lowStockThreshold: item.lowStockThreshold,
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
      quantity: Number(form.quantity),
      lowStockThreshold: Number(form.lowStockThreshold),
    };

    try {
      if (editingId) {
        await api.put(`/api/admin/inventory/${editingId}`, payload);
        setMessage('Inventory item updated.');
      } else {
        await api.post('/api/admin/inventory', payload);
        setMessage('Inventory item added.');
      }
      resetForm();
      await loadInventory();
    } catch (err) {
      setError(err.response?.data?.messages?.[0] || 'Inventory action failed.');
    } finally {
      setLoading(false);
    }
  }

  async function deleteItem(id) {
    setError('');
    setMessage('');
    try {
      await api.delete(`/api/admin/inventory/${id}`);
      setMessage('Inventory item deleted.');
      await loadInventory();
    } catch (err) {
      setError('Could not delete inventory item.');
    }
  }

  return (
    <section className="page-stack">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Stock Control</p>
          <h2>Inventory Management</h2>
        </div>
      </div>

      <StatusMessage type="success">{message}</StatusMessage>
      <StatusMessage type="error">{error}</StatusMessage>

      <div className="inventory-layout">
        <form className="panel form-panel" onSubmit={handleSubmit}>
          <h3>{editingId ? 'Edit Inventory' : 'Add Inventory'}</h3>
          <label>
            Item name
            <input required value={form.itemName} onChange={(event) => updateField('itemName', event.target.value)} placeholder="Rice" />
          </label>
          <div className="form-grid">
            <label>
              Quantity
              <input required type="number" min="0" step="0.01" value={form.quantity} onChange={(event) => updateField('quantity', event.target.value)} />
            </label>
            <label>
              Unit
              <select value={form.unit} onChange={(event) => updateField('unit', event.target.value)}>
                <option value="kg">kg</option>
                <option value="litre">litre</option>
                <option value="pieces">pieces</option>
                <option value="packets">packets</option>
              </select>
            </label>
          </div>
          <label>
            Low stock threshold
            <input required type="number" min="0" step="0.01" value={form.lowStockThreshold} onChange={(event) => updateField('lowStockThreshold', event.target.value)} />
          </label>
          <div className="button-row">
            <button className="primary-button" type="submit" disabled={loading}>{loading ? 'Saving...' : editingId ? 'Update item' : 'Add item'}</button>
            {editingId && <button className="ghost-button" type="button" onClick={resetForm}>Cancel</button>}
          </div>
        </form>

        <div className="panel table-panel">
          <div className="panel-heading">
            <h3>Current Stock</h3>
            <span>{items.length} records</span>
          </div>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Threshold</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.itemName}</td>
                    <td>{item.quantity} {item.unit}</td>
                    <td>{item.lowStockThreshold} {item.unit}</td>
                    <td><span className={item.lowStock ? 'danger-pill' : 'success-pill'}>{item.lowStock ? 'Low' : 'Good'}</span></td>
                    <td>
                      <div className="table-actions">
                        <button type="button" onClick={() => startEdit(item)}>Edit</button>
                        <button type="button" className="danger-text" onClick={() => deleteItem(item.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
