class ApiConfig {
  static const String baseUrl = 'http://192.168.254.115:8000/api';

  // Auth
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String logout = '/auth/logout';
  static const String me = '/auth/me';

  // Products
  static const String products = '/products';
  static String product(int id) => '/products/$id';

  // Categories
  static const String categories = '/categories';

  // Orders
  static const String orders = '/orders';
  static String order(int id) => '/orders/$id';
  static String acceptOrder(int id) => '/orders/$id/accept';
  static String declineOrder(int id) => '/orders/$id/decline';
  static String markPreparing(int id) => '/orders/$id/mark-preparing';
  static String markReady(int id) => '/orders/$id/mark-ready';
  static String completeOrder(int id) => '/orders/$id/complete';

  // Cart
  static const String cart = '/cart';
  static const String cartAdd = '/cart/add';
  static String cartUpdate(int id) => '/cart/update/$id';
  static String cartRemove(int id) => '/cart/remove/$id';
  static const String cartClear = '/cart/clear';
  static const String cartSync = '/cart/sync';

  // Notifications
  static const String notifications = '/notifications';
  static String markNotificationRead(int id) => '/notifications/$id/read';
  static const String markAllNotificationsRead = '/notifications/mark-all-read';

  // Users (Admin)
  static const String loadUsers = '/user/loadUsers';
  static const String storeUser = '/user/storeUser';
  static String updateUser(int id) => '/user/updateUser/$id';
  static String destroyUser(int id) => '/user/destroyUser/$id';

  static String resolveImageUrl(String? url) {
    if (url == null || url.isEmpty) return '';
    final normalized = url.replaceAll('\\', '/');
    if (normalized.startsWith('http://') ||
        normalized.startsWith('https://') ||
        normalized.startsWith('data:')) {
      return normalized;
    }
    final origin = baseUrl.replaceAll('/api', '');
    if (normalized.startsWith('/')) return '$origin$normalized';
    if (normalized.startsWith('products/')) return '$origin/storage/$normalized';
    if (normalized.startsWith('storage/')) return '$origin/$normalized';
    if (normalized.startsWith('public/')) {
      return '$origin/${normalized.replaceFirst('public/', 'storage/')}';
    }
    return '$origin/storage/products/$normalized';
  }
}
