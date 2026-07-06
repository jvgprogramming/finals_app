import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../providers/auth_provider.dart';
import '../../providers/notification_provider.dart';
import '../../widgets/notification_panel.dart';
import 'dashboard_screen.dart';
import 'order_management_screen.dart';
import 'product_management_screen.dart';

class AdminHome extends StatefulWidget {
  const AdminHome({super.key});

  @override
  State<AdminHome> createState() => _AdminHomeState();
}

class _AdminHomeState extends State<AdminHome> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    DashboardScreen(),
    OrderManagementScreen(),
    ProductManagementScreen(),
  ];

  void _showLogoutConfirm() {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Log out?'),
        content: const Text('You will need to sign in again to access the admin dashboard.'),
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
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
            child: const Text('Log out'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final notifProv = context.watch<NotificationProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text("Nikay's Admin", style: TextStyle(
          fontFamily: 'PlayfairDisplay',
          fontSize: 20,
          fontWeight: FontWeight.w700,
          color: AppColors.espresso,
        )),
        actions: [
          // Notification bell
          NotificationPanel(
            notifications: notifProv.notifications,
            unreadCount: notifProv.unreadCount,
            isShaking: notifProv.isShaking,
            onToggle: () => _showNotifications(context),
            onMarkAllRead: () => notifProv.markAllRead(),
            onSelectOrder: (id) {},
          ),
          // User greeting
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: Center(
              child: Text('Hi, ${auth.user?.firstName ?? ""}', style: const TextStyle(
                fontSize: 13, fontWeight: FontWeight.w500, color: AppColors.cocoa)),
            ),
          ),
          // Logout
          IconButton(
            icon: Icon(Icons.logout, size: 20, color: AppColors.cocoa.withValues(alpha: 0.7)),
            onPressed: _showLogoutConfirm,
            tooltip: 'Logout',
          ),
        ],
      ),
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: AppColors.velvetCream,
          border: Border(top: BorderSide(color: AppColors.almond.withValues(alpha: 0.5))),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _navItem(Icons.dashboard_outlined, Icons.dashboard, 'Dashboard', 0),
                _navItem(Icons.receipt_long_outlined, Icons.receipt_long, 'Orders', 1),
                _navItem(Icons.inventory_2_outlined, Icons.inventory_2, 'Products', 2),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _navItem(IconData icon, IconData activeIcon, String label, int index) {
    final isActive = _currentIndex == index;
    return GestureDetector(
      onTap: () => setState(() => _currentIndex = index),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isActive ? AppColors.primaryLight : Colors.transparent,
          borderRadius: BorderRadius.circular(30),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(isActive ? activeIcon : icon, size: 20,
              color: isActive ? AppColors.primary : AppColors.cocoa),
            if (isActive) ...[
              const SizedBox(width: 6),
              Text(label, style: const TextStyle(
                fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.primary)),
            ],
          ],
        ),
      ),
    );
  }

  void _showNotifications(BuildContext context) {
    final notifProv = context.read<NotificationProvider>();
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (_) => Container(
        height: 400,
        decoration: const BoxDecoration(
          color: AppColors.velvetCream,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          children: [
            Container(
              margin: const EdgeInsets.symmetric(vertical: 8),
              width: 40, height: 4,
              decoration: BoxDecoration(
                color: AppColors.almond,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Notifications', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                  if (notifProv.unreadCount > 0)
                    GestureDetector(
                      onTap: () => notifProv.markAllRead(),
                      child: const Text('Mark all read', style: TextStyle(
                        fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.primary))),
                ],
              ),
            ),
            const Divider(),
            Expanded(
              child: notifProv.notifications.isEmpty
                  ? const Center(child: Text('No notifications', style: TextStyle(color: AppColors.cocoa)))
                  : ListView.builder(
                      itemCount: notifProv.notifications.length,
                      itemBuilder: (context, index) {
                        final n = notifProv.notifications[index];
                        return Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: n.isRead ? Colors.transparent : AppColors.primaryLight.withValues(alpha: 0.3),
                            border: Border(bottom: BorderSide(color: AppColors.almond)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(n.title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                              const SizedBox(height: 4),
                              Text(n.message, style: const TextStyle(fontSize: 12, color: AppColors.cocoa)),
                              const SizedBox(height: 4),
                              Text(n.formattedDate, style: const TextStyle(fontSize: 11, color: AppColors.cocoa)),
                            ],
                          ),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
