// @ts-nocheck
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import DEFAULT_PRODUCTS from './data/products';
import LoginForm from './pages/Auth/components/LoginForm';
import {
  BellIcon,
  ShoppingCartIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  CalendarDaysIcon,
  ClockIcon,
  PhoneIcon,
  HomeIcon,
  PhotoIcon,
  UserIcon,
  CameraIcon,
  SparklesIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  LightBulbIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';


const CATEGORIES = [
  'All',
  'Cakes',
  'Bread & Loaves',
  'Pastries & Savories',
  'Cookies & Bars',
];
const CAKE_IMAGE_OPTIONS = [
  {
    label: 'Pastel Dream Floral Cake Asset',
    value: '/images/birthday_cake.png',
  },
  {
    label: 'Golden Leaf Wedding Cake Asset',
    value: '/images/customized_cake.png',
  },
  {
    label: 'Double Fudge Dedication Cake Asset',
    value: '/images/dedication_cake.png',
  },
  { label: 'French Pastries Asset', value: '/images/french_pastries.png' },
];

// Sound effect simulator using Web Audio API to notify user/admin premium feel
const playSuccessSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';

    // Play a delightful two-tone chime
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    osc.start();

    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
    gain.gain.setValueAtTime(0.1, ctx.currentTime + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {
    // Ignore audio contexts restrictions in some browsers
  }
};

function App({ portalMode = 'user' } = {}) {
  // ==========================================================================
  // App Core States
  // ==========================================================================
  const { logout, isLoading, isAuthenticated } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState(
    portalMode === 'admin' ? 'admin-dashboard' : 'customer-home',
  ); // 'customer-home', 'customer-orders', 'admin-dashboard', 'admin-orders', 'admin-products'

  useEffect(() => {
    setActiveView(portalMode === 'admin' ? 'admin-dashboard' : 'customer-home');
  }, [portalMode]);

  // Data Persistence states
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('np_products');
    return saved ? JSON.parse(saved) : DEFAULT_PRODUCTS;
  });

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('np_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('np_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('np_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  // UI Interactive States
  const [selectedProduct, setSelectedProduct] = useState(null); // Product customization modal
  const [isCartOpen, setIsCartOpen] = useState(false); // Cart slide drawer toggle
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false); // Checkout dialog toggle
  const [adminDetailOrder, setAdminDetailOrder] = useState(null); // Admin inspect order details

  // Toast notifications for Admin in real time
  const [toasts, setToasts] = useState([]);
  const [shakingBell, setShakingBell] = useState(false);

  // Search & Catalog Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('popular'); // 'popular', 'price-asc', 'price-desc'

  // Admin section filter states
  const [adminOrderFilter, setAdminOrderFilter] = useState('All'); // 'All', 'Pending', 'Accepted', 'Preparing', 'Ready', 'Completed', 'Declined'

  // Product editor state (Add/Edit)
  const [editingProduct, setEditingProduct] = useState(null);
  const [isProductEditorOpen, setIsProductEditorOpen] = useState(false);
  const [isImageDragging, setIsImageDragging] = useState(false);
  const productImageInputRef = useRef(null);
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    price: '',
    description: '',
    category: 'Birthday Cakes',
    sizes: '6" Personal, 8" Celebration, 10" Grand',
    flavors: 'Vanilla Chiffon, Rich Chocolate Fudge, Mocha Mousse',
    image: '/images/birthday_cake.png',
  });

  const handleLogout = async () => {
    await logout();
    // stay on landing page after logout
    setIsLoginOpen(false);
  };

  // Save states to LocalStorage on modifications
  useEffect(() => {
    localStorage.setItem('np_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('np_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('np_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('np_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Handle toast timers
  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        setToasts((prev) => prev.slice(1));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toasts]);

  // If the login flow set a flag to open checkout, open it and clear flag
  useEffect(() => {
    try {
      const open = localStorage.getItem('openCheckout');
      if (open === '1') {
        setIsCheckoutOpen(true);
        localStorage.removeItem('openCheckout');
      }
    } catch (e) {}
  }, []);

  // If a page requested login (pendingCheckout flag), open the login modal
  useEffect(() => {
    try {
      const pending = localStorage.getItem('pendingCheckout');
      if (pending === '1') {
        setIsLoginOpen(true);
      }
    } catch (e) {}
  }, []);

  // ==========================================================================
  // Customer Functions
  // ==========================================================================

  // Add item to cart
  const handleAddToCart = (product, options) => {
    const cartItemId = Date.now().toString();
    const newCartItem = {
      cartItemId,
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: options.quantity,
      size: options.size,
      flavor: options.flavor,
      dedication: options.dedication,
    };

    setCart((prev) => [...prev, newCartItem]);
    setSelectedProduct(null);
    playSuccessSound();

    // Customer UI Alert
    addToast(`Added ${newCartItem.name} to cart!`, 'info');
  };

  // Adjust cart items
  const handleUpdateCartQty = (cartItemId, newQty) => {
    if (newQty <= 0) {
      setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.cartItemId === cartItemId ? { ...item, quantity: newQty } : item,
        ),
      );
    }
  };

  const handleRemoveCartItem = (cartItemId) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  // Checkout submission
  const handlePlaceOrder = (checkoutForm) => {
    const orderId = `#NP-${Math.floor(1000 + Math.random() * 9000)}`;
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const deliveryFee = checkoutForm.type === 'delivery' ? 50 : 0;
    const totalPrice = subtotal + deliveryFee;

    const newOrder = {
      id: orderId,
      customerName: checkoutForm.name,
      customerPhone: checkoutForm.phone,
      type: checkoutForm.type,
      address: checkoutForm.address,
      date: checkoutForm.date,
      time: checkoutForm.time,
      paymentMethod: checkoutForm.paymentMethod,
      receiptImg: checkoutForm.receiptImg,
      items: [...cart],
      status: 'Pending',
      remarks: '',
      createdAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      totalPrice,
    };

    // Update state
    setOrders((prev) => [newOrder, ...prev]);
    setCart([]); // Clear cart
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    playSuccessSound();

    // Generate notifications
    const customerNotif = {
      id: `cnotif-${Date.now()}`,
      text: `Your order ${orderId} has been submitted and is pending bakery approval.`,
      type: 'customer',
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      read: false,
    };

    const adminNotif = {
      id: `anotif-${Date.now()}`,
      text: `New order ${orderId} placed by ${checkoutForm.name}!`,
      type: 'admin',
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      read: false,
    };

    setNotifications((prev) => [customerNotif, adminNotif, ...prev]);

    // Trigger real-time Admin notification & sound alert
    setShakingBell(true);
    setTimeout(() => setShakingBell(false), 1000);
    addToast(
      `New live order placed by ${checkoutForm.name} (${orderId})!`,
      'admin-live',
      newOrder,
    );
  };

  const handleProceedCheckout = () => {
    if (!isAuthenticated) {
      // remember user intended to checkout and redirect to login
      localStorage.setItem('pendingCheckout', '1');
      setIsLoginOpen(true);
      return;
    }
    setIsCheckoutOpen(true);
  };

  const handleLoginSuccess = (user) => {
    setIsLoginOpen(false);
    if (user.role === 'admin') {
      navigate('/admin');
      return;
    }
    const pending = localStorage.getItem('pendingCheckout');
    if (pending) {
      localStorage.removeItem('pendingCheckout');
      setIsCheckoutOpen(true);
    }
  };

  // Helper to add temporary bottom-right toast messages
  const addToast = (text, type, data = null) => {
    setToasts((prev) => [...prev, { id: Date.now(), text, type, data }]);
  };

  // ==========================================================================
  // Admin Functions
  // ==========================================================================

  // Accept Order
  const handleAcceptOrder = (orderId, remarks = '') => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, status: 'Accepted', remarks }
          : order,
      ),
    );

    const order = orders.find((o) => o.id === orderId);

    // Notify Customer
    const notif = {
      id: `cnotif-${Date.now()}`,
      text: `Hooray! Nicai's Pastry accepted your order ${orderId}. Preparing now!`,
      type: 'customer',
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
    playSuccessSound();

    addToast(`Order ${orderId} accepted successfully!`, 'info');
    if (adminDetailOrder && adminDetailOrder.id === orderId) {
      setAdminDetailOrder((prev) => ({ ...prev, status: 'Accepted', remarks }));
    }
  };

  // Decline Order
  const handleDeclineOrder = (orderId, reason) => {
    if (!reason.trim()) {
      alert('Please provide a reason for declining the order.');
      return;
    }

    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, status: 'Declined', remarks: reason }
          : order,
      ),
    );

    // Notify Customer
    const notif = {
      id: `cnotif-${Date.now()}`,
      text: `Order ${orderId} was declined by the bakery. Reason: "${reason}".`,
      type: 'customer',
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);

    addToast(`Order ${orderId} was declined.`, 'warning');
    if (adminDetailOrder && adminDetailOrder.id === orderId) {
      setAdminDetailOrder((prev) => ({
        ...prev,
        status: 'Declined',
        remarks: reason,
      }));
    }
  };

  // Shift status progression
  const handleProgressOrder = (orderId, nextStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: nextStatus } : order,
      ),
    );

    const order = orders.find((o) => o.id === orderId);

    // Status text formatter
    let statusLabel = '';
    if (nextStatus === 'Preparing')
      statusLabel = 'is currently being baked with love!';
    if (nextStatus === 'Ready')
      statusLabel =
        order.type === 'delivery'
          ? 'is out for delivery!'
          : 'is ready for pickup at our shop!';
    if (nextStatus === 'Completed')
      statusLabel = 'has been fully completed. Enjoy your delicious cake!';

    // Notify Customer
    const notif = {
      id: `cnotif-${Date.now()}`,
      text: `Order ${orderId} ${statusLabel}`,
      type: 'customer',
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
    playSuccessSound();

    addToast(`Updated ${orderId} status to: ${nextStatus}`, 'info');
    if (adminDetailOrder && adminDetailOrder.id === orderId) {
      setAdminDetailOrder((prev) => ({ ...prev, status: nextStatus }));
    }
  };

  // Toggle dynamic product availability state
  const handleToggleProductStock = (productId) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? { ...product, available: !product.available }
          : product,
      ),
    );

    const prod = products.find((p) => p.id === productId);
    const stateText = !prod.available ? 'back in stock' : 'marked out of stock';
    addToast(`${prod.name} is now ${stateText}!`, 'info');
  };

  const setProductImageFromFile = (file) => {
    if (!file || !file.type || !file.type.startsWith('image/')) {
      alert('Please drop an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setNewProductForm((prev) => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const openNewProductEditor = () => {
    cancelProductEdit();
    setIsProductEditorOpen(true);
  };

  const handleImageInputChange = (e) => {
    const file = e.target.files?.[0];
    setProductImageFromFile(file);
    e.target.value = '';
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    setIsImageDragging(false);
    const file = e.dataTransfer.files?.[0];
    setProductImageFromFile(file);
  };

  const handleDeleteProduct = (productId) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const confirmed = window.confirm(
      `Delete ${product.name}? This cannot be undone.`,
    );
    if (!confirmed) return;

    setProducts((prev) =>
      prev.filter((productItem) => productItem.id !== productId),
    );

    if (editingProduct?.id === productId) {
      cancelProductEdit();
    }

    addToast(`Deleted product: ${product.name}`, 'warning');
  };

  // Add/Edit dynamic inventory
  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!newProductForm.name || !newProductForm.price) {
      alert('Please fill in the product name and price.');
      return;
    }

    if (editingProduct) {
      // Edit mode
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                name: newProductForm.name,
                price: parseFloat(newProductForm.price),
                description: newProductForm.description,
                category: newProductForm.category,
                sizes: newProductForm.sizes.split(',').map((s) => s.trim()),
                flavors: newProductForm.flavors.split(',').map((f) => f.trim()),
                image: newProductForm.image,
              }
            : p,
        ),
      );

      addToast(`Updated product: ${newProductForm.name}`, 'info');
      setEditingProduct(null);
    } else {
      // Add Mode
      const newProduct = {
        id: Date.now(),
        name: newProductForm.name,
        price: parseFloat(newProductForm.price),
        description: newProductForm.description,
        category: newProductForm.category,
        sizes: newProductForm.sizes.split(',').map((s) => s.trim()),
        flavors: newProductForm.flavors.split(',').map((f) => f.trim()),
        image: newProductForm.image,
        available: true,
      };

      setProducts((prev) => [...prev, newProduct]);
      addToast(`Added new product: ${newProduct.name}`, 'info');
    }

    cancelProductEdit();
  };

  const handleEditProductClick = (product) => {
    setEditingProduct(product);
    setNewProductForm({
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category,
      sizes: product.sizes.join(', '),
      flavors: product.flavors.join(', '),
      image: product.image,
    });
    setIsProductEditorOpen(true);
  };

  const cancelProductEdit = () => {
    setEditingProduct(null);
    setIsProductEditorOpen(false);
    setIsImageDragging(false);
    setNewProductForm({
      name: '',
      price: '',
      description: '',
      category: 'Birthday Cakes',
      sizes: '6" Personal, 8" Celebration, 10" Grand',
      flavors: 'Vanilla Chiffon, Rich Chocolate Fudge, Mocha Mousse',
      image: '/images/birthday_cake.png',
    });
  };

  // Clear unread notifications
  const handleMarkNotificationsRead = (type) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.type === type ? { ...notif, read: true } : notif,
      ),
    );
  };

  // ==========================================================================
  // Filters & Analytics Computations (useMemo)
  // ==========================================================================

  // Customer Filtering logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchSearch =
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchCategory =
          activeCategory === 'All' || product.category === activeCategory;
        return matchSearch && matchCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        return b.id - a.id; // popularity mock default
      });
  }, [products, searchQuery, activeCategory, sortBy]);

  // Admin Filtering logic for order queues
  const filteredAdminOrders = useMemo(() => {
    return orders.filter((order) => {
      if (adminOrderFilter === 'All') return true;
      return order.status.toLowerCase() === adminOrderFilter.toLowerCase();
    });
  }, [orders, adminOrderFilter]);

  // Dashboard Stats Calculations
  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === 'Pending').length;
    const accepted = orders.filter(
      (o) =>
        o.status === 'Accepted' ||
        o.status === 'Preparing' ||
        o.status === 'Ready',
    ).length;
    const declined = orders.filter((o) => o.status === 'Declined').length;
    const completed = orders.filter((o) => o.status === 'Completed').length;

    // Revenue calculations (only completed orders count as active sales!)
    const revenue = orders
      .filter((o) => o.status === 'Completed')
      .reduce((sum, o) => sum + o.totalPrice, 0);

    return { total, pending, accepted, declined, completed, revenue };
  }, [orders]);

  // Custom Notifications Counts
  const notifCounts = useMemo(() => {
    const customer = notifications.filter(
      (n) => n.type === 'customer' && !n.read,
    ).length;
    const admin = notifications.filter(
      (n) => n.type === 'admin' && !n.read,
    ).length;
    return { customer, admin };
  }, [notifications]);

  return (
    <div className="app-container">
      {/* IN-APP REALTIME ALERTS TOAST WRAPPER */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className="alert-toast">
              <div className="alert-toast-content">
              <BellIcon style={{ width: 20, height: 20 }} aria-hidden />
              <div>
                <strong>Notification</strong>
                <p style={{ fontSize: '12px', opacity: 0.9 }}>{toast.text}</p>
              </div>
            </div>
            {toast.type === 'admin-live' && (
              <button
                className="btn-sm btn-accept"
                onClick={() => {
                  setAdminDetailOrder(toast.data);
                  setActiveView('admin-orders');
                  setAdminOrderFilter('Pending');
                }}
                style={{ fontSize: '11px', padding: '4px 10px' }}
              >
                Inspect
              </button>
            )}
            <button
              className="alert-toast-close"
              onClick={() =>
                setToasts((prev) => prev.filter((t) => t.id !== toast.id))
              }
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* ==========================================================================
         CUSTOMER PORTAL SHELL
         ========================================================================== */}
      {activeView.startsWith('customer') && (
        <>
          <header className="glass-header">
            <div className="container header-inner">
              <div
                className="logo-link"
                onClick={() => setActiveView('customer-home')}
                style={{ cursor: 'pointer' }}
              >
                <div className="logo-icon">N</div>
                <div>
                  <h1 className="logo-text">Nicai's Pastry</h1>
                  <span className="logo-subtitle">Premium Confeitaria</span>
                </div>
              </div>

              <nav className="nav-actions">
                <button
                  className={`nav-link ${activeView === 'customer-home' ? 'active' : ''}`}
                  onClick={() => setActiveView('customer-home')}
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Cake Menu
                </button>
                <button
                  className={`nav-link ${activeView === 'customer-orders' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveView('customer-orders');
                    handleMarkNotificationsRead('customer');
                  }}
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                >
                  My Orders
                  {notifCounts.customer > 0 && (
                    <span
                      className="badge"
                      style={{ top: '-2px', right: '-12px' }}
                    >
                      {notifCounts.customer}
                    </span>
                  )}
                </button>

                {/* Cart Action */}
                <button
                  className="btn-icon"
                  onClick={() => setIsCartOpen(true)}
                >
                  <ShoppingCartIcon style={{ width: 20, height: 20 }} aria-hidden />
                  {cart.length > 0 && (
                    <span className="badge">
                      {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  )}
                </button>
                {!isAuthenticated ? (
                  <button
                    className="nav-link"
                    onClick={() => setIsLoginOpen(true)}
                    style={{
                      border: '1px solid var(--almond)',
                      background: 'var(--velvet-cream)',
                      cursor: 'pointer',
                    }}
                  >
                    Login
                  </button>
                ) : (
                  <button
                    className="nav-link"
                    onClick={handleLogout}
                    style={{
                      border: '1px solid var(--almond)',
                      background: 'var(--velvet-cream)',
                      cursor: 'pointer',
                    }}
                  >
                    Logout
                  </button>
                )}
              </nav>
            </div>
          </header>

          <main className="main-content">
            {/* VIEW 1: CUSTOMER CATALOG HOME */}
            {activeView === 'customer-home' && (
              <>
                <section className="hero-section">
                  <div className="container">
                    <h2 className="hero-title">
                      Sweet Moments Baked <span>With Love</span>
                    </h2>
                    <p className="hero-subtitle">
                      Explore our premium selection of celebration cakes,
                      dedication cakes, and gourmet French pastries. Custom-made
                      for your sweet indulgence.
                    </p>

                    {/* Search and Filters Bar */}
                    <div className="search-filter-bar">
                      <div className="search-input-wrapper">
                        <MagnifyingGlassIcon style={{ width: 18, height: 18 }} aria-hidden />
                        <input
                          type="text"
                          placeholder="Search for cakes, pastries, breads..."
                          className="search-input"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <div
                        style={{
                          height: '24px',
                          width: '1px',
                          backgroundColor: 'var(--almond)',
                        }}
                      ></div>
                      <div>
                        <select
                          className="sort-select"
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                        >
                          <option value="popular">Popularity</option>
                          <option value="price-asc">Price: Low to High</option>
                          <option value="price-desc">Price: High to Low</option>
                        </select>
                      </div>
                    </div>

                    {/* Horizontal Categories */}
                    <div className="categories-slider">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
                          onClick={() => setActiveCategory(cat)}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Product Catalog Grid */}
                <section className="catalog-section">
                  <div className="container">
                    <div className="section-header">
                      <h3 className="section-title">
                        {activeCategory} Selection
                      </h3>
                      <span className="results-count">
                        Showing {filteredProducts.length} premium creations
                      </span>
                    </div>

                    {filteredProducts.length === 0 ? (
                      <div
                        style={{
                          textAlign: 'center',
                          padding: '60px 0',
                          color: 'var(--cocoa)',
                        }}
                      >
                        <p style={{ fontSize: '18px' }}>
                          No delicacies found matching your selection.
                        </p>
                      </div>
                    ) : (
                      <div className="product-grid">
                        {filteredProducts.map((product) => (
                          <div
                            key={product.id}
                            className={`product-card ${!product.available ? 'unavailable' : ''}`}
                          >
                            {!product.available && (
                              <div className="sold-out-overlay">
                                <span className="sold-out-badge">Sold Out</span>
                              </div>
                            )}
                            <div className="card-img-wrapper">
                              <span className="card-badge">
                                {product.category}
                              </span>
                              <img
                                src={product.image}
                                alt={product.name}
                                className="card-img"
                              />
                            </div>
                            <div className="card-body">
                              <h4 className="card-title">{product.name}</h4>
                              <p className="card-desc">{product.description}</p>
                              <div className="card-footer">
                                <span className="card-price">
                                  ₱{product.price.toLocaleString()}
                                </span>
                                <button
                                  className="btn-card"
                                  disabled={!product.available}
                                  onClick={() => setSelectedProduct(product)}
                                >
                                  {product.available
                                    ? 'Order Now'
                                    : 'Out of Stock'}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              </>
            )}

            {/* VIEW 2: CUSTOMER ORDERS TRACKING */}
            {activeView === 'customer-orders' && (
              <section className="tracking-section">
                <div className="container" style={{ maxWidth: '900px' }}>
                  <h3
                    className="section-title"
                    style={{ marginBottom: '24px' }}
                  >
                    My Orders & Delivery Tracker
                  </h3>

                  {orders.length === 0 ? (
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '80px 24px',
                        backgroundColor: 'var(--velvet-cream)',
                        borderRadius: '20px',
                        border: '1px solid var(--almond)',
                      }}
                    >
                      <SparklesIcon style={{ fontSize: '48px', width: 48, height: 48, opacity: 0.3 }} aria-hidden />
                      <h4 style={{ margin: '16px 0 8px', fontSize: '20px' }}>
                        No orders placed yet!
                      </h4>
                      <p
                        style={{ color: 'var(--cocoa)', marginBottom: '24px' }}
                      >
                        Browse our delightful cake selections and place your
                        first sweet order today.
                      </p>
                      <button
                        className="btn-primary"
                        onClick={() => setActiveView('customer-home')}
                        style={{ maxWidth: '200px', margin: '0 auto' }}
                      >
                        Order Cakes Now
                      </button>
                    </div>
                  ) : (
                    orders.map((order) => {
                      // Calculate step indicator index for timeline
                      const statusSteps = [
                        'Pending',
                        'Accepted',
                        'Preparing',
                        'Ready',
                        'Completed',
                      ];
                      const activeIndex = statusSteps.indexOf(order.status);

                      return (
                        <div key={order.id} className="order-history-card">
                          <div className="order-history-header">
                            <div className="order-id-date">
                              <h4>Order Reference: {order.id}</h4>
                              <span>Submitted: {order.createdAt}</span>
                            </div>
                            <div>
                              <span
                                className={`status-badge ${order.status.toLowerCase()}`}
                              >
                                {order.status === 'Ready'
                                  ? order.type === 'delivery'
                                    ? 'Out for Delivery'
                                    : 'Ready for Pickup'
                                  : order.status}
                              </span>
                            </div>
                          </div>

                          {/* Graphical Timeline Progress Bar (only if not declined!) */}
                          {order.status !== 'Declined' && (
                            <div className="progress-bar-wrapper">
                              <div className="progress-line-bg"></div>
                              <div
                                className="progress-line-fill"
                                style={{
                                  width: `${(Math.max(0, activeIndex) / 4) * 100}%`,
                                }}
                              ></div>
                              <div className="progress-steps">
                                {statusSteps.map((step, idx) => {
                                  let label = step;
                                  if (step === 'Ready')
                                    label =
                                      order.type === 'delivery'
                                        ? 'Out for Delivery'
                                        : 'Ready for Pickup';

                                  let stepClass = '';
                                  if (idx < activeIndex)
                                    stepClass = 'completed';
                                  else if (idx === activeIndex)
                                    stepClass = 'active';

                                  return (
                                    <div
                                      key={step}
                                      className={`progress-step ${stepClass}`}
                                    >
                                      <div className="step-node">
                                        {idx < activeIndex ? <CheckIcon style={{ width: 14, height: 14 }} aria-hidden /> : ''}
                                      </div>
                                      <span className="step-label">
                                        {label}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {order.status === 'Declined' && (
                            <div className="order-remarks-alert">
                              <ExclamationTriangleIcon style={{ width: 18, height: 18 }} aria-hidden /> <strong>Bakery Notification:</strong> This
                              order was declined. <br />
                              <em>
                                Remarks: "
                                {order.remarks ||
                                  'Bakery is currently at full capacity.'}
                                "
                              </em>
                            </div>
                          )}

                          <div
                            className="order-history-body"
                            style={{ marginTop: '20px' }}
                          >
                            <div>
                              <h5
                                style={{
                                  fontSize: '15px',
                                  fontWeight: '700',
                                  marginBottom: '8px',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px',
                                  color: 'var(--cocoa)',
                                }}
                              >
                                Order Details
                              </h5>
                              <ul style={{ listStyle: 'none' }}>
                                {order.items.map((item) => (
                                  <li
                                    key={item.cartItemId}
                                    style={{
                                      marginBottom: '8px',
                                      fontSize: '14px',
                                    }}
                                  >
                                    <strong>{item.quantity}x</strong>{' '}
                                    {item.name}
                                    <span
                                      style={{
                                        fontSize: '11px',
                                        color: 'var(--cocoa)',
                                        display: 'block',
                                        paddingLeft: '24px',
                                      }}
                                    >
                                      Size: {item.size} | Flavor: {item.flavor}
                                      {item.dedication &&
                                        ` | Dedication: "${item.dedication}"`}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div
                              style={{
                                backgroundColor: 'var(--alabaster)',
                                padding: '16px',
                                borderRadius: '12px',
                                border: '1px solid var(--almond)',
                              }}
                            >
                              <h5
                                style={{
                                  fontSize: '14px',
                                  fontWeight: '700',
                                  marginBottom: '8px',
                                }}
                              >
                                Delivery/Pickup Schedule
                              </h5>
                              <p
                                style={{
                                  fontSize: '13px',
                                  color: 'var(--espresso)',
                                  marginBottom: '8px',
                                }}
                              >
                                <MapPinIcon style={{ width: 14, height: 14 }} aria-hidden /> <strong>Type:</strong>{' '}
                                {order.type === 'delivery'
                                  ? 'Home Delivery'
                                  : 'Store Pickup'}
                                <br />
                                <CalendarDaysIcon style={{ width: 14, height: 14 }} aria-hidden /> <strong>Preferred Date:</strong> {order.date}
                                <br />
                                <ClockIcon style={{ width: 14, height: 14 }} aria-hidden /> <strong>Preferred Time:</strong> {order.time}
                                <br />
                                <PhoneIcon style={{ width: 14, height: 14 }} aria-hidden /> <strong>Contact:</strong>{' '}
                                {order.customerPhone}
                              </p>
                              {order.type === 'delivery' && (
                                <p
                                  style={{
                                    fontSize: '12px',
                                    color: 'var(--cocoa)',
                                    borderTop: '1px solid var(--almond)',
                                    paddingTop: '6px',
                                  }}
                                >
                                  <HomeIcon style={{ width: 14, height: 14 }} aria-hidden /> <strong>Address:</strong> {order.address}
                                </p>
                              )}
                              <div
                                style={{
                                  borderTop: '1.5px solid var(--almond)',
                                  marginTop: '10px',
                                  paddingTop: '8px',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  fontWeight: '700',
                                }}
                              >
                                <span>Total Paid:</span>
                                <span>
                                  ₱{order.totalPrice.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>
            )}
          </main>
        </>
      )}

      {/* ==========================================================================
         ADMIN PORTAL SHELL
         ========================================================================== */}
      {activeView.startsWith('admin') && (
        <>
          <header
            className="glass-header"
            style={{ borderBottomColor: 'var(--secondary)' }}
          >
            <div className="container header-inner">
              <div
                className="logo-link"
                onClick={() => setActiveView('admin-dashboard')}
                style={{ cursor: 'pointer' }}
              >
                <div
                  className="logo-icon"
                  style={{
                    backgroundColor: 'var(--secondary-light)',
                    color: 'var(--secondary)',
                    borderColor: 'var(--secondary)',
                  }}
                >
                  A
                </div>
                <div>
                  <h1 className="logo-text">Nicai's Admin</h1>
                  <span
                    className="logo-subtitle"
                    style={{ color: 'var(--secondary)' }}
                  >
                    Bakery Control Hub
                  </span>
                </div>
              </div>

              <nav className="nav-actions">
                <button
                  className={`nav-link ${activeView === 'admin-dashboard' ? 'active' : ''}`}
                  onClick={() => setActiveView('admin-dashboard')}
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Dashboard
                </button>
                <button
                  className={`nav-link ${activeView === 'admin-orders' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveView('admin-orders');
                    handleMarkNotificationsRead('admin');
                  }}
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                >
                  Order Queue
                  {notifCounts.admin > 0 && (
                    <span
                      className="badge"
                      style={{
                        backgroundColor: 'var(--secondary)',
                        color: 'var(--espresso)',
                        top: '-2px',
                        right: '-12px',
                      }}
                    >
                      {notifCounts.admin}
                    </span>
                  )}
                </button>
                <button
                  className={`nav-link ${activeView === 'admin-products' ? 'active' : ''}`}
                  onClick={() => setActiveView('admin-products')}
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Stock Editor
                </button>
                <button
                  className="nav-link"
                  onClick={!isAuthenticated ? () => setIsLoginOpen(true) : handleLogout}
                  style={{
                    border: '1px solid var(--almond)',
                    background: 'var(--velvet-cream)',
                    cursor: 'pointer',
                  }}
                >
                  {!isAuthenticated ? 'Login' : 'Logout'}
                </button>
              </nav>
            </div>
          </header>

          <main className="main-content">
            {/* VIEW 1: ADMIN ANALYTICS DASHBOARD */}
            {activeView === 'admin-dashboard' && (
              <section className="admin-layout">
                <div className="container">
                  <div className="admin-header-row">
                    <h2 className="admin-view-title">Operational Overview</h2>
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: 'var(--cocoa)',
                      }}
                    >
                      Live Status: Connected
                    </span>
                  </div>

                  {/* Operational Metrics grid */}
                  <div className="stat-grid">
                    <div className="stat-card stat-pending">
                      <span className="stat-title">Pending Approvals</span>
                      <span
                        className="stat-val"
                        style={{ color: 'var(--primary)' }}
                      >
                        {stats.pending}
                      </span>
                    </div>
                    <div className="stat-card stat-accepted">
                      <span className="stat-title">Active Baking Queue</span>
                      <span
                        className="stat-val"
                        style={{ color: 'var(--success)' }}
                      >
                        {stats.accepted}
                      </span>
                    </div>
                    <div className="stat-card stat-declined">
                      <span className="stat-title">Declined Requests</span>
                      <span
                        className="stat-val"
                        style={{ color: 'var(--danger)' }}
                      >
                        {stats.declined}
                      </span>
                    </div>
                    <div className="stat-card stat-sales">
                      <span className="stat-title">Total Sales Revenue</span>
                      <span
                        className="stat-val"
                        style={{ color: 'var(--espresso)' }}
                      >
                        ₱{stats.revenue.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Visual SVG chart representation of sales trend */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.2fr 0.8fr',
                      gap: '32px',
                      marginTop: '32px',
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: 'var(--velvet-cream)',
                        padding: '24px',
                        borderRadius: '20px',
                        border: '1px solid var(--almond)',
                      }}
                    >
                      <h4
                        style={{
                          fontSize: '20px',
                          marginBottom: '16px',
                          fontFamily: 'var(--font-sans)',
                          fontWeight: '700',
                        }}
                      >
                        Sales Analytics Trends
                      </h4>
                      <div
                        style={{
                          height: '220px',
                          width: '100%',
                          position: 'relative',
                        }}
                      >
                        {/* Custom beautiful responsive SVG graphic curve representing sales! */}
                        <svg
                          viewBox="0 0 500 200"
                          style={{ width: '100%', height: '100%' }}
                        >
                          <defs>
                            <linearGradient
                              id="chartGrad"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="var(--primary)"
                                stopOpacity="0.2"
                              />
                              <stop
                                offset="100%"
                                stopColor="var(--primary)"
                                stopOpacity="0.0"
                              />
                            </linearGradient>
                          </defs>
                          {/* Grid lines */}
                          <line
                            x1="50"
                            y1="20"
                            x2="480"
                            y2="20"
                            stroke="#f0e6dd"
                            strokeWidth="1"
                            strokeDasharray="4"
                          />
                          <line
                            x1="50"
                            y1="70"
                            x2="480"
                            y2="70"
                            stroke="#f0e6dd"
                            strokeWidth="1"
                            strokeDasharray="4"
                          />
                          <line
                            x1="50"
                            y1="120"
                            x2="480"
                            y2="120"
                            stroke="#f0e6dd"
                            strokeWidth="1"
                            strokeDasharray="4"
                          />
                          <line
                            x1="50"
                            y1="170"
                            x2="480"
                            y2="170"
                            stroke="#f0e6dd"
                            strokeWidth="1"
                          />

                          {/* Data points path */}
                          <path
                            d="M 50 160 Q 120 130 190 90 T 330 60 T 480 30 L 480 170 L 50 170 Z"
                            fill="url(#chartGrad)"
                          />
                          <path
                            d="M 50 160 Q 120 130 190 90 T 330 60 T 480 30"
                            fill="none"
                            stroke="var(--primary)"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                          />
                          {/* Dot markers */}
                          <circle
                            cx="50"
                            cy="160"
                            r="5"
                            fill="var(--espresso)"
                            stroke="var(--primary)"
                            strokeWidth="2"
                          />
                          <circle
                            cx="120"
                            cy="130"
                            r="5"
                            fill="var(--espresso)"
                            stroke="var(--primary)"
                            strokeWidth="2"
                          />
                          <circle
                            cx="190"
                            cy="90"
                            r="5"
                            fill="var(--espresso)"
                            stroke="var(--primary)"
                            strokeWidth="2"
                          />
                          <circle
                            cx="330"
                            cy="60"
                            r="5"
                            fill="var(--espresso)"
                            stroke="var(--primary)"
                            strokeWidth="2"
                          />
                          <circle
                            cx="480"
                            cy="30"
                            r="5"
                            fill="var(--espresso)"
                            stroke="var(--primary)"
                            strokeWidth="2"
                          />

                          {/* Labels */}
                          <text
                            x="50"
                            y="190"
                            fill="var(--cocoa)"
                            fontSize="10"
                            textAnchor="middle"
                          >
                            Mon
                          </text>
                          <text
                            x="120"
                            y="190"
                            fill="var(--cocoa)"
                            fontSize="10"
                            textAnchor="middle"
                          >
                            Tue
                          </text>
                          <text
                            x="190"
                            y="190"
                            fill="var(--cocoa)"
                            fontSize="10"
                            textAnchor="middle"
                          >
                            Wed
                          </text>
                          <text
                            x="330"
                            y="190"
                            fill="var(--cocoa)"
                            fontSize="10"
                            textAnchor="middle"
                          >
                            Thu
                          </text>
                          <text
                            x="480"
                            y="190"
                            fill="var(--cocoa)"
                            fontSize="10"
                            textAnchor="middle"
                          >
                            Fri
                          </text>

                          <text
                            x="40"
                            y="24"
                            fill="var(--cocoa)"
                            fontSize="10"
                            textAnchor="end"
                          >
                            ₱10k
                          </text>
                          <text
                            x="40"
                            y="74"
                            fill="var(--cocoa)"
                            fontSize="10"
                            textAnchor="end"
                          >
                            ₱5k
                          </text>
                          <text
                            x="40"
                            y="124"
                            fill="var(--cocoa)"
                            fontSize="10"
                            textAnchor="end"
                          >
                            ₱2k
                          </text>
                          <text
                            x="40"
                            y="174"
                            fill="var(--cocoa)"
                            fontSize="10"
                            textAnchor="end"
                          >
                            0
                          </text>
                        </svg>
                      </div>
                    </div>

                    <div
                      style={{
                        backgroundColor: 'var(--velvet-cream)',
                        padding: '24px',
                        borderRadius: '20px',
                        border: '1px solid var(--almond)',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <h4
                        style={{
                          fontSize: '20px',
                          marginBottom: '16px',
                          fontFamily: 'var(--font-sans)',
                          fontWeight: '700',
                        }}
                      >
                        Recent Queue Alerts
                      </h4>
                      <div
                        style={{
                          overflowY: 'auto',
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                        }}
                      >
                        {orders.filter((o) => o.status === 'Pending').length ===
                        0 ? (
                          <div
                            style={{
                              textAlign: 'center',
                              padding: '40px 0',
                              color: 'var(--cocoa)',
                              margin: 'auto',
                            }}
                          >
                            <SparklesIcon style={{ width: 20, height: 20 }} aria-hidden />
                            <p style={{ fontSize: '14px', marginTop: '8px' }}>
                              Approval list is fully cleared!
                            </p>
                          </div>
                        ) : (
                          orders
                            .filter((o) => o.status === 'Pending')
                            .slice(0, 3)
                            .map((order) => (
                              <div
                                key={order.id}
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  padding: '12px',
                                  border: '1px solid var(--almond)',
                                  borderRadius: '12px',
                                  cursor: 'pointer',
                                  backgroundColor: 'var(--alabaster)',
                                }}
                                onClick={() => {
                                  setAdminDetailOrder(order);
                                  setActiveView('admin-orders');
                                  setAdminOrderFilter('Pending');
                                }}
                              >
                                <div>
                                  <strong
                                    style={{
                                      fontSize: '13px',
                                      color: 'var(--primary)',
                                    }}
                                  >
                                    {order.id}
                                  </strong>
                                  <span
                                    style={{
                                      display: 'block',
                                      fontSize: '13px',
                                      fontWeight: '600',
                                    }}
                                  >
                                    {order.customerName}
                                  </span>
                                  <span
                                    style={{
                                      display: 'block',
                                      fontSize: '11px',
                                      color: 'var(--cocoa)',
                                    }}
                                  >
                                    {order.items.length} item(s) • ₱
                                    {order.totalPrice}
                                  </span>
                                </div>
                                <span
                                  style={{
                                    fontSize: '11px',
                                    color: 'var(--primary)',
                                    fontWeight: '700',
                                    textTransform: 'uppercase',
                                    alignSelf: 'center',
                                  }}
                                >
                                  Inspect
                                </span>
                              </div>
                            ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* VIEW 2: ADMIN LIVE ORDERS BOARD & APPROVAL */}
            {activeView === 'admin-orders' && (
              <section className="admin-layout">
                <div className="container" style={{ maxWidth: '1000px' }}>
                  <div className="admin-header-row">
                    <h2 className="admin-view-title">Order Processing Board</h2>
                    <span
                      style={{
                        fontSize: '14px',
                        color: 'var(--cocoa)',
                        fontWeight: '500',
                      }}
                    >
                      Approvals queue updates live.
                    </span>
                  </div>

                  <div className="admin-board">
                    {/* Status selection tabs */}
                    <div className="board-filters">
                      {[
                        'All',
                        'Pending',
                        'Accepted',
                        'Preparing',
                        'Ready',
                        'Completed',
                        'Declined',
                      ].map((tab) => {
                        const count =
                          tab === 'All'
                            ? orders.length
                            : orders.filter((o) => o.status === tab).length;
                        return (
                          <div
                            key={tab}
                            className={`board-filter-tab ${adminOrderFilter === tab ? 'active' : ''}`}
                            onClick={() => setAdminOrderFilter(tab)}
                          >
                            {tab === 'Ready' ? 'Out for Delivery / Ready' : tab}{' '}
                            ({count})
                          </div>
                        );
                      })}
                    </div>

                    <div className="board-list">
                      {filteredAdminOrders.length === 0 ? (
                        <div
                          style={{
                            textAlign: 'center',
                            padding: '60px 0',
                            color: 'var(--cocoa)',
                          }}
                        >
                          <p style={{ fontSize: '16px' }}>
                            No orders found in this queue.
                          </p>
                        </div>
                      ) : (
                        filteredAdminOrders.map((order) => (
                          <div key={order.id} className="board-row">
                            <div className="admin-order-meta">
                              <span className="admin-order-id-badge">
                                {order.id}
                              </span>
                              <div className="admin-order-brief">
                                <h5>{order.customerName}</h5>
                                <span>
                                  {order.items.length} product(s) • Total: ₱
                                  {order.totalPrice.toLocaleString()} •
                                  Requested: {order.date} @ {order.time}
                                </span>
                              </div>
                            </div>
                            <div className="admin-order-actions">
                              <span
                                className={`status-badge ${order.status.toLowerCase()}`}
                                style={{ marginRight: '12px' }}
                              >
                                {order.status}
                              </span>

                              {/* Dynamic controls depending on status states! */}
                              {order.status === 'Pending' && (
                                <>
                                  <button
                                    className="btn-sm btn-review"
                                    onClick={() => setAdminDetailOrder(order)}
                                  >
                                    Review Receipt
                                  </button>
                                </>
                              )}

                              {order.status === 'Accepted' && (
                                <button
                                  className="btn-sm btn-accept"
                                  onClick={() =>
                                    handleProgressOrder(order.id, 'Preparing')
                                  }
                                >
                                  Begin Baking
                                </button>
                              )}

                              {order.status === 'Preparing' && (
                                <button
                                  className="btn-sm btn-review"
                                  onClick={() =>
                                    handleProgressOrder(order.id, 'Ready')
                                  }
                                >
                                  Mark Ready / Dispatch
                                </button>
                              )}

                              {order.status === 'Ready' && (
                                <button
                                  className="btn-sm btn-accept"
                                  onClick={() =>
                                    handleProgressOrder(order.id, 'Completed')
                                  }
                                >
                                  Complete Order
                                </button>
                              )}

                              {order.status !== 'Pending' && (
                                <button
                                  className="btn-sm btn-decline"
                                  onClick={() => setAdminDetailOrder(order)}
                                  style={{
                                    padding: '6px 12px',
                                    fontSize: '11px',
                                    background: 'rgba(42, 29, 25, 0.05)',
                                    color: 'var(--espresso)',
                                  }}
                                >
                                  Inspect Details
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* VIEW 3: STOCK & INVENTORY EDITOR */}
            {activeView === 'admin-products' && (
              <section className="admin-layout">
                <div className="container">
                  <div className="admin-header-row">
                    <h2 className="admin-view-title">
                      Dynamic Product Inventory
                    </h2>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span style={{ fontSize: '14px', color: 'var(--cocoa)' }}>
                        Modify menu prices and toggle stock states in real-time.
                      </span>
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={openNewProductEditor}
                      >
                        Add New Cake
                      </button>
                    </div>
                  </div>

                  <div
                    className="inventory-grid"
                    style={{ gridTemplateColumns: '1fr' }}
                  >
                    {/* List section */}
                    <div className="inventory-list-box">
                      <h4
                        style={{
                          fontSize: '20px',
                          marginBottom: '16px',
                          fontFamily: 'var(--font-sans)',
                          fontWeight: '700',
                        }}
                      >
                        Active Bakery Catalog
                      </h4>

                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {products.map((product) => (
                          <div key={product.id} className="inventory-item-row">
                            <div className="inventory-item-meta">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="inventory-item-thumb"
                              />
                              <div className="inventory-item-title">
                                <h5>{product.name}</h5>
                                <span>
                                  ₱{product.price.toLocaleString()} •{' '}
                                  {product.category}
                                </span>
                              </div>
                            </div>
                            <div className="inventory-item-controls">
                              {/* Edit details */}
                              <button
                                className="btn-sm btn-review"
                                style={{
                                  padding: '6px 14px',
                                  fontSize: '12px',
                                }}
                                onClick={() => handleEditProductClick(product)}
                              >
                                Edit
                              </button>

                              <button
                                className="btn-sm"
                                style={{
                                  padding: '6px 14px',
                                  fontSize: '12px',
                                  background: 'var(--danger-light)',
                                  color: 'var(--danger)',
                                  border: '1px solid rgba(184, 92, 92, 0.25)',
                                }}
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                Delete
                              </button>

                              {/* Switcher availability toggle */}
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    color: product.available
                                      ? 'var(--success)'
                                      : 'var(--danger)',
                                  }}
                                >
                                  {product.available ? 'In Stock' : 'Sold Out'}
                                </span>
                                <label className="switch">
                                  <input
                                    type="checkbox"
                                    checked={product.available}
                                    onChange={() =>
                                      handleToggleProductStock(product.id)
                                    }
                                  />
                                  <span className="slider"></span>
                                </label>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {isProductEditorOpen && (
                  <div className="modal-backdrop" onClick={cancelProductEdit}>
                    <div
                      className="modal-wrapper"
                      onClick={(e) => e.stopPropagation()}
                      style={{ maxWidth: '980px' }}
                    >
                      <button
                        className="modal-close"
                        onClick={cancelProductEdit}
                      >
                        ×
                      </button>
                      <div className="checkout-modal-inner">
                        <h3
                          className="modal-title"
                          style={{
                            borderBottom: '1.5px solid var(--almond)',
                            paddingBottom: '12px',
                            marginBottom: '24px',
                          }}
                        >
                          {editingProduct
                            ? 'Edit Creation'
                            : 'Add New Bakery Creation'}
                        </h3>

                        <div className="product-editor-modal-grid">
                          <div className="product-image-dropzone-wrap">
                            <input
                              ref={productImageInputRef}
                              type="file"
                              accept="image/*"
                              hidden
                              onChange={handleImageInputChange}
                            />

                            <div
                              className={`product-image-dropzone ${isImageDragging ? 'dragging' : ''}`}
                              onClick={() =>
                                productImageInputRef.current?.click()
                              }
                              onDragOver={(e) => {
                                e.preventDefault();
                                setIsImageDragging(true);
                              }}
                              onDragLeave={() => setIsImageDragging(false)}
                              onDrop={handleImageDrop}
                            >
                              <img
                                src={newProductForm.image}
                                alt="Product preview"
                                className="product-image-preview"
                              />
                              <strong>Drop an image here</strong>
                              <span>or click to upload a local file</span>
                            </div>

                            <div className="product-image-presets">
                              {CAKE_IMAGE_OPTIONS.map((option) => (
                                <button
                                  key={option.value}
                                  type="button"
                                  className={`product-image-preset ${newProductForm.image === option.value ? 'active' : ''}`}
                                  onClick={() =>
                                    setNewProductForm((prev) => ({
                                      ...prev,
                                      image: option.value,
                                    }))
                                  }
                                >
                                  <img src={option.value} alt={option.label} />
                                  <span>{option.label}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          <form
                            onSubmit={handleSaveProduct}
                            className="product-form-box"
                            style={{ position: 'static', marginTop: 0 }}
                          >
                            <div className="form-group">
                              <label className="form-label">
                                Delicacy Name
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="e.g. Strawberry Velvet Gateau"
                                value={newProductForm.name}
                                onChange={(e) =>
                                  setNewProductForm((prev) => ({
                                    ...prev,
                                    name: e.target.value,
                                  }))
                                }
                                required
                              />
                            </div>

                            <div className="form-row">
                              <div className="form-group">
                                <label className="form-label">Price (₱)</label>
                                <input
                                  type="number"
                                  className="form-control"
                                  placeholder="e.g. 950"
                                  value={newProductForm.price}
                                  onChange={(e) =>
                                    setNewProductForm((prev) => ({
                                      ...prev,
                                      price: e.target.value,
                                    }))
                                  }
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label className="form-label">Category</label>
                                <select
                                  className="form-control"
                                  value={newProductForm.category}
                                  onChange={(e) =>
                                    setNewProductForm((prev) => ({
                                      ...prev,
                                      category: e.target.value,
                                    }))
                                  }
                                >
                                  {CATEGORIES.slice(1).map((cat) => (
                                    <option key={cat} value={cat}>
                                      {cat}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="form-group">
                              <label className="form-label">Description</label>
                              <textarea
                                className="form-control"
                                style={{
                                  height: '70px',
                                  padding: '10px',
                                  resize: 'none',
                                }}
                                placeholder="Describe visual accents and layers..."
                                value={newProductForm.description}
                                onChange={(e) =>
                                  setNewProductForm((prev) => ({
                                    ...prev,
                                    description: e.target.value,
                                  }))
                                }
                              />
                            </div>

                            <div className="form-group">
                              <label className="form-label">
                                Available Sizes (Comma Separated)
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                value={newProductForm.sizes}
                                onChange={(e) =>
                                  setNewProductForm((prev) => ({
                                    ...prev,
                                    sizes: e.target.value,
                                  }))
                                }
                              />
                            </div>

                            <div className="form-group">
                              <label className="form-label">
                                Available Flavors (Comma Separated)
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                value={newProductForm.flavors}
                                onChange={(e) =>
                                  setNewProductForm((prev) => ({
                                    ...prev,
                                    flavors: e.target.value,
                                  }))
                                }
                              />
                            </div>

                            <div
                              style={{
                                display: 'flex',
                                gap: '12px',
                                marginTop: '24px',
                              }}
                            >
                              <button
                                type="button"
                                className="btn-primary"
                                onClick={cancelProductEdit}
                                style={{
                                  background: 'none',
                                  border: '1px solid var(--almond)',
                                  color: 'var(--cocoa)',
                                  boxShadow: 'none',
                                }}
                              >
                                Cancel
                              </button>
                              <button type="submit" className="btn-primary">
                                {editingProduct
                                  ? 'Save Changes'
                                  : 'Publish Delicacy'}
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )}
          </main>
        </>
      )}

      {/* ==========================================================================
         CUSTOMER MODAL 1: PRODUCT CUSTOMIZATION DIALOG
         ========================================================================== */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* ==========================================================================
         CUSTOMER DRAWER: SHOPPING CART SLIDER
         ========================================================================== */}
      {isCartOpen && (
        <CartDrawer
          cart={cart}
          onClose={() => setIsCartOpen(false)}
          onUpdateQty={handleUpdateCartQty}
          onRemove={handleRemoveCartItem}
          onProceedCheckout={handleProceedCheckout}
        />
      )}

      {/* ==========================================================================
         CUSTOMER MODAL 2: CHECKOUT DIALOG
         ========================================================================== */}
      {isCheckoutOpen && (
        <CheckoutModal
          cart={cart}
          onClose={() => setIsCheckoutOpen(false)}
          onSubmit={handlePlaceOrder}
        />
      )}

      {/* ==========================================================================
         ADMIN MODAL: INSPECT ORDER & ACTION MANAGER
         ========================================================================== */}
      {adminDetailOrder && (
        <AdminDetailModal
          order={adminDetailOrder}
          onClose={() => setAdminDetailOrder(null)}
          onAccept={handleAcceptOrder}
          onDecline={handleDeclineOrder}
          onProgress={handleProgressOrder}
        />
      )}

        {/* Login Modal (opens instead of redirecting to /login) */}
        {isLoginOpen && (
          <div className="modal-backdrop" onClick={() => setIsLoginOpen(false)}>
            <div
              className="modal-wrapper"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '420px' }}
            >
              <button className="modal-close" onClick={() => setIsLoginOpen(false)}>
                ×
              </button>
              <div className="checkout-modal-inner">
                <h3 className="modal-title">Sign in</h3>
                <LoginForm onSuccess={handleLoginSuccess} />
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

// ==========================================================================
// Helper Sub-Component 1: Product Customization Modal
// ==========================================================================
function ProductModal({ product, onClose, onAddToCart }) {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [selectedFlavor, setSelectedFlavor] = useState(product.flavors[0]);
  const [dedication, setDedication] = useState('');
  const [quantity, setQuantity] = useState(1);

  const charLimit = 40;

  const handleSubmit = () => {
    onAddToCart(product, {
      size: selectedSize,
      flavor: selectedFlavor,
      dedication: product.category.includes('Cakes') ? dedication : '',
      quantity,
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-wrapper"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '720px' }}
      >
        <button className="modal-close" onClick={onClose}>
          ×
        </button>

        <div className="modal-grid">
          <div className="modal-visuals">
            <div className="modal-img-frame">
              <img
                src={product.image}
                alt={product.name}
                className="modal-img"
              />
            </div>
            <h4
              style={{
                fontSize: '20px',
                marginTop: '16px',
                textAlign: 'center',
              }}
            >
              ₱{product.price}
            </h4>
          </div>

          <div className="modal-details">
            <h3 className="modal-title">{product.name}</h3>
            <p className="modal-desc">{product.description}</p>

            {/* Custom options: size */}
            <div className="option-group">
              <span className="option-label">Select Cake Size</span>
              <div className="option-selector">
                {product.sizes.map((size) => (
                  <label key={size} className="radio-tile-wrapper">
                    <input
                      type="radio"
                      name="size-options"
                      className="radio-tile-input"
                      checked={selectedSize === size}
                      onChange={() => setSelectedSize(size)}
                    />
                    <span className="radio-tile-content">{size}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Custom options: flavors */}
            <div className="option-group">
              <span className="option-label">Select Flavor Selection</span>
              <div
                className="option-selector"
                style={{ gridTemplateColumns: '1fr' }}
              >
                {product.flavors.map((flavor) => (
                  <label
                    key={flavor}
                    className="radio-tile-wrapper"
                    style={{ width: '100%' }}
                  >
                    <input
                      type="radio"
                      name="flavor-options"
                      className="radio-tile-input"
                      checked={selectedFlavor === flavor}
                      onChange={() => setSelectedFlavor(flavor)}
                    />
                    <span
                      className="radio-tile-content"
                      style={{ textAlign: 'left', paddingLeft: '16px' }}
                    >
                      {flavor}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Custom options: dedication message (rendered only for cakes!) */}
            {product.category.includes('Cakes') && (
              <div className="option-group">
                <span className="option-label">
                  Dedication Message (Optional)
                </span>
                <textarea
                  className="dedication-textarea"
                  placeholder="e.g. Happy 21st Birthday Sarah!"
                  maxLength={charLimit}
                  value={dedication}
                  onChange={(e) => setDedication(e.target.value)}
                />
                <span className="char-counter">
                  {dedication.length} / {charLimit} characters
                </span>
              </div>
            )}

            {/* Qty and action */}
            <div className="qty-submit-row">
              <div className="qty-counter">
                <button
                  className="qty-btn"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                >
                  −
                </button>
                <span className="qty-val">{quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => setQuantity((prev) => prev + 1)}
                >
                  +
                </button>
              </div>

              <button className="btn-primary" onClick={handleSubmit}>
                Add to Cart • ₱{(product.price * quantity).toLocaleString()}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Resume checkout if login set a flag
// (This runs once when App mounts in the browser)
if (typeof window !== 'undefined') {
  try {
    const open = localStorage.getItem('openCheckout');
    if (open === '1') {
      // remove flag so it doesn't reopen repeatedly
      localStorage.removeItem('openCheckout');
    }
  } catch (e) {}
}

// ==========================================================================
// Helper Sub-Component 2: Shopping Cart Drawer
// ==========================================================================
function CartDrawer({
  cart,
  onClose,
  onUpdateQty,
  onRemove,
  onProceedCheckout,
}) {
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <>
      <div className="cart-drawer-overlay" onClick={onClose}></div>
      <div className="cart-drawer">
        <div className="cart-header">
          <h3 className="cart-title"><PhotoIcon style={{ width: 20, height: 20, marginRight: 8 }} aria-hidden /> Your Basket</h3>
          <button className="cart-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="cart-body">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <ShoppingCartIcon style={{ width: 36, height: 36 }} className="cart-empty-icon" aria-hidden />
              <h4>Your basket is currently empty</h4>
              <p style={{ fontSize: '13px', marginTop: '6px' }}>
                Browse our catalog to select delicious pastries and customize
                your celebration cakes!
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.cartItemId} className="cart-item">
                <img
                  src={item.image}
                  alt={item.name}
                  className="cart-item-img"
                />
                <div className="cart-item-details">
                  <h4 className="cart-item-name">{item.name}</h4>
                  <div className="cart-item-meta">
                    <span>Size: {item.size}</span>
                    <span>Flavor: {item.flavor}</span>
                    {item.dedication && (
                      <span style={{ fontStyle: 'italic' }}>
                        Icing: "{item.dedication}"
                      </span>
                    )}
                  </div>
                  <span className="cart-item-price">
                    ₱{item.price.toLocaleString()}
                  </span>
                </div>

                <div className="cart-item-actions">
                  <button
                    className="btn-remove"
                    onClick={() => onRemove(item.cartItemId)}
                  >
                    Remove
                  </button>
                  <div
                    className="qty-counter"
                    style={{
                      height: '32px',
                      scale: '0.85',
                      transformOrigin: 'right bottom',
                    }}
                  >
                    <button
                      className="qty-btn"
                      onClick={() =>
                        onUpdateQty(item.cartItemId, item.quantity - 1)
                      }
                    >
                      −
                    </button>
                    <span className="qty-val">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() =>
                        onUpdateQty(item.cartItemId, item.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-summary-row">
              <span>Subtotal</span>
              <span>₱{subtotal.toLocaleString()}</span>
            </div>
            <div className="cart-summary-row" style={{ color: 'var(--cocoa)' }}>
              <span>Est. Delivery/Handling</span>
              <span style={{ fontSize: '12px' }}>Calculated at next step</span>
            </div>
            <div className="cart-summary-row total">
              <span>Estimated Total</span>
              <span>₱{subtotal.toLocaleString()}</span>
            </div>

            <button
              className="btn-primary btn-checkout"
              onClick={onProceedCheckout}
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ==========================================================================
// Helper Sub-Component 3: Checkout Modal with Receipt Upload Preview
// ==========================================================================
function CheckoutModal({ cart, onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    type: 'pickup', // 'pickup', 'delivery'
    address: '',
    date: '',
    time: '12:00 PM',
    paymentMethod: 'GCash', // 'GCash', 'Maya', 'Bank Transfer', 'COD'
    receiptImg: null, // Base64 receipt data
  });

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const deliveryFee = form.type === 'delivery' ? 50 : 0;
  const totalPrice = subtotal + deliveryFee;

  // Handle uploaded slip visual preview
  const handleReceiptChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, receiptImg: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.date) {
      alert(
        'Please complete the required name, phone and scheduled delivery date.',
      );
      return;
    }
    if (form.type === 'delivery' && !form.address) {
      alert('Please specify a home address for delivery.');
      return;
    }
    if (form.paymentMethod !== 'COD' && !form.receiptImg) {
      alert('Please upload a payment receipt slip for digital verification.');
      return;
    }

    onSubmit(form);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-wrapper"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '840px' }}
      >
        <button className="modal-close" onClick={onClose}>
          ×
        </button>

        <div className="checkout-modal-inner">
          <h3
            className="modal-title"
            style={{
              borderBottom: '1.5px solid var(--almond)',
              paddingBottom: '12px',
              marginBottom: '24px',
            }}
          >
            Complete Your Bakery Order
          </h3>

          <form onSubmit={handleSubmitForm}>
            <div className="checkout-grid">
              {/* Form Input fields */}
              <div>
                <h4 className="checkout-section-title">
                  Recipient Information
                </h4>

                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Joshua Doe"
                    required
                    value={form.name}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Number *</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="0917XXXXXXX"
                    required
                    value={form.phone}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, phone: e.target.value }))
                    }
                  />
                </div>

                <h4
                  className="checkout-section-title"
                  style={{ marginTop: '24px' }}
                >
                  Fulfillment Logistics
                </h4>

                <div className="toggle-group">
                  <div
                    className={`toggle-option ${form.type === 'pickup' ? 'active' : ''}`}
                    onClick={() =>
                      setForm((prev) => ({ ...prev, type: 'pickup' }))
                    }
                  >
                    <HomeIcon style={{ width: 16, height: 16 }} aria-hidden /> Store Pickup (₱0)
                  </div>
                  <div
                    className={`toggle-option ${form.type === 'delivery' ? 'active' : ''}`}
                    onClick={() =>
                      setForm((prev) => ({ ...prev, type: 'delivery' }))
                    }
                  >
                    <HomeIcon style={{ width: 16, height: 16 }} aria-hidden /> Home Delivery (₱50)
                  </div>
                </div>

                {form.type === 'delivery' && (
                  <div className="form-group">
                    <label className="form-label">
                      Delivery Address Details *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Street, Barangay, City, Landmark Details"
                      required={form.type === 'delivery'}
                      value={form.address}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          address: e.target.value,
                        }))
                      }
                    />
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Scheduled Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      required
                      value={form.date}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, date: e.target.value }))
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Preferred Time Slot</label>
                    <select
                      className="form-control"
                      value={form.time}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, time: e.target.value }))
                      }
                    >
                      <option value="9:00 AM - 11:00 AM">
                        9:00 AM - 11:00 AM
                      </option>
                      <option value="12:00 PM - 2:00 PM">
                        12:00 PM - 2:00 PM
                      </option>
                      <option value="3:00 PM - 5:00 PM">
                        3:00 PM - 5:00 PM
                      </option>
                      <option value="6:00 PM - 8:00 PM">
                        6:00 PM - 8:00 PM
                      </option>
                    </select>
                  </div>
                </div>

                <h4
                  className="checkout-section-title"
                  style={{ marginTop: '24px' }}
                >
                  Secure Payments
                </h4>

                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <select
                    className="form-control"
                    value={form.paymentMethod}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        paymentMethod: e.target.value,
                      }))
                    }
                  >
                    <option value="GCash">GCash Transfer</option>
                    <option value="Maya">PayMaya Payment</option>
                    <option value="Bank Transfer">
                      BDO / BPI Bank Transfer
                    </option>
                    <option value="COD">Cash on Delivery / Pickup</option>
                  </select>
                </div>

                {form.paymentMethod !== 'COD' && (
                  <div className="form-group">
                    <label className="form-label">
                      Attach Payment Receipt Image *
                    </label>
                    <label className="receipt-upload-box">
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleReceiptChange}
                        required={form.paymentMethod !== 'COD'}
                      />
                      <CameraIcon style={{ width: 18, height: 18 }} className="upload-icon" aria-hidden />
                      <span className="upload-text">
                        {form.receiptImg
                          ? 'Change Attached Slip'
                          : 'Upload Reference Receipt'}
                      </span>
                      <span className="upload-subtext">
                        Click to choose image file
                      </span>
                      {form.receiptImg && (
                        <img
                          src={form.receiptImg}
                          alt="Receipt Preview"
                          className="receipt-preview-img"
                        />
                      )}
                    </label>
                  </div>
                )}
              </div>

              {/* Order total list summary column */}
              <div>
                <div className="order-summary-box">
                  <h4
                    style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      marginBottom: '16px',
                      borderBottom: '1px solid var(--almond)',
                      paddingBottom: '8px',
                    }}
                  >
                    Basket Summary
                  </h4>

                  <div className="summary-items-list">
                    {cart.map((item) => (
                      <div key={item.cartItemId} className="summary-item-row">
                        <div>
                          <span className="summary-item-name">{item.name}</span>
                          <span
                            style={{
                              fontSize: '11px',
                              color: 'var(--cocoa)',
                              display: 'block',
                            }}
                          >
                            Qty: {item.quantity} • Size: {item.size}
                          </span>
                        </div>
                        <span style={{ fontWeight: '600' }}>
                          ₱{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      borderTop: '1px solid var(--almond)',
                      paddingTop: '16px',
                      fontSize: '13px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>Subtotal:</span>
                      <span>₱{subtotal.toLocaleString()}</span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>
                        {form.type === 'delivery'
                          ? 'Delivery Fee'
                          : 'Store Pickup'}
                        :
                      </span>
                      <span>₱{deliveryFee}</span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontWeight: '800',
                        fontSize: '16px',
                        borderTop: '1.5px solid var(--almond)',
                        marginTop: '8px',
                        paddingTop: '10px',
                        color: 'var(--espresso)',
                      }}
                    >
                      <span>Grand Total:</span>
                      <span>₱{totalPrice.toLocaleString()}</span>
                    </div>
                  </div>

                  {form.paymentMethod !== 'COD' && (
                    <div
                      style={{
                        marginTop: '24px',
                        backgroundColor: 'var(--primary-light)',
                        padding: '12px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        color: 'var(--espresso)',
                        border: '1px solid rgba(212, 124, 106, 0.15)',
                      }}
                    >
                      <LightBulbIcon style={{ width: 16, height: 16 }} aria-hidden /> <strong>Mobile Payment Details:</strong> Send the exact
                      amount to GCash / PayMaya: <strong>0917-123-4567</strong>{' '}
                      (Nicai S.) and upload the payment slip image above!
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn-primary"
                    style={{
                      width: '100%',
                      height: '46px',
                      marginTop: '24px',
                      borderRadius: '23px',
                    }}
                  >
                    Submit Bakery Order
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// Helper Sub-Component 4: Admin View Detailed Modal with Approval Mechanics
// ==========================================================================
function AdminDetailModal({ order, onClose, onAccept, onDecline, onProgress }) {
  const [remarks, setRemarks] = useState('');
  const [isDeclining, setIsDeclining] = useState(false);

  const subtotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const deliveryFee = order.type === 'delivery' ? 50 : 0;

  const handleApprove = () => {
    onAccept(order.id, remarks);
    onClose();
  };

  const handleDeclineSubmit = (e) => {
    e.preventDefault();
    onDecline(order.id, remarks);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-wrapper"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '800px' }}
      >
        <button className="modal-close" onClick={onClose}>
          ×
        </button>

        <div className="checkout-modal-inner">
          <h3
            className="modal-title"
            style={{
              borderBottom: '1.5px solid var(--almond)',
              paddingBottom: '12px',
              marginBottom: '24px',
            }}
          >
            Reviewing Order Reference: {order.id}
          </h3>

          <div className="checkout-grid">
            {/* Left side details */}
            <div>
              <h4 className="checkout-section-title">Customer Logistics</h4>
              <p
                style={{
                  fontSize: '14px',
                  lineHeight: '1.8',
                  marginBottom: '20px',
                }}
              >
                <UserIcon style={{ width: 14, height: 14 }} aria-hidden /> <strong>Name:</strong> {order.customerName}
                <br />
                <PhoneIcon style={{ width: 14, height: 14 }} aria-hidden /> <strong>Phone:</strong> {order.customerPhone}
                <br />
                <CalendarDaysIcon style={{ width: 14, height: 14 }} aria-hidden /> <strong>Requested Date:</strong> {order.date}
                <br />
                <ClockIcon style={{ width: 14, height: 14 }} aria-hidden /> <strong>Requested Time:</strong> {order.time}
                <br />
                <MapPinIcon style={{ width: 14, height: 14 }} aria-hidden /> <strong>Fulfillment:</strong>{' '}
                {order.type === 'delivery' ? 'Home Delivery' : 'Store Pickup'}
                <br />
                {order.type === 'delivery' && (
                  <>
                    <HomeIcon style={{ width: 14, height: 14 }} aria-hidden /> <strong>Delivery Address:</strong> {order.address}
                    <br />
                  </>
                )}
                <CurrencyDollarIcon style={{ width: 14, height: 14 }} aria-hidden /> <strong>Payment Method:</strong> {order.paymentMethod}
                <br />
                <ChartBarIcon style={{ width: 14, height: 14 }} aria-hidden /> <strong>Current Status:</strong>{' '}
                <span
                  className={`status-badge ${order.status.toLowerCase()}`}
                  style={{ fontSize: '10px', padding: '2px 8px' }}
                >
                  {order.status}
                </span>
              </p>

              <h4 className="checkout-section-title">Order Breakdown</h4>
              <ul style={{ listStyle: 'none', marginBottom: '20px' }}>
                {order.items.map((item) => (
                  <li
                    key={item.cartItemId}
                    style={{
                      padding: '10px 0',
                      borderBottom: '1px solid rgba(0,0,0,0.04)',
                      fontSize: '13.5px',
                    }}
                  >
                    <strong>{item.quantity}x</strong> {item.name} — ₱
                    {(item.price * item.quantity).toLocaleString()}
                    <div
                      style={{
                        fontSize: '11px',
                        color: 'var(--cocoa)',
                        paddingLeft: '24px',
                      }}
                    >
                      Size: {item.size} | Flavor: {item.flavor}
                      {item.dedication && ` | Cake icing: "${item.dedication}"`}
                    </div>
                  </li>
                ))}
              </ul>

              {/* Remarks/Decline inputs */}
              {!isDeclining ? (
                <div className="form-group" style={{ marginTop: '24px' }}>
                  <label className="form-label">
                    Internal Prep Notes / Remarks (Optional)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Extra gold leaf, morning rush delivery"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </div>
              ) : (
                <form
                  onSubmit={handleDeclineSubmit}
                  className="remarks-input-wrapper"
                >
                  <label
                    className="form-label"
                    style={{ color: 'var(--danger)' }}
                  >
                    Specify Rejection Reason (Required) *
                  </label>
                  <textarea
                    className="dedication-textarea"
                    required
                    placeholder="e.g. Bakery capacity fully booked for tomorrow. Please choose a different date!"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                  <div
                    style={{ display: 'flex', gap: '8px', marginTop: '12px' }}
                  >
                    <button
                      type="button"
                      className="btn-primary"
                      style={{
                        background: 'none',
                        border: '1px solid var(--almond)',
                        color: 'var(--cocoa)',
                        boxShadow: 'none',
                      }}
                      onClick={() => setIsDeclining(false)}
                    >
                      Go Back
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      style={{ backgroundColor: 'var(--danger)' }}
                    >
                      Confirm Rejection
                    </button>
                  </div>
                </form>
              )}

              {/* Action row (only display if Pending approval!) */}
              {order.status === 'Pending' && !isDeclining && (
                <div
                  style={{ display: 'flex', gap: '16px', marginTop: '32px' }}
                >
                  <button
                    className="btn-primary"
                    style={{
                      backgroundColor: 'var(--danger)',
                      boxShadow: 'none',
                    }}
                    onClick={() => setIsDeclining(true)}
                  >
                    Decline Order
                  </button>
                  <button
                    className="btn-primary"
                    style={{ backgroundColor: 'var(--success)' }}
                    onClick={handleApprove}
                  >
                    Accept & Approve Order
                  </button>
                </div>
              )}

              {/* If already accepted, show quick progress steps! */}
              {order.status !== 'Pending' &&
                order.status !== 'Declined' &&
                order.status !== 'Completed' && (
                  <div
                    style={{
                      marginTop: '24px',
                      backgroundColor: 'var(--alabaster)',
                      padding: '16px',
                      borderRadius: '12px',
                      border: '1px solid var(--almond)',
                    }}
                  >
                    <span className="option-label">Bakery Prep Actions:</span>
                    <div
                      style={{
                        display: 'flex',
                        gap: '8px',
                        flexWrap: 'wrap',
                        marginTop: '8px',
                      }}
                    >
                      {order.status === 'Accepted' && (
                        <button
                          className="btn-sm btn-accept"
                          onClick={() => {
                            onProgress(order.id, 'Preparing');
                            onClose();
                          }}
                        >
                          Begin Preparing / Baking
                        </button>
                      )}
                      {order.status === 'Preparing' && (
                        <button
                          className="btn-sm btn-review"
                          onClick={() => {
                            onProgress(order.id, 'Ready');
                            onClose();
                          }}
                        >
                          Mark Ready for Dispatch
                        </button>
                      )}
                      {order.status === 'Ready' && (
                        <button
                          className="btn-sm btn-accept"
                          style={{
                            backgroundColor: 'var(--success)',
                            color: 'white',
                          }}
                          onClick={() => {
                            onProgress(order.id, 'Completed');
                            onClose();
                          }}
                        >
                          Mark as Completed
                        </button>
                      )}
                    </div>
                  </div>
                )}
            </div>

            {/* Right side: Payment Receipt verification */}
            <div>
              <div className="order-summary-box">
                <h4
                  style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    marginBottom: '16px',
                    borderBottom: '1px solid var(--almond)',
                    paddingBottom: '8px',
                  }}
                >
                  Payment Check
                </h4>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    fontSize: '13px',
                    marginBottom: '16px',
                  }}
                >
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <span>Cake subtotal:</span>
                    <span>₱{subtotal.toLocaleString()}</span>
                  </div>
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <span>Fulfillment fee:</span>
                    <span>₱{deliveryFee}</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontWeight: '800',
                      fontSize: '15px',
                      borderTop: '1px solid var(--almond)',
                      paddingTop: '8px',
                    }}
                  >
                    <span>Total Due:</span>
                    <span>₱{order.totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                {order.paymentMethod !== 'COD' ? (
                  <div>
                    <span className="option-label">
                      Uploaded GCash Slip Preview
                    </span>
                    <div className="slip-inspector-frame">
                      {order.receiptImg ? (
                        <img
                          src={order.receiptImg}
                          alt="Mobile Payment Slip"
                          className="slip-inspector-img"
                          onClick={() => {
                            const newTab = window.open();
                            newTab.document.write(
                              `<img src="${order.receiptImg}" style="max-width:100%; max-height:100vh; display:block; margin:auto;" />`,
                            );
                          }}
                          style={{ cursor: 'zoom-in' }}
                        />
                      ) : (
                        <div
                          style={{
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--cocoa)',
                            fontSize: '13px',
                          }}
                        >
                          No image attached.
                        </div>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: '10px',
                        color: 'var(--cocoa)',
                        display: 'block',
                        marginTop: '6px',
                        textAlign: 'center',
                      }}
                    >
                      Click on receipt image to expand view
                    </span>
                  </div>
                ) : (
                  <div
                    style={{
                      padding: '24px 12px',
                      border: '2px dashed var(--almond)',
                      borderRadius: '12px',
                      textAlign: 'center',
                      backgroundColor: 'white',
                      color: 'var(--cocoa)',
                      fontSize: '13.5px',
                    }}
                  >
                    <CurrencyDollarIcon style={{ width: 18, height: 18 }} aria-hidden /> <strong>Cash Payment Method:</strong> Order is to be
                    settled via Cash on Delivery or Cash on Pickup. No slip
                    verification required.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
