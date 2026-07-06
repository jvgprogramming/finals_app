import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/order_provider.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/order_card.dart';
import '../../widgets/loading_spinner.dart';
import '../../widgets/empty_state.dart';

class OrdersScreen extends StatefulWidget {
  const OrdersScreen({super.key});

  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<OrderProvider>().loadOrders();
    });
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    if (!auth.isAuthenticated) {
      return Scaffold(
        body: SafeArea(
          top: false,
          child: const EmptyState(
            icon: Icons.lock_outline,
            title: 'Sign in to view orders',
            description: 'Order history is tied to your account.',
          ),
        ),
      );
    }

    return Consumer<OrderProvider>(
      builder: (context, ordersProv, _) {
        return Scaffold(
          body: SafeArea(
            top: false,
            child: ordersProv.isLoading
                ? const LoadingSpinner(label: 'Loading your orders...')
                : ordersProv.orders.isEmpty
                    ? const EmptyState(
                        icon: Icons.receipt_long_outlined,
                        title: 'No orders placed yet!',
                        description: 'Browse our delightful cake selections and place your first order.',
                      )
                    : RefreshIndicator(
                        onRefresh: () => ordersProv.loadOrders(),
                        child: ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: ordersProv.orders.length,
                          itemBuilder: (context, index) {
                            final order = ordersProv.orders[index];
                            return OrderCard(order: order);
                          },
                        ),
                      ),
          ),
        );
      },
    );
  }
}
