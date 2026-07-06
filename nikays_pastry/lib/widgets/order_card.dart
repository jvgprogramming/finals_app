import 'package:flutter/material.dart';
import '../config/theme.dart';
import '../models/order.dart';
import '../utils/currency.dart';

class OrderCard extends StatelessWidget {
  final Order order;
  final VoidCallback? onTap;

  const OrderCard({super.key, required this.order, this.onTap});

  static const List<String> _statusSteps = [
    'pending', 'accepted', 'preparing', 'ready', 'completed',
  ];

  Color _statusColor(String status) {
    switch (status) {
      case 'pending': return AppColors.primary;
      case 'accepted': return AppColors.success;
      case 'preparing': return AppColors.warning;
      case 'ready': return AppColors.info;
      case 'completed': return AppColors.success;
      case 'declined': return AppColors.danger;
      default: return AppColors.cocoa;
    }
  }

  Color _statusBg(String status) {
    switch (status) {
      case 'pending': return AppColors.primaryLight;
      case 'accepted': return AppColors.successLight;
      case 'preparing': return const Color(0xFFFFF5E7);
      case 'ready': return const Color(0xFFE7F3FD);
      case 'completed': return AppColors.successLight;
      case 'declined': return AppColors.dangerLight;
      default: return AppColors.almond;
    }
  }

  String _statusLabel(String status) {
    if (status == 'ready' && order.type == 'delivery') return 'Out for Delivery';
    if (status == 'ready') return 'Ready for Pickup';
    return status[0].toUpperCase() + status.substring(1);
  }

  @override
  Widget build(BuildContext context) {
    final activeIndex = _statusSteps.indexOf(order.statusKey);
    final isDeclined = order.statusKey == 'declined';

    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: AppColors.velvetCream,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppColors.almond),
          boxShadow: [
            BoxShadow(
              color: AppColors.espresso.withValues(alpha: 0.03),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Order: ${order.orderNumber}', style: const TextStyle(
                        fontFamily: 'PlayfairDisplay',
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      )),
                      const SizedBox(height: 2),
                      Text('Submitted: ${order.placedDate} at ${order.placedTime}',
                        style: const TextStyle(fontSize: 12, color: AppColors.cocoa)),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: _statusBg(order.statusKey),
                    borderRadius: BorderRadius.circular(30),
                  ),
                  child: Text(
                    _statusLabel(order.statusKey),
                    style: TextStyle(
                      fontFamily: 'Outfit',
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.5,
                      color: _statusColor(order.statusKey),
                    ),
                  ),
                ),
              ],
            ),
            // Progress bar
            if (!isDeclined) ...[
              const SizedBox(height: 20),
              LayoutBuilder(
                builder: (context, constraints) {
                  final barWidth = constraints.maxWidth;
                  final fillFraction = (activeIndex / (_statusSteps.length - 1)).clamp(0.0, 1.0);
                  return SizedBox(
                    height: 48,
                    child: Stack(
                      children: [
                        // Background line
                        Positioned(
                          left: 0, right: 0, top: 12,
                          child: Container(height: 4, decoration: BoxDecoration(
                            color: AppColors.almond,
                            borderRadius: BorderRadius.circular(2),
                          )),
                        ),
                        // Fill line
                        if (activeIndex >= 0)
                          Positioned(
                            left: 0, top: 12,
                            width: barWidth * fillFraction,
                            child: Container(height: 4, decoration: BoxDecoration(
                              color: AppColors.success,
                              borderRadius: BorderRadius.circular(2),
                            )),
                          ),
                        // Steps
                        Positioned.fill(
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: _statusSteps.map((step) {
                              final idx = _statusSteps.indexOf(step);
                              final isCompleted = idx <= activeIndex;
                              final isActive = idx == activeIndex;

                              String label = step[0].toUpperCase() + step.substring(1);
                              if (step == 'ready') {
                                label = order.type == 'delivery' ? 'Delivery' : 'Pickup';
                              }

                              return Column(
                                children: [
                                  Container(
                                    width: 24, height: 24,
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      color: isCompleted
                                          ? AppColors.success
                                          : AppColors.velvetCream,
                                      border: Border.all(
                                        color: isCompleted
                                            ? AppColors.success
                                            : AppColors.almond,
                                        width: isActive ? 4 : 3,
                                      ),
                                    ),
                                    child: isCompleted
                                        ? const Icon(Icons.check, size: 14, color: Colors.white)
                                        : null,
                                  ),
                                  const SizedBox(height: 4),
                                  Text(label, style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                                    color: isCompleted
                                        ? AppColors.success
                                        : AppColors.cocoa,
                                  )),
                                ],
                              );
                            }).toList(),
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ],
            // Declined message
            if (isDeclined) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.dangerLight,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.danger.withValues(alpha: 0.15)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.warning_amber_rounded, size: 18, color: AppColors.danger),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Bakery: ${order.notes ?? "Order was declined"}',
                        style: const TextStyle(fontSize: 13, color: AppColors.danger)),
                    ),
                  ],
                ),
              ),
            ],
            // Details
            const SizedBox(height: 16),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  flex: 3,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('ORDER DETAILS', style: TextStyle(
                        fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 1,
                        color: AppColors.cocoa,
                      )),
                      const SizedBox(height: 8),
                      ...order.items.take(3).map((item) => Padding(
                        padding: const EdgeInsets.only(bottom: 4),
                        child: Text(
                          '${item.quantity}x ${item.name}',
                          style: const TextStyle(fontSize: 13),
                        ),
                      )),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  flex: 2,
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.alabaster,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.almond),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('${order.type == 'delivery' ? 'Delivery' : 'Pickup'}',
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                        const SizedBox(height: 4),
                        Text(order.date, style: const TextStyle(fontSize: 11, color: AppColors.cocoa)),
                        Text(order.time, style: const TextStyle(fontSize: 11, color: AppColors.cocoa)),
                        const Divider(height: 16),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Total:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                            Text(formatPeso(order.totalPrice),
                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                          ],
                        ),
                      ],
                    ),
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
