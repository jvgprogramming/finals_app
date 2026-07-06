import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'api_client.dart';
import '../config/api_config.dart';
import '../models/cart_item.dart';

class CartService {
  static const String _cartKey = 'np_cart';
  final ApiClient _client = ApiClient();

  // --- Guest cart helpers ---

  Future<List<CartItem>> _getLocalCart() async {
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getString(_cartKey);
    if (saved == null || saved.isEmpty) return [];
    try {
      final list = jsonDecode(saved) as List;
      return list.map((j) => CartItem.fromJson(j as Map<String, dynamic>)).toList();
    } catch (_) {
      return [];
    }
  }

  Future<void> _setLocalCart(List<CartItem> items) async {
    final prefs = await SharedPreferences.getInstance();
    final encoded = jsonEncode(items.map((i) => i.toJson()).toList());
    await prefs.setString(_cartKey, encoded);
  }

  Future<bool> _isAuthenticated() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.containsKey('auth_token');
  }

  // --- Public API ---

  Future<List<CartItem>> getCart() async {
    if (!await _isAuthenticated()) return _getLocalCart();
    try {
      final data = await _client.get(ApiConfig.cart);
      final list = data['data'] as List;
      return list.map((j) => CartItem.fromJson(j as Map<String, dynamic>)).toList();
    } catch (_) {
      return _getLocalCart();
    }
  }

  Future<List<CartItem>> addItem(Map<String, dynamic> item) async {
    if (!await _isAuthenticated()) {
      final cart = await _getLocalCart();
      final existingIndex = cart.indexWhere(
        (ci) => ci.productId == item['product_id'] && ci.size == item['size'],
      );
      if (existingIndex >= 0) {
        cart[existingIndex].quantity += (item['quantity'] as num).toInt();
        cart[existingIndex].price = (item['price'] as num).toDouble();
        if (item['dedication'] != null) {
          cart[existingIndex].dedication = item['dedication'] as String?;
        }
      } else {
        cart.add(CartItem(
          productId: item['product_id'] as int,
          name: item['name'] as String,
          price: (item['price'] as num).toDouble(),
          quantity: (item['quantity'] as num).toInt(),
          size: item['size'] as String? ?? '6" Personal',
          dedication: item['dedication'] as String?,
          image: item['image'] as String? ?? '',
        ));
      }
      await _setLocalCart(cart);
      return cart;
    }

    try {
      await _client.post(ApiConfig.cartAdd, body: item);
      return getCart();
    } catch (_) {
      return _getLocalCart();
    }
  }

  Future<List<CartItem>> updateQuantity(String lineId, int newQty) async {
    if (!await _isAuthenticated()) {
      var cart = await _getLocalCart();
      if (newQty <= 0) {
        cart.removeWhere((item) => item.lineId == lineId);
      } else {
        final idx = cart.indexWhere((item) => item.lineId == lineId);
        if (idx >= 0) cart[idx].quantity = newQty;
      }
      await _setLocalCart(cart);
      return cart;
    }

    try {
      if (newQty <= 0) {
        await _client.delete(ApiConfig.cartRemove(int.parse(lineId)));
      } else {
        await _client.post(ApiConfig.cartUpdate(int.parse(lineId)), body: {'quantity': newQty});
      }
      return getCart();
    } catch (_) {
      return getCart();
    }
  }

  Future<List<CartItem>> removeItem(String lineId) async {
    if (!await _isAuthenticated()) {
      var cart = await _getLocalCart();
      cart.removeWhere((item) => item.lineId == lineId);
      await _setLocalCart(cart);
      return cart;
    }
    try {
      await _client.delete(ApiConfig.cartRemove(int.parse(lineId)));
      return getCart();
    } catch (_) {
      return getCart();
    }
  }

  Future<void> clearCart() async {
    if (!await _isAuthenticated()) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_cartKey);
      return;
    }
    try {
      await _client.delete(ApiConfig.cartClear);
    } catch (_) {}
  }

  Future<List<CartItem>> syncGuestCart() async {
    final guestCart = await _getLocalCart();
    if (guestCart.isEmpty) return getCart();

    final items = guestCart.map((item) => {
      'product_id': item.productId,
      'quantity': item.quantity,
      'size': item.size,
      'dedication': item.dedication,
      'price': item.price,
    }).toList();

    try {
      final data = await _client.post(ApiConfig.cartSync, body: {'items': items});
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_cartKey);
      final list = data['data'] as List;
      return list.map((j) => CartItem.fromJson(j as Map<String, dynamic>)).toList();
    } catch (_) {
      return guestCart;
    }
  }
}
