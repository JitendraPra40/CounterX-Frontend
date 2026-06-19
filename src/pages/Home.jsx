import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Search, UtensilsCrossed, ArrowRight } from 'lucide-react';
import api from '../api/client.js';
import StatusMessage from '../components/StatusMessage.jsx';
import { useCart } from '../context/CartContext.jsx';

const categories = ['All Items', 'BREAKFAST', 'LUNCH', 'DINNER', 'SNACKS', 'BEVERAGE', 'DESSERT'];

export default function Home() {
  const { tableNumber: tableNumberParam } = useParams();
  const navigate = useNavigate();
  const { items, total, count, addItem, updateQuantity, clearCart } = useCart();
  
  const [menu, setMenu] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTable, setSelectedTable] = useState(tableNumberParam || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Items');
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    api.get('/api/menu')
      .then((response) => setMenu(response.data))
      .catch(() => setError('Could not load menu. Please try again.'));
  }, []);

  const filteredMenu = useMemo(() => {
    return menu.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All Items' || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [menu, searchQuery, activeCategory]);

  async function placeOrder() {
    if (!selectedTable) {
      setError('Please select a table number before placing the order.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const payload = {
        tableNumber: Number(selectedTable),
        items: items.map((item) => ({ menuItemId: item.id, quantity: item.quantity })),
      };
      const { data } = await api.post('/api/orders', payload);
      clearCart();
      navigate(`/payment/${data.orderId}`);
    } catch (err) {
      setError(err.response?.data?.messages?.[0] || 'Could not place order.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="customer-page">
      <nav className="top-navbar">
        <div className="nav-brand" style={{ fontStyle: 'italic', fontSize: '2rem', marginRight: '2rem', fontWeight: '900', letterSpacing: '-1px' }}>
          CounterX
        </div>
        
        <div className="search-container" style={{ flex: 1, maxWidth: '700px' }}>
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search for restaurant, cuisine or a dish" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Link to="/login" style={{ marginLeft: 'auto', padding: '0.5rem 1rem', textDecoration: 'none', color: 'var(--primary)', fontWeight: 'bold', border: '1px solid var(--primary)', borderRadius: '6px' }}>
          Admin Login
        </Link>
      </nav>

      <div className="category-pills">
        {categories.map(cat => (
          <button 
            key={cat} 
            className={`pill ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat === 'All Items' ? cat : cat.charAt(0) + cat.slice(1).toLowerCase()}
          </button>
        ))}
      </div>
      
      <StatusMessage type="error">{error}</StatusMessage>
      
      <main className="customer-grid">
        <section className="menu-sections">
          {filteredMenu.length > 0 ? (
            <div className="customer-menu">
              {filteredMenu.map((item) => (
                <article className="menu-card" key={item.id}>
                  <div className="food-art" style={{ backgroundImage: item.imageUrl ? `url(${item.imageUrl})` : 'none' }}>
                    {!item.imageUrl && item.name.slice(0, 1)}
                  </div>
                  <div className="menu-card-content">
                    <div>
                      <h4 style={{ fontSize: '1.2rem', margin: '0 0 0.25rem 0', color: 'var(--ink)' }}>{item.name}</h4>
                      <strong style={{ color: 'var(--ink)', fontSize: '1.1rem', fontWeight: '600' }}>
                        ₹{Number(item.price).toFixed(0)}
                      </strong>
                    </div>
                    <button className="add-button" type="button" onClick={() => addItem(item)}>
                      ADD <Plus size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">
                <UtensilsCrossed size={48} />
              </div>
              <h2 style={{ marginBottom: '0.5rem' }}>No items found</h2>
              <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>Try a different category or search term</p>
              <button className="pill" onClick={() => { setSearchQuery(''); setActiveCategory('All Items'); }}>
                Show All
              </button>
            </div>
          )}
        </section>
        
        {count > 0 && !isCartOpen && (
          <button 
            className="mobile-cart-btn" 
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart size={20} />
            <span>View Cart ({count})</span>
          </button>
        )}

        <aside className={`panel cart-panel ${isCartOpen ? 'open' : ''}`}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingCart size={24} style={{ color: 'var(--primary)' }} />
              <h2 style={{ color: 'var(--ink)', margin: 0 }}>Your Cart</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {count > 0 && <span style={{ background: '#fdf2f2', color: 'var(--primary)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>{count} items</span>}
              <button className="mobile-close-btn" type="button" onClick={() => setIsCartOpen(false)}>Close</button>
            </div>
          </div>
          
          <div className="cart-list">
            {items.map((item) => (
              <div className="cart-row" key={item.id}>
                <div>
                  <strong style={{ display: 'block', color: 'var(--ink)' }}>{item.name}</strong>
                  <small style={{ color: 'var(--muted)' }}>₹{Number(item.price).toFixed(0)} each</small>
                </div>
                <div className="stepper">
                  <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                    <Minus size={14} />
                  </button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ))}
            {!items.length && <p style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--muted)' }}>Your cart is empty.</p>}
          </div>
          <div className="cart-total">
            <span style={{ color: 'var(--muted)' }}>Total Amount</span>
            <strong style={{ fontSize: '1.6rem', color: 'var(--orange-dark)' }}>₹{total.toFixed(0)}</strong>
          </div>
          
          <div style={{ marginTop: '1rem', display: 'grid', gap: '0.75rem' }}>
            {!tableNumberParam && (
              <label>
                Select your table
                <select 
                  value={selectedTable} 
                  onChange={(e) => {
                    setSelectedTable(e.target.value);
                    setError('');
                  }}
                  required
                >
                  <option value="" disabled>Choose table...</option>
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>Table {num}</option>
                  ))}
                </select>
              </label>
            )}
            
            <button className="primary-button" type="button" disabled={!items.length || loading} onClick={placeOrder} style={{ width: '100%', padding: '1rem' }}>
              {loading ? 'Placing order...' : 'Place order'} <ArrowRight size={18} />
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}
