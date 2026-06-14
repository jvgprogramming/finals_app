import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { CartItem } from '../../services/CartService';
import type { Category } from '../../services/ProductService';
import type { Order } from '../../services/OrderService';
import type { Notification as AppNotification } from '../../services/NotificationService';
import type { UiProduct } from '../../utils/mapProduct';
import type { UiOrder } from '../../utils/mapOrder';
import CartService from '../../services/CartService';
import ProductService from '../../services/ProductService';
import OrderService from '../../services/OrderService';
import NotificationService from '../../services/NotificationService';
import useNotificationPolling from '../../hooks/useNotificationPolling';
import { mapProductFromApi, mapProductsFromApi } from '../../utils/mapProduct';
import {
  mapOrdersFromApi,
  mapOrderFromApi,
  orderMatchesFilter,
  formatPlacedAt,
  formatScheduledAt,
} from '../../utils/mapOrder';
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
  UserIcon,
  SparklesIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';

export default function AdminApp() {
  // ==========================================================================
  // App Core States
  // ==========================================================================
  const { logout, isLoading, isAuthenticated, user } = useAuth();
  const [, setIsLoginOpen] = useState(false);
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('admin-dashboard');

  // Data Persistence states
  const [products, setProducts] = useState<UiProduct[]>([]);
  const [orders, setOrders] = useState<UiOrder[]>([]);
  const [, setCart] = useState<CartItem[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // UI Interactive States
  const [, setIsCheckoutOpen] = useState(false); // Checkout dialog toggle
  const [adminDetailOrder, setAdminDetailOrder] = useState<UiOrder | null>(
    null,
  ); // Admin inspect order details

  // Toast notifications for Admin in real time
  const [toasts, setToasts] = useState<
    Array<{ id: number; text: string; type: string; data: unknown }>
  >([]);
  const [shakingBell, setShakingBell] = useState(false);

  // Search & Catalog Filter states

  // Admin section filter states
  const [adminOrderFilter, setAdminOrderFilter] = useState('All'); // 'All', 'Pending', 'Accepted', 'Preparing', 'Ready', 'Completed', 'Declined'
  const [adminOrderPage, setAdminOrderPage] = useState(1);

  // Product editor state (Add/Edit)
  const [editingProduct, setEditingProduct] = useState<UiProduct | null>(null);
  const [isProductEditorOpen, setIsProductEditorOpen] = useState(false);
  const [isImageDragging, setIsImageDragging] = useState(false);
  const productImageInputRef = useRef<HTMLInputElement>(null);
  const productImageFileRef = useRef<File | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newProductForm, setNewProductForm] = useState<{
    name: string;
    price: string;
    description: string;
    category_id: string;
    is_available: boolean;
    image: File | string | null;
  }>({
    name: '',
    price: '',
    description: '',
    category_id: '',
    is_available: true,
    image: null,
  });
  const [togglingProductId, setTogglingProductId] = useState<number | null>(
    null,
  );

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isNotifPanelOpen, setIsNotifPanelOpen] = useState(false);
  const [, setPollStatus] = useState('connected');

  const confirmLogout = async () => {
    setShowLogoutConfirm(false);
    await handleLogout();
  };

  // Load cart on mount (from server if authenticated, otherwise from localStorage)
  useEffect(() => {
    const loadCart = async () => {
      const items = await CartService.getCart();
      setCart(items);
    };
    loadCart();
  }, [isAuthenticated]);

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
    } catch {
      // Ignore - localStorage may not be available
    }
  }, []);

  // If a page requested login (pendingCheckout flag), open the login modal
  useEffect(() => {
    try {
      const pending = localStorage.getItem('pendingCheckout');
      if (pending === '1') {
        setIsLoginOpen(true);
      }
    } catch {
      // Ignore - localStorage may not be available
    }
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
        const notificationsResult =
          await NotificationService.getNotifications();
        setNotifications(
          (notificationsResult.data ||
            notificationsResult) as AppNotification[],
        );
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
    onNotificationsUpdate: (newNotifications: AppNotification[]) => {
      setNotifications(newNotifications);
    },
    onOrdersUpdate: (newOrders) => {
      const mapped = mapOrdersFromApi(newOrders);
      const hasNewOrder = mapped.some(
        (o) => !knownOrderIdsRef.current.has(o.id),
      );
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

  // Helper to add temporary bottom-right toast messages
  const addToast = (text: string, type: string, data: unknown = null) => {
    setToasts((prev) => [...prev, { id: Date.now(), text, type, data }]);
  };

  // ==========================================================================
  // Admin Functions
  // ==========================================================================

  // Accept Order via API
  const handleAcceptOrder = async (orderId: number) => {
    try {
      const updatedOrder = mapOrderFromApi(
        (await OrderService.acceptOrder(orderId)) as unknown as Order &
          Record<string, unknown>,
      );

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
  const handleDeclineOrder = async (orderId: number, reason: string) => {
    if (!reason.trim()) {
      alert('Please provide a reason for declining the order.');
      return;
    }

    try {
      const updatedOrder = mapOrderFromApi(
        (await OrderService.declineOrder(orderId, reason)) as unknown as Order &
          Record<string, unknown>,
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
  const handleProgressOrder = async (orderId: number, nextStatus: string) => {
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

      const mapped = mapOrderFromApi(
        updatedOrder as unknown as Order & Record<string, unknown>,
      );
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

  const handleToggleProductAvailability = async (productId: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product || togglingProductId === productId) return;

    const nextAvailable = !(product.is_available ?? product.available);

    setTogglingProductId(productId);
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              is_available: nextAvailable,
              available: nextAvailable,
            }
          : p,
      ),
    );

    try {
      const formData = new FormData();
      formData.append('is_available', nextAvailable ? '1' : '0');
      const savedProduct = await ProductService.updateProduct(
        productId,
        formData,
      );
      const mappedProduct = mapProductFromApi(savedProduct);
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? mappedProduct : p)),
      );
      const stateText = nextAvailable ? 'available for order' : 'not available';
      addToast(`${product.name} is now ${stateText}.`, 'info');
    } catch (err) {
      console.error('Error updating product availability:', err);
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? {
                ...p,
                is_available: product.is_available,
                available: product.available,
              }
            : p,
        ),
      );
      addToast(`Failed to update ${product.name}. Please try again.`, 'error');
    } finally {
      setTogglingProductId(null);
    }
  };

  const setProductImageFromFile = (file: File | undefined) => {
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

  const handleImageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setProductImageFromFile(file);
    e.target.value = '';
  };

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsImageDragging(false);
    const file = e.dataTransfer.files?.[0];
    setProductImageFromFile(file);
  };

  const handleDeleteProduct = async (productId: number) => {
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
  const handleSaveProduct = async (e: React.FormEvent) => {
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
    formData.append('price', String(parseFloat(newProductForm.price)));
    formData.append('description', newProductForm.description?.trim() ?? '');
    formData.append('category_id', newProductForm.category_id);
    formData.append('is_available', newProductForm.is_available ? '1' : '0');

    const imageFile = productImageFileRef.current;
    if (imageFile instanceof File) {
      formData.append('image', imageFile);
    }

    try {
      let savedProduct;

      if (editingProduct) {
        // Update mode
        savedProduct = await ProductService.updateProduct(
          editingProduct.id,
          formData,
        );
      } else {
        // Create mode
        savedProduct = await ProductService.createProduct(formData);
      }

      // Update local state
      const mappedProduct = mapProductsFromApi([savedProduct])[0];
      if (editingProduct) {
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? mappedProduct : p)),
        );
      } else {
        setProducts((prev) => [...prev, mappedProduct]);
      }

      cancelProductEdit();
    } catch (err) {
      console.error('Error saving product:', err);
      const message =
        err instanceof Error ? err.message : 'Failed to save product';
      alert(message);
    }
  };

  const handleEditProductClick = (product: UiProduct) => {
    setEditingProduct(product);
    setNewProductForm({
      name: product.name,
      price: String(product.price),
      description: product.description,
      category_id: String(product.category?.id ?? ''),
      is_available: Boolean(product.is_available ?? product.available),
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
      is_available: true,
      image: null,
    });
  };

  // Clear unread notifications
  const handleMarkNotificationsRead = async () => {
    try {
      await NotificationService.markAllNotificationsRead();
      const result = await NotificationService.getNotifications();
      setNotifications(result.data as AppNotification[]);
    } catch (err) {
      console.error('Error marking notifications read:', err);
    }
  };

  const handleNotificationOrderSelect = (orderId: number) => {
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      setAdminDetailOrder(order);
      setActiveView('admin-orders');
      setAdminOrderFilter('All');
      setAdminOrderPage(1);
    }
    setIsNotifPanelOpen(false);
  };

  // ==========================================================================
  // Filters & Analytics Computations (useMemo)
  // ==========================================================================

  // Admin Filtering logic for order queues
  const filteredAdminOrders = useMemo(() => {
    return orders.filter((order) =>
      orderMatchesFilter(order, adminOrderFilter),
    );
  }, [orders, adminOrderFilter]);

  const ADMIN_PAGE_SIZE = 10;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredAdminOrders.length / ADMIN_PAGE_SIZE),
  );
  const paginatedAdminOrders = useMemo(() => {
    const start = (adminOrderPage - 1) * ADMIN_PAGE_SIZE;
    return filteredAdminOrders.slice(start, start + ADMIN_PAGE_SIZE);
  }, [filteredAdminOrders, adminOrderPage]);

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
                  setAdminDetailOrder(toast.data as UiOrder);
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
              <div className="max-sm:hidden">
                <h1 className="logo-text">Nikay's Admin</h1>
                <span
                  className="logo-subtitle"
                  style={{ color: 'var(--secondary)' }}
                >
                  Bakery Control Hub
                </span>
              </div>
              <div className="sm:hidden">
                <h1
                  className="text-lg font-bold font-serif"
                  style={{ color: 'var(--espresso)' }}
                >
                  Nikay's
                </h1>
              </div>
            </div>

            {/* Desktop navigation - hidden on small screens */}
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
              {isAuthenticated && (
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'var(--cocoa)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Hi, {user?.first_name}
                </span>
              )}
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

            {/* Mobile hamburger */}
            <button
              className="btn-icon mobile-nav-toggle"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Bars3Icon className="h-6 w-6" aria-hidden />
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <>
            <div
              className="mobile-nav-overlay"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="mobile-nav-drawer">
              <div className="mobile-nav-brand">
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
                  <p className="logo-text" style={{ fontSize: 18 }}>
                    Nikay's Admin
                  </p>
                </div>
              </div>

              <nav className="flex-1 flex flex-col gap-1">
                <button
                  className={`mobile-nav-item ${activeView === 'admin-dashboard' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveView('admin-dashboard');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <ChartBarIcon className="h-5 w-5" aria-hidden />
                  Dashboard
                </button>
                <button
                  className={`mobile-nav-item ${activeView === 'admin-orders' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveView('admin-orders');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <BellIcon className="h-5 w-5" aria-hidden />
                  Order Queue
                  {stats.pending > 0 && (
                    <span
                      className="badge"
                      style={{
                        backgroundColor: 'var(--secondary)',
                        color: 'var(--espresso)',
                        position: 'static',
                        marginLeft: 'auto',
                      }}
                    >
                      {stats.pending}
                    </span>
                  )}
                </button>
                <button
                  className={`mobile-nav-item ${activeView === 'admin-products' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveView('admin-products');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <CurrencyDollarIcon className="h-5 w-5" aria-hidden />
                  Stock Editor
                </button>

                {isAuthenticated && (
                  <div
                    style={{
                      padding: '8px 16px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--espresso)',
                      borderBottom: '1px solid var(--almond)',
                      marginBottom: '4px',
                    }}
                  >
                    Hi, {user?.first_name}
                  </div>
                )}

                <div className="mobile-nav-divider" />

                <button
                  className="mobile-nav-item"
                  onClick={() => {
                    setShowLogoutConfirm(true);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <UserIcon className="h-5 w-5" aria-hidden />
                  Logout
                </button>
              </nav>

              <button
                className="mobile-nav-item justify-center mt-4 text-sm"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{ color: 'var(--cocoa)' }}
              >
                <XMarkIcon className="h-5 w-5" aria-hidden />
                Close
              </button>
            </div>
          </>
        )}

        <main className="main-content">
          {/* VIEW 1: ADMIN ANALYTICS DASHBOARD */}
          {activeView === 'admin-dashboard' && (
            <section className="admin-layout px-4 sm:px-0">
              <div className="container">
                <div className="admin-header-row flex-col sm:flex-row items-start sm:items-center gap-3">
                  <h2 className="admin-view-title text-2xl md:text-3xl lg:text-4xl">
                    Operational Overview
                  </h2>
                  {/* <span
                    style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: 'var(--cocoa)',
                    }}
                  >
                    Live Status:{' '}
                    {pollStatus === 'connected' ? 'Connected' : 'Reconnecting…'}
                  </span> */}
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
                <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6 lg:gap-8 mt-8">
                  <div
                    className="p-4 md:p-6"
                    style={{
                      backgroundColor: 'var(--velvet-cream)',
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
                          <SparklesIcon
                            style={{ width: 20, height: 20 }}
                            aria-hidden
                          />
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
            <section className="admin-layout px-4 sm:px-0">
              <div className="container" style={{ maxWidth: '1000px' }}>
                <div className="admin-header-row flex-col sm:flex-row items-start sm:items-center gap-3">
                  <h2 className="admin-view-title text-2xl md:text-3xl lg:text-4xl">
                    Order Processing Board
                  </h2>
                  {/* <span
                    style={{
                      fontSize: '14px',
                      color: 'var(--cocoa)',
                      fontWeight: '500',
                    }}
                  >
                    Approvals queue updates live.
                  </span> */}
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
                          onClick={() => {
                            setAdminOrderFilter(tab);
                            setAdminOrderPage(1);
                          }}
                        >
                          {tab === 'Ready' ? 'Out for Delivery / Ready' : tab} (
                          {count})
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
                      paginatedAdminOrders.map((order) => (
                        <div
                          key={order.id}
                          className="board-row flex flex-col sm:grid sm:grid-cols-[minmax(200px,420px)_130px_260px] sm:items-center gap-3"
                        >
                          <div
                            className="admin-order-meta"
                            onClick={() => setAdminDetailOrder(order)}
                            title="View order details"
                          >
                            <span className="admin-order-id-badge">
                              {order.id}
                            </span>
                            <div className="admin-order-brief">
                              <h5>{order.customerName}</h5>
                              <span>
                                {order.items.length} product(s) · Total: ₱
                                {order.totalPrice.toLocaleString()} · Placed:{' '}
                                {formatPlacedAt(order)}
                                {order.delivery_date
                                  ? ` · Scheduled: ${formatScheduledAt(order)}`
                                  : ''}
                              </span>
                            </div>
                          </div>
                          {/* Status badge column - fixed 130px via grid */}
                          <span
                            className={`status-badge ${order.status.toLowerCase()} place-self-center`}
                          >
                            {order.status}
                          </span>

                          {/* Action buttons column - consistent sizing */}
                          <div className="admin-order-actions">
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

                            {(order.status === 'Completed' ||
                              order.status === 'Declined') && (
                              <button
                                className="btn-sm btn-view-details"
                                onClick={() => setAdminDetailOrder(order)}
                              >
                                View Details
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}

                    {totalPages > 1 && (
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '16px 0',
                          borderTop: '1px solid var(--almond)',
                          marginTop: '8px',
                        }}
                      >
                        <button
                          className="btn-sm"
                          disabled={adminOrderPage <= 1}
                          onClick={() =>
                            setAdminOrderPage((p) => Math.max(1, p - 1))
                          }
                          style={{
                            padding: '6px 14px',
                            fontSize: '12px',
                            opacity: adminOrderPage <= 1 ? 0.4 : 1,
                            cursor:
                              adminOrderPage <= 1 ? 'not-allowed' : 'pointer',
                            background: 'var(--velvet-cream)',
                            border: '1px solid var(--almond)',
                            borderRadius: '8px',
                            color: 'var(--espresso)',
                          }}
                        >
                          ← Previous
                        </button>

                        <span
                          style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            color: 'var(--cocoa)',
                            padding: '0 8px',
                          }}
                        >
                          Page {adminOrderPage} of {totalPages}
                        </span>

                        <button
                          className="btn-sm"
                          disabled={adminOrderPage >= totalPages}
                          onClick={() =>
                            setAdminOrderPage((p) =>
                              Math.min(totalPages, p + 1),
                            )
                          }
                          style={{
                            padding: '6px 14px',
                            fontSize: '12px',
                            opacity: adminOrderPage >= totalPages ? 0.4 : 1,
                            cursor:
                              adminOrderPage >= totalPages
                                ? 'not-allowed'
                                : 'pointer',
                            background: 'var(--velvet-cream)',
                            border: '1px solid var(--almond)',
                            borderRadius: '8px',
                            color: 'var(--espresso)',
                          }}
                        >
                          Next →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* VIEW 3: STOCK & INVENTORY EDITOR */}
          {activeView === 'admin-products' && (
            <section className="admin-layout px-4 sm:px-0">
              <div className="container">
                <div className="admin-header-row flex-col sm:flex-row items-start sm:items-center gap-3">
                  <h2 className="admin-view-title text-2xl md:text-3xl lg:text-4xl">
                    Product Inventory
                  </h2>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      flexWrap: 'wrap',
                    }}
                  >
                    {/* <span style={{ fontSize: '14px', color: 'var(--cocoa)' }}>
                      Modify menu prices and toggle availability in real-time.
                    </span> */}
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
                          <div
                            key={product.id}
                            className="inventory-item-row flex-col sm:flex-row items-start sm:items-center gap-3"
                          >
                            <div className="inventory-item-meta">
                              <img
                                src={
                                  resolveProductImageUrl(product.image) ||
                                  '/images/placeholder.png'
                                }
                                alt={product.name}
                                className="inventory-item-thumb"
                              />
                              <div className="inventory-item-title">
                                <h5>{product.name}</h5>
                                <span>
                                  ₱{product.price.toLocaleString()} ·{' '}
                                  {product.categoryLabel ||
                                    product.category?.name}
                                </span>
                              </div>
                            </div>
                            <div className="inventory-item-controls flex-wrap">
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
                                    color: product.is_available
                                      ? 'var(--success)'
                                      : 'var(--danger)',
                                  }}
                                >
                                  {(product.is_available ?? product.available)
                                    ? 'Available'
                                    : 'Not Available'}
                                </span>
                                <label className="switch">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(
                                      product.is_available ?? product.available,
                                    )}
                                    disabled={togglingProductId === product.id}
                                    onChange={() =>
                                      handleToggleProductAvailability(
                                        product.id,
                                      )
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
                            <p>
                              Upload a product image (JPEG, PNG, GIF, WebP up to
                              2MB)
                            </p>
                          </div>
                        </div>

                        <form
                          onSubmit={handleSaveProduct}
                          className="product-form-box"
                          style={{ position: 'static', marginTop: 0 }}
                        >
                          <div className="form-group">
                            <label className="form-label">Delicacy Name</label>
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
                            />
                          </div>

                          <div className="form-row">
                            <div className="form-group">
                              <label className="form-label">
                                Base price (6&quot;, PHP)
                              </label>
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
