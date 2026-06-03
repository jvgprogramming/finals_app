// @ts-nocheck
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ProductService from '../../services/ProductService';
import OrderService from '../../services/OrderService';
import NotificationService from '../../services/NotificationService';
import useNotificationPolling from '../../hooks/useNotificationPolling';
import { mapProductsFromApi } from '../../utils/mapProduct';
import { mapOrdersFromApi, mapOrderFromApi, orderMatchesFilter } from '../../utils/mapOrder';
import AdminDetailModal from '../../components/admin/AdminDetailModal';
import NotificationPanel from '../../components/admin/NotificationPanel';
import SalesTrendChart from '../../components/admin/SalesTrendChart';
import ConfirmModal from '../../components/ConfirmModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { playSuccessSound } from '../../utils/sound';
import { formatPeso } from '../../utils/currency';
import { resolveProductImageUrl } from '../../utils/imageUrl';
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


export default function AdminApp() {
  // ==========================================================================
  // App Core States
  // ==========================================================================
  const { logout, isLoading, isAuthenticated, user } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('admin-dashboard');

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
  const productImageFileRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    price: '',
    description: '',
    category_id: '',
    stock: '',
    is_available: true,
    image: null,
  });

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [isNotifPanelOpen, setIsNotifPanelOpen] = useState(false);
  const [pollStatus, setPollStatus] = useState('connected');

  const confirmLogout = async () => {
    setShowLogoutConfirm(false);
    await handleLogout();
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
      setIsLoadingProducts(true);
      try {
        const [productsData, categoriesData] = await Promise.all([
          ProductService.getProducts(),
          ProductService.getCategories(),
        ]);
        setProducts(mapProductsFromApi(productsData));
        setCategories(categoriesData);
        setFetchError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setFetchError('Failed to load products.');
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  const knownOrderIdsRef = useRef(new Set());
  const pollingReadyRef = useRef(false);

  const clearUserSessionData = () => {
    setOrders([]);
    setNotifications([]);
    knownOrderIdsRef.current = new Set();
    pollingReadyRef.current = false;
    setShakingBell(false);
    setAdminDetailOrder(null);
  };

  const handleLogout = async () => {
    clearUserSessionData();
    await logout();
    navigate('/', { replace: true });
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setOrders([]);
      setNotifications([]);
      knownOrderIdsRef.current = new Set();
      pollingReadyRef.current = false;
      setShakingBell(false);
      setAdminDetailOrder(null);
    }
  }, [isAuthenticated]);

  // Fetch orders on mount (only if authenticated)
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const fetchOrders = async () => {
      setOrders([]);
      setIsLoadingOrders(true);
      try {
        const ordersData = await OrderService.getOrders();
        const mapped = mapOrdersFromApi(ordersData);
        setOrders(mapped);
        knownOrderIdsRef.current = new Set(mapped.map((o) => o.id));
        setFetchError(null);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setFetchError('Failed to load orders.');
      } finally {
        setIsLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, user?.id]);

  // Fetch initial notifications (only if authenticated)
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const fetchNotifications = async () => {
      try {
        const notificationsResult = await NotificationService.getNotifications();
        setNotifications(notificationsResult.data || notificationsResult);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };

    fetchNotifications();
  }, [isAuthenticated, user?.id]);

  // Set up polling for notifications and orders (only if authenticated)
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
      setPollStatus('connected');
      if (pollingReadyRef.current && hasNewOrder) {
        setShakingBell(true);
        setTimeout(() => setShakingBell(false), 1000);
        playSuccessSound();
      }
      pollingReadyRef.current = true;
    },
    onError: (error) => {
      console.error('Polling error:', error);
      setPollStatus('reconnecting');
    },
  });

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
      image: product.image_url || '/images/placeholder.png',
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

  // ==========================================================================
  // Admin Functions
  // ==========================================================================

  // Accept Order via API
  const handleAcceptOrder = async (orderId, remarks = '') => {
    try {
      const updatedOrder = mapOrderFromApi(await OrderService.acceptOrder(orderId));

      setOrders((prev) =>
        prev.map((order) =>
          order.id === updatedOrder.id ? updatedOrder : order,
        ),
      );

      if (adminDetailOrder && adminDetailOrder.id === orderId) {
        setAdminDetailOrder(updatedOrder);
      }

      playSuccessSound();
    } catch (err) {
      console.error('Error accepting order:', err);
      alert('Failed to accept order');
    }
  };

  // Decline Order via API
  const handleDeclineOrder = async (orderId, reason) => {
    if (!reason.trim()) {
      alert('Please provide a reason for declining the order.');
      return;
    }

    try {
      const updatedOrder = mapOrderFromApi(
        await OrderService.declineOrder(orderId, reason),
      );

      setOrders((prev) =>
        prev.map((order) =>
          order.id === updatedOrder.id ? updatedOrder : order,
        ),
      );

      if (adminDetailOrder && adminDetailOrder.id === orderId) {
        setAdminDetailOrder(updatedOrder);
      }
    } catch (err) {
      console.error('Error declining order:', err);
      alert('Failed to decline order');
    }
  };

  // Shift status progression via API
  const handleProgressOrder = async (orderId, nextStatus) => {
    try {
      let updatedOrder;

      // Call appropriate API endpoint based on status
      switch (nextStatus) {
        case 'preparing':
          updatedOrder = await OrderService.markPreparing(orderId);
          break;
        case 'ready':
          updatedOrder = await OrderService.markReady(orderId);
          break;
        case 'completed':
          updatedOrder = await OrderService.completeOrder(orderId);
          break;
        default:
          throw new Error(`Unknown status: ${nextStatus}`);
      }

      const mapped = mapOrderFromApi(updatedOrder);
      setOrders((prev) =>
        prev.map((order) => (order.id === mapped.id ? mapped : order)),
      );

      if (adminDetailOrder && adminDetailOrder.id === orderId) {
        setAdminDetailOrder(mapped);
      }

      playSuccessSound();
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status');
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

    productImageFileRef.current = file;
    setNewProductForm((prev) => ({ ...prev, image: file }));
  };

  const productImagePreview = useMemo(() => {
    const img = newProductForm.image;
    if (!img) return null;
    if (img instanceof File) return URL.createObjectURL(img);
    if (typeof img === 'string') return resolveProductImageUrl(img) || img;
    return null;
  }, [newProductForm.image]);

  useEffect(() => {
    return () => {
      if (productImagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(productImagePreview);
      }
    };
  }, [productImagePreview]);

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

  const handleDeleteProduct = async (productId) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const confirmed = window.confirm(
      `Delete ${product.name}? This cannot be undone.`,
    );
    if (!confirmed) return;

    try {
      await ProductService.deleteProduct(productId);

      setProducts((prev) =>
        prev.filter((productItem) => productItem.id !== productId),
      );

      if (editingProduct?.id === productId) {
        cancelProductEdit();
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product');
    }
  };

  // Add/Edit dynamic inventory via API
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!newProductForm.name || !newProductForm.price) {
      alert('Please fill in the product name and price.');
      return;
    }

    if (!newProductForm.category_id) {
      alert('Please select a category.');
      return;
    }

    // Prepare FormData for file upload
    const formData = new FormData();
    formData.append('name', newProductForm.name);
    formData.append('price', parseFloat(newProductForm.price));
    formData.append('description', newProductForm.description);
    formData.append('category_id', newProductForm.category_id);
    formData.append('stock', parseInt(newProductForm.stock) || 0);
    formData.append('is_available', newProductForm.is_available ? '1' : '0');
    
    const imageFile = productImageFileRef.current;
    if (imageFile instanceof File) {
      formData.append('image', imageFile);
    }

    try {
      let savedProduct;
      
      if (editingProduct) {
        // Update mode
        savedProduct = await ProductService.updateProduct(editingProduct.id, formData);
      } else {
        // Create mode
        savedProduct = await ProductService.createProduct(formData);
      }

      // Update local state
      const mappedProduct = mapProductsFromApi([savedProduct])[0];
      if (editingProduct) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id ? mappedProduct : p,
          ),
        );
      } else {
        setProducts((prev) => [...prev, mappedProduct]);
      }

      cancelProductEdit();
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Failed to save product');
    }
  };

  const handleEditProductClick = (product) => {
    setEditingProduct(product);
    setNewProductForm({
      name: product.name,
      price: product.price,
      description: product.description,
      category_id: product.category?.id || '',
      stock: product.stock || 0,
      is_available: product.is_available || true,
      image: product.image || product.image_url || null,
    });
    productImageFileRef.current = null;
    setIsProductEditorOpen(true);
  };

  const cancelProductEdit = () => {
    productImageFileRef.current = null;
    setEditingProduct(null);
    setIsProductEditorOpen(false);
    setIsImageDragging(false);
    setNewProductForm({
      name: '',
      price: '',
      description: '',
      category_id: '',
      stock: '',
      is_available: true,
      image: null,
    });
  };

  // Clear unread notifications
  const handleMarkNotificationsRead = async () => {
    try {
      await NotificationService.markAllNotificationsRead();
      const result = await NotificationService.getNotifications();
      setNotifications(result.data);
    } catch (err) {
      console.error('Error marking notifications read:', err);
    }
  };

  const handleNotificationOrderSelect = (orderId) => {
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      setAdminDetailOrder(order);
      setActiveView('admin-orders');
      setAdminOrderFilter('All');
    }
    setIsNotifPanelOpen(false);
  };

  // ==========================================================================
  // Filters & Analytics Computations (useMemo)
  // ==========================================================================

  // Build available categories from API products
  const availableCategories = useMemo(() => {
    const categorySet = new Set(['All']);
    products.forEach((p: any) => {
      if (p.category?.name) {
        categorySet.add(p.category.name);
      }
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
        const matchCategory =
          activeCategory === 'All' || product.category?.name === activeCategory;
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
    return orders.filter((order) => orderMatchesFilter(order, adminOrderFilter));
  }, [orders, adminOrderFilter]);

  // Dashboard Stats Calculations
  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.statusKey === 'pending').length;
    const accepted = orders.filter((o) =>
      ['accepted', 'preparing', 'ready'].includes(o.statusKey),
    ).length;
    const declined = orders.filter((o) => o.statusKey === 'declined').length;
    const completed = orders.filter((o) => o.statusKey === 'completed').length;

    const revenue = orders
      .filter((o) => o.statusKey === 'completed')
      .reduce((sum, o) => sum + o.totalPrice, 0);

    return { total, pending, accepted, declined, completed, revenue };
  }, [orders]);

  // Custom Notifications Counts
  const unreadNotifCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications],
  );

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
                  onClick={() => setActiveView('admin-orders')}
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                >
                  Order Queue
                  {stats.pending > 0 && (
                    <span
                      className="badge"
                      style={{
                        backgroundColor: 'var(--secondary)',
                        color: 'var(--espresso)',
                        top: '-2px',
                        right: '-12px',
                      }}
                    >
                      {stats.pending}
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
                <NotificationPanel
                  notifications={notifications}
                  isOpen={isNotifPanelOpen}
                  shaking={shakingBell}
                  onToggle={() => setIsNotifPanelOpen((v) => !v)}
                  onMarkAllRead={handleMarkNotificationsRead}
                  onSelectOrder={handleNotificationOrderSelect}
                />
                <button
                  type="button"
                  className="nav-link"
                  onClick={() => setShowLogoutConfirm(true)}
                  style={{
                    border: '1px solid var(--almond)',
                    background: 'var(--velvet-cream)',
                    cursor: 'pointer',
                  }}
                >
                  Logout
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
                      Live Status:{' '}
                      {pollStatus === 'connected' ? 'Connected' : 'Reconnecting…'}
                    </span>
                  </div>

                  {fetchError && (
                    <div
                      style={{
                        padding: '12px 16px',
                        marginBottom: '16px',
                        background: 'rgba(212, 80, 80, 0.1)',
                        border: '1px solid var(--danger)',
                        borderRadius: '8px',
                        color: 'var(--danger)',
                        fontSize: '14px',
                      }}
                    >
                      {fetchError}
                    </div>
                  )}

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
                        {formatPeso(stats.revenue)}
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
                      <SalesTrendChart orders={orders} />
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
                                    {order.items.length} item(s) · ₱
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
                      {isLoadingOrders ? (
                        <LoadingSpinner label="Loading orders…" />
                      ) : filteredAdminOrders.length === 0 ? (
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
                                  {order.items.length} product(s) · Total: ₱
                                  {order.totalPrice.toLocaleString()} ·
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
                                    handleProgressOrder(order.id, 'preparing')
                                  }
                                >
                                  Begin Baking
                                </button>
                              )}

                              {order.status === 'Preparing' && (
                                <button
                                  className="btn-sm btn-review"
                                  onClick={() =>
                                    handleProgressOrder(order.id, 'ready')
                                  }
                                >
                                  Mark Ready / Dispatch
                                </button>
                              )}

                              {order.status === 'Ready' && (
                                <button
                                  className="btn-sm btn-accept"
                                  onClick={() =>
                                    handleProgressOrder(order.id, 'completed')
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
                        Add New Product
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
                        {isLoadingProducts ? (
                          <LoadingSpinner label="Loading products…" />
                        ) : products.length === 0 ? (
                          <EmptyState
                            title="No products yet"
                            description="Add your first bakery item to the catalog."
                            action={
                              <button
                                type="button"
                                className="btn-primary"
                                onClick={openNewProductEditor}
                              >
                                Add New Product
                              </button>
                            }
                          />
                        ) : (
                        products.map((product) => (
                          <div key={product.id} className="inventory-item-row">
                            <div className="inventory-item-meta">
                              <img
                                src={resolveProductImageUrl(product.image) || '/images/placeholder.png'}
                                alt={product.name}
                                className="inventory-item-thumb"
                              />
                              <div className="inventory-item-title">
                                <h5>{product.name}</h5>
                                <span>
                                  ₱{product.price.toLocaleString()} ·{' '}
                                  {product.categoryLabel || product.category?.name}
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
                        ))
                        )}
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
                        type="button"
                        className="modal-close"
                        onClick={cancelProductEdit}
                        aria-label="Close"
                      >
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
                                src={
                                  productImagePreview ||
                                  'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop'
                                }
                                alt="Product preview"
                                className="product-image-preview"
                              />
                              <strong>Drop an image here</strong>
                              <span>or click to upload a local file</span>
                            </div>

                            <div className="product-image-instructions">
                              <p>Upload a product image (JPEG, PNG, GIF up to 2MB)</p>
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
                                <label className="form-label">Base price (6&quot;, PHP)</label>
                                <input
                                  type="number"
                                  className="form-control"
                                  placeholder="e.g. 950"
                                  step="0.01"
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
                                  value={newProductForm.category_id}
                                  onChange={(e) =>
                                    setNewProductForm((prev) => ({
                                      ...prev,
                                      category_id: e.target.value,
                                    }))
                                  }
                                  required
                                >
                                  <option value="">Select a category</option>
                                  {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                      {cat.name}
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

                            <div className="form-row">
                              <div className="form-group">
                                <label className="form-label">Stock Quantity</label>
                                <input
                                  type="number"
                                  className="form-control"
                                  placeholder="e.g. 10"
                                  value={newProductForm.stock}
                                  onChange={(e) =>
                                    setNewProductForm((prev) => ({
                                      ...prev,
                                      stock: e.target.value,
                                    }))
                                  }
                                />
                              </div>
                              <div className="form-group">
                                <label className="form-label">
                                  <input
                                    type="checkbox"
                                    checked={newProductForm.is_available}
                                    onChange={(e) =>
                                      setNewProductForm((prev) => ({
                                        ...prev,
                                        is_available: e.target.checked,
                                      }))
                                    }
                                    style={{ marginRight: '8px' }}
                                  />
                                  Available for Order
                                </label>
                              </div>
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

      {showLogoutConfirm && (
        <ConfirmModal
          title="Log out?"
          message="You will need to sign in again to access the admin dashboard."
          confirmLabel="Log out"
          onConfirm={confirmLogout}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </div>
  );
}
