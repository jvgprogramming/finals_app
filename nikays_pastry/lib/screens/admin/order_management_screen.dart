import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../providers/order_provider.dart';
import '../../models/order.dart';
import '../../utils/currency.dart';
import '../../widgets/loading_spinner.dart';

class OrderManagementScreen extends StatefulWidget {
  const OrderManagementScreen({super.key});

  @override
  State<OrderManagementScreen> createState() => _OrderManagementScreenState();
}

class _OrderManagementScreenState extends State<OrderManagementScreen> {
  String _activeFilter = 'All';
  int _currentPage = 1;
  static const int _pageSize = 10;

  final List<String> _filters = [
    'All', 'Pending', 'Accepted', 'Preparing', 'Ready', 'Completed', 'Declined',
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<OrderProvider>().loadOrders();
    });
  }

  void _showOrderDetail(Order order) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _OrderDetailSheet(order: order),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<OrderProvider>(
      builder: (context, ordersProv, _) {
        final filtered = ordersProv.orders.where((o) {
          if (_activeFilter == 'All') return true;
          return o.statusKey == _activeFilter.toLowerCase();
        }).toList();

        final totalPages = (filtered.length / _pageSize).ceil();
        final start = (_currentPage - 1) * _pageSize;
        final paginated = filtered.skip(start).take(_pageSize).toList();

        return Scaffold(
          body: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Padding(
                padding: EdgeInsets.fromLTRB(16, 16, 16, 8),
                child: Text('Order Processing Board', style: TextStyle(
                  fontFamily: 'PlayfairDisplay',
                  fontSize: 24,
                  fontWeight: FontWeight.w600,
                )),
              ),
              // Filter tabs
              SizedBox(
                height: 44,
                child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Row(
                    children: _filters.map((f) {
                    final count = _activeFilter == f
                        ? filtered.length
                        : ordersProv.orders.where((o) {
                            if (f == 'All') return true;
                            return o.statusKey == f.toLowerCase();
                          }).length;
                    final isActive = _activeFilter == f;
                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: GestureDetector(
                        onTap: () {
                          setState(() {
                            _activeFilter = f;
                            _currentPage = 1;
                          });
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                          decoration: BoxDecoration(
                            color: isActive ? AppColors.velvetCream : Colors.transparent,
                            border: Border(
                              bottom: BorderSide(
                                color: isActive ? AppColors.primary : Colors.transparent,
                                width: 3,
                              ),
                            ),
                          ),
                          child: Text('$f ($count)', style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: isActive ? AppColors.primary : AppColors.cocoa,
                          )),
                        ),
                      ),
                    );
                    }).toList(),
                  ),
                ),
              ),
              const Divider(height: 1),
              // Orders list
              Expanded(
                child: ordersProv.isLoading
                    ? const LoadingSpinner(label: 'Loading orders...')
                    : paginated.isEmpty
                        ? const Center(child: Text('No orders found.', style: TextStyle(color: AppColors.cocoa)))
                        : ListView.builder(
                            padding: const EdgeInsets.all(16),
                            itemCount: paginated.length,
                            itemBuilder: (context, index) {
                              final o = paginated[index];
                              return Container(
                                margin: const EdgeInsets.only(bottom: 8),
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  color: AppColors.velvetCream,
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(color: AppColors.almond),
                                ),
                                child: Row(
                                  children: [
                                    // Order info
                                    GestureDetector(
                                      onTap: () => _showOrderDetail(o),
                                      child: Row(
                                        children: [
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                            decoration: BoxDecoration(
                                              color: AppColors.almond,
                                              borderRadius: BorderRadius.circular(8),
                                            ),
                                            child: Text('#${o.id}', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                                          ),
                                          const SizedBox(width: 12),
                                          Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(o.customerName ?? 'Guest', style: const TextStyle(
                                                fontWeight: FontWeight.w600, fontSize: 14)),
                                              Text('${o.items.length} item(s) · ${formatPeso(o.totalPrice)}',
                                                style: const TextStyle(fontSize: 11, color: AppColors.cocoa)),
                                            ],
                                          ),
                                        ],
                                      ),
                                    ),
                                    const Spacer(),
                                    // Status badge
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: _statusBg(o.statusKey),
                                        borderRadius: BorderRadius.circular(20),
                                      ),
                                      child: Text(o.status, style: TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w700,
                                        color: _statusColor(o.statusKey),
                                      )),
                                    ),
                                    const SizedBox(width: 8),
                                    // Action button
                                    if (o.statusKey == 'pending')
                                      _actionBtn('Review', () => _showOrderDetail(o), AppColors.primary)
                                    else if (o.statusKey == 'accepted')
                                      _actionBtn('Bake', () => _progressOrder(ordersProv, o.id, 'preparing'), AppColors.success)
                                    else if (o.statusKey == 'preparing')
                                      _actionBtn('Ready', () => _progressOrder(ordersProv, o.id, 'ready'), AppColors.info)
                                    else if (o.statusKey == 'ready')
                                      _actionBtn('Complete', () => _progressOrder(ordersProv, o.id, 'completed'), AppColors.success)
                                    else
                                      _actionBtn('Details', () => _showOrderDetail(o), AppColors.cocoa),
                                  ],
                                ),
                              );
                            },
                          ),
              ),
              // Pagination
              if (totalPages > 1)
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      TextButton(
                        onPressed: _currentPage > 1 ? () => setState(() => _currentPage--) : null,
                        child: const Text('← Previous'),
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Text('Page $_currentPage of $totalPages',
                          style: const TextStyle(fontWeight: FontWeight.w600, color: AppColors.cocoa)),
                      ),
                      TextButton(
                        onPressed: _currentPage < totalPages ? () => setState(() => _currentPage++) : null,
                        child: const Text('Next →'),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _progressOrder(OrderProvider provider, int id, String status) async {
    try {
      switch (status) {
        case 'preparing': await provider.markPreparing(id); break;
        case 'ready': await provider.markReady(id); break;
        case 'completed': await provider.completeOrder(id); break;
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    }
  }

  Color _statusColor(String key) {
    switch (key) {
      case 'pending': return AppColors.primary;
      case 'accepted': case 'completed': return AppColors.success;
      case 'preparing': return AppColors.warning;
      case 'ready': return AppColors.info;
      case 'declined': return AppColors.danger;
      default: return AppColors.cocoa;
    }
  }

  Color _statusBg(String key) {
    switch (key) {
      case 'pending': return AppColors.primaryLight;
      case 'accepted': case 'completed': return AppColors.successLight;
      case 'preparing': return const Color(0xFFFFF5E7);
      case 'ready': return const Color(0xFFE7F3FD);
      case 'declined': return AppColors.dangerLight;
      default: return AppColors.almond;
    }
  }

  Widget _actionBtn(String label, VoidCallback onTap, Color color) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(label, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: color)),
      ),
    );
  }
}

// Order Detail Bottom Sheet
class _OrderDetailSheet extends StatefulWidget {
  final Order order;
  const _OrderDetailSheet({required this.order});

  @override
  State<_OrderDetailSheet> createState() => _OrderDetailSheetState();
}

class _OrderDetailSheetState extends State<_OrderDetailSheet> {
  final _remarksController = TextEditingController();
  bool _isDeclining = false;

  @override
  void dispose() {
    _remarksController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final order = widget.order;
    final itemsSubtotal = order.items.fold(0.0, (sum, i) => sum + i.lineTotal);
    final deliveryFee = order.deliveryFee ?? (order.type == 'delivery' ? 50.0 : 0.0);

    return Container(
      height: MediaQuery.of(context).size.height * 0.8,
      decoration: const BoxDecoration(
        color: AppColors.velvetCream,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(child: Container(
              width: 40, height: 4,
              decoration: BoxDecoration(
                color: AppColors.almond,
                borderRadius: BorderRadius.circular(2),
              ),
            )),
            const SizedBox(height: 16),
            Text('Order #${order.orderNumber}', style: const TextStyle(
              fontFamily: 'PlayfairDisplay', fontSize: 22, fontWeight: FontWeight.w600)),
            const SizedBox(height: 20),
            // Customer info
            const Text('CUSTOMER LOGISTICS', style: TextStyle(
              fontSize: 14, fontWeight: FontWeight.w700, letterSpacing: 0.5, color: AppColors.cocoa)),
            const SizedBox(height: 8),
            _infoRow(Icons.person_outline, 'Name', order.customerName ?? '—'),
            _infoRow(Icons.phone_outlined, 'Phone', order.customerPhoneFormatted),
            _infoRow(Icons.calendar_today, 'Placed', '${order.placedDate} at ${order.placedTime}'),
            _infoRow(Icons.event, 'Scheduled', '${order.date} at ${order.time}'),
            _infoRow(Icons.local_shipping_outlined, 'Type', order.type == 'delivery' ? 'Delivery' : 'Pickup'),
            if (order.type == 'delivery' && order.address.isNotEmpty)
              _infoRow(Icons.location_on_outlined, 'Address', order.address),
            const SizedBox(height: 16),
            // Items
            const Text('ORDER BREAKDOWN', style: TextStyle(
              fontSize: 14, fontWeight: FontWeight.w700, letterSpacing: 0.5, color: AppColors.cocoa)),
            const SizedBox(height: 8),
            ...order.items.map((i) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Text('${i.quantity}x ${i.name} — ${formatPeso(i.lineTotal)}',
                style: const TextStyle(fontSize: 13)),
            )),
            const SizedBox(height: 16),
            // Payment summary
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.alabaster,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.almond),
              ),
              child: Column(
                children: [
                  _summaryLine('Items subtotal', formatPeso(itemsSubtotal)),
                  if (deliveryFee > 0) _summaryLine('Delivery fee', formatPeso(deliveryFee)),
                  const Divider(height: 16),
                  _summaryLine('Total Due', formatPeso(order.totalPrice), isTotal: true),
                ],
              ),
            ),
            const SizedBox(height: 20),
            // Actions
            if (order.statusKey == 'pending' && !_isDeclining) ...[
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () => setState(() => _isDeclining = true),
                      style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger),
                      child: const Text('Decline'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () async {
                        await context.read<OrderProvider>().acceptOrder(order.id);
                        if (mounted) Navigator.of(context).pop();
                      },
                      style: ElevatedButton.styleFrom(backgroundColor: AppColors.success),
                      child: const Text('Accept'),
                    ),
                  ),
                ],
              ),
            ],
            if (_isDeclining) ...[
              TextField(
                controller: _remarksController,
                maxLines: 3,
                decoration: const InputDecoration(
                  labelText: 'Rejection Reason *',
                  hintText: 'Why is this order being declined?',
                ),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  TextButton(
                    onPressed: () => setState(() => _isDeclining = false),
                    child: const Text('Cancel'),
                  ),
                  const SizedBox(width: 12),
                  ElevatedButton(
                    onPressed: () async {
                      if (_remarksController.text.trim().isEmpty) return;
                      await context.read<OrderProvider>().declineOrder(order.id, _remarksController.text.trim());
                      if (mounted) Navigator.of(context).pop();
                    },
                    style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger),
                    child: const Text('Confirm Decline'),
                  ),
                ],
              ),
            ],
            // Progress actions for non-pending orders
            if (order.statusKey == 'accepted')
              _progressBtn('Begin Preparing / Baking', () => context.read<OrderProvider>().markPreparing(order.id)),
            if (order.statusKey == 'preparing')
              _progressBtn('Mark Ready for Dispatch', () => context.read<OrderProvider>().markReady(order.id)),
            if (order.statusKey == 'ready')
              _progressBtn('Mark as Completed', () => context.read<OrderProvider>().completeOrder(order.id)),
          ],
        ),
      ),
    );
  }

  Widget _infoRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        children: [
          Icon(icon, size: 16, color: AppColors.cocoa),
          const SizedBox(width: 8),
          Text('$label: ', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.cocoa)),
          Expanded(child: Text(value, style: const TextStyle(fontSize: 13))),
        ],
      ),
    );
  }

  Widget _summaryLine(String label, String value, {bool isTotal = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(
            fontSize: isTotal ? 15 : 13,
            fontWeight: isTotal ? FontWeight.w800 : FontWeight.normal)),
          Text(value, style: TextStyle(
            fontSize: isTotal ? 15 : 13,
            fontWeight: isTotal ? FontWeight.w800 : FontWeight.w600)),
        ],
      ),
    );
  }

  Widget _progressBtn(String label, Future<void> Function() action) {
    return Padding(
      padding: const EdgeInsets.only(top: 12),
      child: SizedBox(
        width: double.infinity,
        child: ElevatedButton(
          onPressed: () async {
            await action();
            if (mounted) Navigator.of(context).pop();
          },
          child: Text(label),
        ),
      ),
    );
  }
}
