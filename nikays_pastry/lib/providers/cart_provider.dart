import 'package:flutter/foundation.dart';
import '../models/cart_item.dart';
import '../services/cart_service.dart';

class CartProvider with ChangeNotifier {
  final CartService _cartService = CartService();
  List<CartItem> _items = [];
  bool _isLoading = false;

  List<CartItem> get items => _items;
  bool get isLoading => _isLoading;

  int get totalQuantity => _items.fold(0, (sum, item) => sum + item.quantity);
  double get subtotal => _items.fold(0.0, (sum, item) => sum + item.lineTotal);
  bool get isEmpty => _items.isEmpty;

  Future<void> loadCart() async {
    _isLoading = true;
    notifyListeners();
    _items = await _cartService.getCart();
    _isLoading = false;
    notifyListeners();
  }

  Future<void> addItem(Map<String, dynamic> item) async {
    _items = await _cartService.addItem(item);
    notifyListeners();
  }

  Future<void> updateQuantity(String lineId, int newQty) async {
    _items = await _cartService.updateQuantity(lineId, newQty);
    notifyListeners();
  }

  Future<void> removeItem(String lineId) async {
    _items = await _cartService.removeItem(lineId);
    notifyListeners();
  }

  Future<void> clearCart() async {
    await _cartService.clearCart();
    _items = [];
    notifyListeners();
  }
}
