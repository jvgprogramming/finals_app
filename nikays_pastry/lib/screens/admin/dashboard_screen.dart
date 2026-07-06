import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../providers/order_provider.dart';
import '../../utils/currency.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<OrderProvider>().loadOrders();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<OrderProvider>(
      builder: (context, ordersProv, _) {
        final orders = ordersProv.orders;
        final stats = _computeStats(orders);
        final pendingOrders = orders.where((o) => o.statusKey == 'pending').take(3).toList();

        return Scaffold(
          body: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Operational Overview', style: TextStyle(
                  fontFamily: 'PlayfairDisplay',
                  fontSize: 28,
                  fontWeight: FontWeight.w600,
                )),
                const SizedBox(height: 24),
                // Stats grid
                _statCard('Pending Approvals', '${stats['pending']}', const Color(0xFFD47C6A)),
                const SizedBox(height: 12),
                _statCard('Active Baking Queue', '${stats['accepted']}', const Color(0xFF749A7A)),
                const SizedBox(height: 12),
                _statCard('Declined Requests', '${stats['declined']}', const Color(0xFFB85C5C)),
                const SizedBox(height: 12),
                _statCard('Total Sales Revenue', formatPeso(stats['revenue'] as double), const Color(0xFFDCAE6C)),
                const SizedBox(height: 24),
                // Sales chart
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFFDFB),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0xFFF4EAE1)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Sales Analytics Trends', style: TextStyle(
                        fontSize: 18, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 16),
                      SizedBox(
                        height: 200,
                        child: _SalesChart(orders: orders),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
                // Recent queue alerts
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFFDFB),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0xFFF4EAE1)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Recent Queue Alerts', style: TextStyle(
                        fontSize: 18, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 16),
                      if (pendingOrders.isEmpty)
                        const Padding(
                          padding: EdgeInsets.all(24),
                          child: Center(child: Text('All clear! No pending orders.',
                            style: TextStyle(color: Color(0xFF6E5A56)))),
                        )
                      else
                        ...pendingOrders.map((o) => Container(
                          padding: const EdgeInsets.all(12),
                          margin: const EdgeInsets.only(bottom: 8),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFAF6F2),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: const Color(0xFFF4EAE1)),
                          ),
                          child: Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text('#${o.id}', style: const TextStyle(
                                      fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFFD47C6A))),
                                    Text(o.customerName ?? 'Guest', style: const TextStyle(
                                      fontSize: 13, fontWeight: FontWeight.w600)),
                                    Text('${o.items.length} item(s) · ${formatPeso(o.totalPrice)}',
                                      style: const TextStyle(fontSize: 11, color: Color(0xFF6E5A56))),
                                  ],
                                ),
                              ),
                              const Text('Inspect', style: TextStyle(
                                fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xFFD47C6A))),
                            ],
                          ),
                        )),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Map<String, dynamic> _computeStats(List orders) {
    int pending = 0, accepted = 0, declined = 0, completed = 0;
    double revenue = 0;
    for (final o in orders) {
      switch (o.statusKey) {
        case 'pending': pending++; break;
        case 'accepted': case 'preparing': case 'ready': accepted++; break;
        case 'declined': declined++; break;
        case 'completed': completed++; revenue += o.totalPrice; break;
      }
    }
    return {'pending': pending, 'accepted': accepted, 'declined': declined, 'completed': completed, 'revenue': revenue};
  }

  Widget _statCard(String title, String value, Color accentColor) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFFFFFDFB),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFF4EAE1)),
      ),
      child: Row(
        children: [
          Container(width: 4, height: 48, decoration: BoxDecoration(
            color: accentColor,
            borderRadius: BorderRadius.circular(2),
          )),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(
                fontSize: 12, fontWeight: FontWeight.w700, letterSpacing: 0.5,
                color: Color(0xFF6E5A56))),
              const SizedBox(height: 4),
              Text(value, style: TextStyle(
                fontSize: 28, fontWeight: FontWeight.w800, color: accentColor)),
            ],
          ),
        ],
      ),
    );
  }
}

// Sales chart
class _SalesChart extends StatelessWidget {
  final List orders;
  const _SalesChart({required this.orders});

  @override
  Widget build(BuildContext context) {
    // Build 7-day trend
    final now = DateTime.now();
    final points = <({String label, String dateKey, double revenue})>[];
    for (int i = 6; i >= 0; i--) {
      final d = DateTime(now.year, now.month, now.day - i);
      final key = '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
      final labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      points.add((label: labels[d.weekday - 1], dateKey: key, revenue: 0));
    }

    for (final o in orders) {
      if (o.statusKey != 'completed') {
        continue;
      }
      final src = o.createdAt ?? o.deliveryDate;
      if (src == null || src.isEmpty) {
        continue;
      }
      try {
        final normalized = src.contains('T') ? src : src.replaceFirst(' ', 'T');
        final dt = DateTime.parse(normalized);
        final key = '${dt.year}-${dt.month.toString().padLeft(2, '0')}-${dt.day.toString().padLeft(2, '0')}';
        final idx = points.indexWhere((p) => p.dateKey == key);
        if (idx >= 0) {
          points[idx] = (label: points[idx].label, dateKey: key, revenue: points[idx].revenue + o.totalPrice);
        }
      } catch (_) {}
    }

    final maxRev = points.fold(0.0, (max, p) => p.revenue > max ? p.revenue : max);
    final hasData = points.any((p) => p.revenue > 0);

    if (!hasData) {
      return const Center(child: Text('No sales data yet', style: TextStyle(color: Color(0xFF6E5A56))));
    }

    return CustomPaint(
      size: const Size(double.infinity, 200),
      painter: _ChartPainter(points, maxRev > 0 ? maxRev : 1),
    );
  }
}

class _ChartPainter extends CustomPainter {
  final List<({String label, String dateKey, double revenue})> points;
  final double maxRev;

  _ChartPainter(this.points, this.maxRev);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFFD47C6A)
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final fillPaint = Paint()
      ..shader = LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [const Color(0xFFD47C6A).withValues(alpha: 0.2), const Color(0xFFD47C6A).withValues(alpha: 0.0)],
      ).createShader(Rect.fromLTWH(0, 0, size.width, size.height));

    final leftPad = 50.0;
    final chartW = size.width - leftPad - 20;
    final chartH = size.height - 30;

    if (points.isEmpty) return;

    final coords = points.asMap().entries.map((e) {
      final x = leftPad + (e.key / (points.length - 1)) * chartW;
      final y = 20 + chartH - (e.value.revenue / maxRev) * chartH;
      return Offset(x, y);
    }).toList();

    // Fill area
    final path = Path()..moveTo(coords.first.dx, 20 + chartH);
    for (final c in coords) path.lineTo(c.dx, c.dy);
    path.lineTo(coords.last.dx, 20 + chartH);
    path.close();
    canvas.drawPath(path, fillPaint);

    // Line
    final linePath = Path()..moveTo(coords.first.dx, coords.first.dy);
    for (int i = 1; i < coords.length; i++) {
      linePath.lineTo(coords[i].dx, coords[i].dy);
    }
    canvas.drawPath(linePath, paint);

    // Points
    for (final c in coords) {
      canvas.drawCircle(c, 5, Paint()..color = const Color(0xFF2A1D19));
      canvas.drawCircle(c, 5, Paint()
        ..color = const Color(0xFFD47C6A)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2);
    }

    // Labels
    for (int i = 0; i < points.length; i++) {
      final tp = TextPainter(
        text: TextSpan(text: points[i].label, style: const TextStyle(fontSize: 10, color: Color(0xFF6E5A56))),
        textDirection: TextDirection.ltr,
      )..layout();
      tp.paint(canvas, Offset(coords[i].dx - tp.width / 2, size.height - 20));
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
