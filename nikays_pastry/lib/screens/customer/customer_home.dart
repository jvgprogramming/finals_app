import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/cart_provider.dart';
import '../../providers/notification_provider.dart';
import '../../providers/product_provider.dart';
import '../auth/login_screen.dart';
import 'catalog_screen.dart';
import 'cart_drawer.dart';
import 'orders_screen.dart';

class CustomerHome extends StatefulWidget {
  const CustomerHome({super.key});

  @override
  State<CustomerHome> createState() => _CustomerHomeState();
}

class _CustomerHomeState extends State<CustomerHome> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    CatalogScreen(),
    OrdersScreen(),
  ];

  void _openLogin() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const LoginScreen(),
    );
  }

  void _openCart() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const CartDrawer(),
    );
  }

  void _showLogoutConfirm() {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Log out?'),
        content: const Text(
            'You will need to sign in again to place orders and track deliveries.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
              context.read<AuthProvider>().logout();
            },
            style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFD47C6A)),
            child: const Text('Log out'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final cart = context.watch<CartProvider>();
    final notifProv = context.watch<NotificationProvider>();
    final topPad = MediaQuery.of(context).padding.top;

    return Scaffold(
      appBar: PreferredSize(
        preferredSize: Size.fromHeight(72 + topPad),
        child: Container(
          padding: EdgeInsets.only(top: topPad),
          decoration: BoxDecoration(
            color: const Color(0xFFFAF6F2).withValues(alpha: 0.85),
            border: Border(
              bottom: BorderSide(
                color: const Color(0xFF2A1D19).withValues(alpha: 0.05),
              ),
            ),
          ),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: SizedBox(
              height: 72,
              child: Row(
                children: [
                  // Logo
                  GestureDetector(
                    onTap: () => setState(() => _currentIndex = 0),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 36,
                          height: 36,
                          decoration: BoxDecoration(
                            color: const Color(0xFFF7E6E2),
                            shape: BoxShape.circle,
                            border: Border.all(
                                color: const Color(0xFFD47C6A), width: 1.5),
                          ),
                          child: const Center(
                            child: Text('N',
                                style: TextStyle(
                                  fontFamily: 'PlayfairDisplay',
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFFD47C6A),
                                )),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Column(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text("Nikay's Pastry",
                                style: TextStyle(
                                  fontFamily: 'PlayfairDisplay',
                                  fontSize: 18,
                                  fontWeight: FontWeight.w700,
                                  color: Color(0xFF2A1D19),
                                )),
                            Text(
                              _currentIndex == 0
                                  ? 'Browse Menu'
                                  : 'My Orders',
                              style: const TextStyle(
                                fontSize: 10,
                                letterSpacing: 2,
                                color: Color(0xFF6E5A56),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const Spacer(),

                  // Login / User greeting
                  if (!auth.isAuthenticated)
                    GestureDetector(
                      onTap: _openLogin,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 14, vertical: 6),
                        decoration: BoxDecoration(
                          border: Border.all(
                              color: const Color(0xFFF4EAE1)),
                          borderRadius: BorderRadius.circular(20),
                          color: const Color(0xFFF7E6E2),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.person_outline,
                                size: 16,
                                color: Color(0xFFD47C6A)),
                            SizedBox(width: 4),
                            Text('Sign In',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: Color(0xFFD47C6A),
                                )),
                          ],
                        ),
                      ),
                    )
                  else
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          'Hi, ${auth.user?.firstName ?? ""}',
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                            color: Color(0xFF6E5A56),
                          ),
                        ),
                        const SizedBox(width: 4),
                        IconButton(
                          icon:
                              const Icon(Icons.logout, size: 18),
                          onPressed: _showLogoutConfirm,
                          color: const Color(0xFF6E5A56),
                          tooltip: 'Logout',
                        ),
                      ],
                    ),
                ],
              ),
            ),
          ),
        ),
      ),
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: const Color(0xFFFFFDFB),
          border: Border(
            top: BorderSide(
              color: const Color(0xFFF4EAE1).withValues(alpha: 0.5),
            ),
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _navItem(
                    Icons.home_outlined, Icons.home, 0,
                    onTap: () => context.read<ProductProvider>().silentRefresh()),
                // Cart button
                GestureDetector(
                  onTap: _openCart,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                    child: Stack(
                      clipBehavior: Clip.none,
                      children: [
                        const Icon(Icons.shopping_cart_outlined, size: 22, color: Color(0xFF6E5A56)),
                        if (cart.totalQuantity > 0)
                          Positioned(
                            top: -4,
                            right: -6,
                            child: Container(
                              padding: const EdgeInsets.all(4),
                              decoration: const BoxDecoration(
                                color: Color(0xFFD47C6A),
                                shape: BoxShape.circle,
                              ),
                              child: Text(
                                '${cart.totalQuantity}',
                                style: const TextStyle(
                                  fontSize: 9,
                                  fontWeight: FontWeight.w700,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
                _navItem(
                    Icons.receipt_long_outlined,
                    Icons.receipt_long,
                    1,
                    badge: notifProv.unreadCount,
                    onTap: () => notifProv.markAllRead()),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _navItem(IconData icon, IconData activeIcon,
      int index,
      {int badge = 0, VoidCallback? onTap}) {
    final isActive = _currentIndex == index;
    return GestureDetector(
      onTap: () {
        setState(() => _currentIndex = index);
        onTap?.call();
      },
      child: Container(
        padding:
            const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
        decoration: BoxDecoration(
          color: isActive
              ? const Color(0xFFF7E6E2)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(30),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Stack(
              clipBehavior: Clip.none,
              children: [
                Icon(
                  isActive ? activeIcon : icon,
                  size: 22,
                  color: isActive
                      ? const Color(0xFFD47C6A)
                      : const Color(0xFF6E5A56),
                ),
                if (badge > 0)
                  Positioned(
                    top: -4,
                    right: -6,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(
                        color: Color(0xFFD47C6A),
                        shape: BoxShape.circle,
                      ),
                      child: Text('$badge',
                          style: const TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.w700,
                            color: Colors.white)),
                    ),
                  ),
              ],
            ),

          ],
        ),
      ),
    );
  }
}
