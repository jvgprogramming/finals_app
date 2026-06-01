// @ts-nocheck
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoginForm from '../Auth/components/LoginForm';
import ProductService from '../../services/ProductService';
import OrderService from '../../services/OrderService';
import NotificationService from '../../services/NotificationService';
import useNotificationPolling from '../../hooks/useNotificationPolling';
import { mapProductsFromApi } from '../../utils/mapProduct';
import { mapOrdersFromApi, mapOrderFromApi } from '../../utils/mapOrder';
import { playSuccessSound } from '../../utils/sound';
import { formatPeso } from '../../utils/currency';
import {
  getPriceForSize,
  CAKE_SIZE_OPTIONS,
} from '../../utils/productPricing';
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
  MinusIcon,
  PlusIcon,
  CurrencyDollarIcon,
  LightBulbIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';


export default function CustomerApp() {
  // ==========================================================================
  // App Core States
  // ==========================================================================
  const { logout, isLoading, isAuthenticated, user } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('customer-home');

  // Data Persistence states
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('np_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [notifications, setNotifications] = useState([]);

  // UI Interactive States
  const [selectedProduct, setSelectedProduct] = useState(null); // Product customization modal
  const [isCartOpen, setIsCartOpen] = useState(false); // Cart slide drawer toggle
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false); // Checkout dialog toggle
  const [toasts, setToasts] = useState([]);
  const [shakingBell, setShakingBell] = useState(false);

  // Search & Catalog Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('popular'); // 'popular', 'price-asc', 'price-desc'

  const handleLogout = async () => {
    await logout();
    // stay on landing page after logout
    setIsLoginOpen(false);
  };

  // Save cart to LocalStorage only (keep cart temporary in browser)
  useEffect(() => {
    localStorage.setItem('np_cart', JSON.stringify(cart));
  }, [cart]);

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

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = await ProductService.getProducts();
        setProducts(mapProductsFromApi(productsData));
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };

    fetchProducts();
  }, []);

  // Fetch orders on mount (only if authenticated)
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchOrders = async () => {
      try {
        const ordersData = await OrderService.getOrders();
        setOrders(mapOrdersFromApi(ordersData));
      } catch (err) {
        console.error('Error fetching orders:', err);
      }
    };

    fetchOrders();
  }, [isAuthenticated]);

  // Fetch initial notifications (only if authenticated)
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchNotifications = async () => {
      try {
        const notificationsResult = await NotificationService.getNotifications();
        setNotifications(notificationsResult.data || notificationsResult);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };

    fetchNotifications();
  }, [isAuthenticated]);

  const knownOrderIdsRef = useRef(new Set());
  const pollingReadyRef = useRef(false);

  useNotificationPolling({
    interval: 10000,
    enabled: isAuthenticated && !isLoading,
    onNotificationsUpdate: (newNotifications) => {
      setNotifications(newNotifications);
    },
    onOrdersUpdate: (newOrders) => {
      const mapped = mapOrdersFromApi(newOrders);
      const hasNewOrder = mapped.some((o) => !knownOrderIdsRef.current.has(o.id));
      knownOrderIdsRef.current = new Set(mapped.map((o) => o.id));
      setOrders(mapped);
      if (pollingReadyRef.current && hasNewOrder) {
        setShakingBell(true);
        setTimeout(() => setShakingBell(false), 1000);
        playSuccessSound();
      }
      pollingReadyRef.current = true;
    },
    onError: (error) => {
      console.error('Polling error:', error);
    },
  });

  // ==========================================================================
  // Customer Functions
  // ==========================================================================

  // Add item to cart
  const handleAddToCart = (product, options) => {
    const cartItemId = Date.now().toString();
    const unitPrice = getPriceForSize(product.price, options.size);
    const newCartItem = {
      cartItemId,
      id: product.id,
      name: product.name,
      price: unitPrice,
      image: product.image || product.image_url || '/images/placeholder.png',
      quantity: options.quantity,
      size: options.size,
      flavor: options.flavor,
      dedication: options.dedication,
    };

    setCart((prev) => [...prev, newCartItem]);
    setSelectedProduct(null);
    playSuccessSound();

    // Customer UI Alert (will work after addToast is defined)
    // addToast(`Added ${newCartItem.name} to cart!`, 'info');
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

  // Checkout submission - submit order to API
  const handlePlaceOrder = async (checkoutForm) => {
    try {
      // Transform cart items to API format
      const orderItems = cart.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        customization: {
          dedication_message: item.dedication || null,
          size: item.size || null,
          flavor: item.flavor || null,
          color_theme: null,
          custom_notes: null,
        },
      }));

      // Prepare order data for API
      const orderData = {
        items: orderItems,
        notes: checkoutForm.paymentMethod ? `Payment: ${checkoutForm.paymentMethod}` : '',
        delivery_date: checkoutForm.date ? new Date(`${checkoutForm.date}T${checkoutForm.time}`).toISOString() : null,
      };

      // Create order via API
      const createdOrder = await OrderService.createOrder(orderData);

      // Update state with returned order
      setOrders((prev) => [mapOrderFromApi(createdOrder), ...prev]);
      setCart([]); // Clear cart
      setIsCheckoutOpen(false);
      setIsCartOpen(false);
      playSuccessSound();

      // Optional: Create a notification (normally done by backend)
      const notification = {
        id: `notif-${Date.now()}`,
        title: `Order ${createdOrder.order_number} Received`,
        message: `Your order has been submitted and is pending bakery approval.`,
        is_read: false,
      };
      setNotifications((prev) => [notification, ...prev]);

    } catch (err) {
      console.error('Error placing order:', err);
      // Show error feedback
      alert('Failed to place order. Please try again.');
    }
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
      navigate('/admin', { replace: true });
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

  // Build available categories from API products
  const availableCategories = useMemo(() => {
    const categorySet = new Set(['All']);
    products.forEach((p: any) => {
      const name =
        typeof p.category === 'string' ? p.category : p.category?.name;
      if (name) categorySet.add(name);
    });
    return Array.from(categorySet);
  }, [products]);

  // Customer Filtering logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchSearch =
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase());
        const categoryName =
          product.categoryLabel ??
          (typeof product.category === 'string'
            ? product.category
            : product.category?.name);
        const matchCategory =
          activeCategory === 'All' || categoryName === activeCategory;
        return matchSearch && matchCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        return b.id - a.id; // popularity mock default
      });
  }, [products, searchQuery, activeCategory, sortBy]);

  const notifCounts = useMemo(() => {
    const customer = notifications.filter(
      (n) => n.type === 'customer' && !n.read,
    ).length;
    return { customer };
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
            <button
              type="button"
              className="alert-toast-close"
              onClick={() =>
                setToasts((prev) => prev.filter((t) => t.id !== toast.id))
              }
              aria-label="Dismiss"
            >
              <XMarkIcon className="h-4 w-4" aria-hidden />
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
                      {availableCategories.map((cat) => (
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
                            className={`product-card ${!product.is_available ? 'unavailable' : ''}`}
                          >
                            {!product.is_available && (
                              <div className="sold-out-overlay">
                                <span className="sold-out-badge">Sold Out</span>
                              </div>
                            )}
                            <div className="card-img-wrapper">
                              <span className="card-badge">
                                {product.categoryLabel || product.category?.name || 'Pastry'}
                              </span>
                              <img
                                src={product.image || '/images/placeholder.png'}
                                alt={product.name}
                                className="card-img"
                              />
                            </div>
                            <div className="card-body">
                              <h4 className="card-title">{product.name}</h4>
                              <p className="card-desc">{product.description}</p>
                              <div className="card-footer">
                                <span className="card-price">
                                  {formatPeso(product.price)}
                                  <small style={{ display: 'block', fontWeight: 400, fontSize: '11px' }}>
                                    from 6&quot; size
                                  </small>
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
                        'pending',
                        'accepted',
                        'preparing',
                        'ready',
                        'completed',
                      ];
                      const activeIndex = statusSteps.indexOf(order.status?.toLowerCase());

                      return (
                        <div key={order.id} className="order-history-card">
                          <div className="order-history-header">
                            <div className="order-id-date">
                              <h4>Order Reference: {order.order_number}</h4>
                              <span>Submitted: {new Date(order.created_at).toLocaleDateString()}</span>
                            </div>
                            <div>
                              <span
                                className={`status-badge ${order.status?.toLowerCase()}`}
                              >
                                {order.status === 'ready' && order.delivery_date
                                  ? 'Out for Delivery'
                                  : order.status === 'ready'
                                  ? 'Ready for Pickup'
                                  : order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                              </span>
                            </div>
                          </div>

                          {/* Graphical Timeline Progress Bar (only if not declined!) */}
                          {order.status !== 'declined' && (
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
                                  {formatPeso(order.totalPrice)}
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

        {/* Login Modal (opens instead of redirecting to /login) */}
        {isLoginOpen && (
          <div className="modal-backdrop" onClick={() => setIsLoginOpen(false)}>
            <div
              className="modal-wrapper"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '420px' }}
            >
              <button
                type="button"
                className="modal-close"
                onClick={() => setIsLoginOpen(false)}
                aria-label="Close"
              >
                <XMarkIcon className="h-5 w-5" aria-hidden />
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
  const defaultFlavors = ['Classic Vanilla', 'Strawberry Dream', 'Salted Caramel Fudge'];

  const flavors = product.flavors || defaultFlavors;
  const categoryName =
    product.categoryLabel || product.category?.name || '';

  const [selectedSize, setSelectedSize] = useState(CAKE_SIZE_OPTIONS[0].label);
  const [selectedFlavor, setSelectedFlavor] = useState(flavors[0]);
  const [dedication, setDedication] = useState('');
  const [quantity, setQuantity] = useState(1);

  const unitPrice = getPriceForSize(product.price, selectedSize);
  const lineTotal = unitPrice * quantity;
  const imageSrc =
    product.image || product.image_url || '/images/placeholder.png';

  const charLimit = 40;

  const handleSubmit = () => {
    onAddToCart(product, {
      size: selectedSize,
      flavor: selectedFlavor,
      dedication: categoryName.includes('Cakes') ? dedication : '',
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
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          <XMarkIcon className="h-5 w-5" aria-hidden />
        </button>

        <div className="modal-grid">
          <div className="modal-visuals">
            <div className="modal-img-frame">
              <img
                src={imageSrc}
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
              {formatPeso(unitPrice)}
            </h4>
          </div>

          <div className="modal-details">
            <h3 className="modal-title">{product.name}</h3>
            <p className="modal-desc">{product.description}</p>

            {/* Custom options: size */}
            <div className="option-group">
              <span className="option-label">Select Cake Size</span>
              <div className="option-selector">
                {CAKE_SIZE_OPTIONS.map((sizeOption) => (
                  <label
                    key={sizeOption.label}
                    className="radio-tile-wrapper"
                  >
                    <input
                      type="radio"
                      name="size-options"
                      className="radio-tile-input"
                      checked={selectedSize === sizeOption.label}
                      onChange={() => setSelectedSize(sizeOption.label)}
                    />
                    <span className="radio-tile-content">
                      {sizeOption.label}
                      <br />
                      <small style={{ opacity: 0.85 }}>
                        {formatPeso(
                          getPriceForSize(product.price, sizeOption.label),
                        )}
                      </small>
                    </span>
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
                {flavors.map((flavor) => (
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
            {categoryName.includes('Cakes') && (
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
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  aria-label="Decrease quantity"
                >
                  <MinusIcon className="h-4 w-4" aria-hidden />
                </button>
                <span className="qty-val">{quantity}</span>
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantity((prev) => prev + 1)}
                  aria-label="Increase quantity"
                >
                  <PlusIcon className="h-4 w-4" aria-hidden />
                </button>
              </div>

              <button type="button" className="btn-primary" onClick={handleSubmit}>
                Add to Cart · {formatPeso(lineTotal)}
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
          <button type="button" className="cart-close-btn" onClick={onClose} aria-label="Close cart">
            <XMarkIcon className="h-5 w-5" aria-hidden />
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
                    {formatPeso(item.price)}
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
                      type="button"
                      className="qty-btn"
                      onClick={() =>
                        onUpdateQty(item.cartItemId, item.quantity - 1)
                      }
                      aria-label="Decrease quantity"
                    >
                      <MinusIcon className="h-4 w-4" aria-hidden />
                    </button>
                    <span className="qty-val">{item.quantity}</span>
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() =>
                        onUpdateQty(item.cartItemId, item.quantity + 1)
                      }
                      aria-label="Increase quantity"
                    >
                      <PlusIcon className="h-4 w-4" aria-hidden />
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
              <span>{formatPeso(subtotal)}</span>
            </div>
            <div className="cart-summary-row" style={{ color: 'var(--cocoa)' }}>
              <span>Est. Delivery/Handling</span>
              <span style={{ fontSize: '12px' }}>Calculated at next step</span>
            </div>
            <div className="cart-summary-row total">
              <span>Estimated Total</span>
              <span>{formatPeso(subtotal)}</span>
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
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          <XMarkIcon className="h-5 w-5" aria-hidden />
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
                    <HomeIcon style={{ width: 16, height: 16 }} aria-hidden /> Store Pickup ({formatPeso(0)})
                  </div>
                  <div
                    className={`toggle-option ${form.type === 'delivery' ? 'active' : ''}`}
                    onClick={() =>
                      setForm((prev) => ({ ...prev, type: 'delivery' }))
                    }
                  >
                    <HomeIcon style={{ width: 16, height: 16 }} aria-hidden /> Home Delivery ({formatPeso(50)})
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
                            Qty: {item.quantity} · Size: {item.size}
                          </span>
                        </div>
                        <span style={{ fontWeight: '600' }}>
                          {formatPeso(item.price * item.quantity)}
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
                      <span>{formatPeso(subtotal)}</span>
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
                      <span>{formatPeso(deliveryFee)}</span>
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
                      <span>{formatPeso(totalPrice)}</span>
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
