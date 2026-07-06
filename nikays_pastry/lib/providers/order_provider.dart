import 'package:flutter/foundation.dart';
import '../models/order.dart';
import '../services/order_service.dart';

class OrderProvider with ChangeNotifier {
  final OrderService _orderService = OrderService();
  List<Order> _orders = [];
  bool _isLoading = false;
  String? _error;

  List<Order> get orders => _orders;
  bool get isLoading => _isLoading;
  String? get error => _error;

  List<Order> get filteredOrders {
    return _orders.where((o) => o.statusKey == 'pending').toList();
  }

  Future<void> loadOrders() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      _orders = await _orderService.getOrders();
    } catch (e) {
      _error = e.toString();
    }
    _isLoading = false;
    notifyListeners();
  }

  Future<Order> createOrder(Map<String, dynamic> body) async {
    final order = await _orderService.createOrder(body);
    _orders.insert(0, order);
    notifyListeners();
    return order;
  }

  Future<Order> acceptOrder(int id) async {
    final updated = await _orderService.acceptOrder(id);
    _updateOrder(updated);
    return updated;
  }

  Future<Order> declineOrder(int id, String reason) async {
    final updated = await _orderService.declineOrder(id, reason);
    _updateOrder(updated);
    return updated;
  }

  Future<Order> markPreparing(int id) async {
    final updated = await _orderService.markPreparing(id);
    _updateOrder(updated);
    return updated;
  }

  Future<Order> markReady(int id) async {
    final updated = await _orderService.markReady(id);
    _updateOrder(updated);
    return updated;
  }

  Future<Order> completeOrder(int id) async {
    final updated = await _orderService.completeOrder(id);
    _updateOrder(updated);
    return updated;
  }

  void _updateOrder(Order updated) {
    final idx = _orders.indexWhere((o) => o.id == updated.id);
    if (idx >= 0) {
      _orders[idx] = updated;
      notifyListeners();
    }
  }
}
