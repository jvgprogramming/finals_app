import 'api_client.dart';
import '../config/api_config.dart';
import '../models/order.dart';

class OrderService {
  final ApiClient _client = ApiClient();

  Future<List<Order>> getOrders() async {
    final data = await _client.get(ApiConfig.orders);
    final list = data['data'] as List;
    return list.map((j) => Order.fromJson(j as Map<String, dynamic>)).toList();
  }

  Future<Order> getOrder(int id) async {
    final data = await _client.get(ApiConfig.order(id));
    return Order.fromJson(data['data'] as Map<String, dynamic>);
  }

  Future<Order> createOrder(Map<String, dynamic> body) async {
    final data = await _client.post(ApiConfig.orders, body: body);
    return Order.fromJson(data['data'] as Map<String, dynamic>);
  }

  Future<Order> acceptOrder(int id) async {
    final data = await _client.patch(ApiConfig.acceptOrder(id));
    return Order.fromJson(data['data'] as Map<String, dynamic>);
  }

  Future<Order> declineOrder(int id, String reason) async {
    final data = await _client.patch(ApiConfig.declineOrder(id), body: {'reason': reason});
    return Order.fromJson(data['data'] as Map<String, dynamic>);
  }

  Future<Order> markPreparing(int id) async {
    final data = await _client.patch(ApiConfig.markPreparing(id));
    return Order.fromJson(data['data'] as Map<String, dynamic>);
  }

  Future<Order> markReady(int id) async {
    final data = await _client.patch(ApiConfig.markReady(id));
    return Order.fromJson(data['data'] as Map<String, dynamic>);
  }

  Future<Order> completeOrder(int id) async {
    final data = await _client.patch(ApiConfig.completeOrder(id));
    return Order.fromJson(data['data'] as Map<String, dynamic>);
  }
}
