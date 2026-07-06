import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';
import '../services/auth_service.dart';
import '../services/cart_service.dart';

class AuthProvider with ChangeNotifier {
  final AuthService _authService = AuthService();
  final CartService _cartService = CartService();

  User? _user;
  String? _token;
  bool _isLoading = true;

  User? get user => _user;
  String? get token => _token;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _token != null && _user != null;

  Future<void> init() async {
    _isLoading = true;
    notifyListeners();
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedToken = prefs.getString('auth_token');
      if (savedToken != null) {
        _token = savedToken;
        try {
          _user = await _authService.me();
        } catch (_) {
          await prefs.remove('auth_token');
          _token = null;
          _user = null;
        }
      }
    } catch (_) {
      _token = null;
      _user = null;
    }
    _isLoading = false;
    notifyListeners();
  }

  Future<User> login(String username, String password) async {
    final result = await _authService.login(username, password);
    await _saveSession(result.token);
    _token = result.token;
    _user = result.user;
    notifyListeners();
    try {
      await _cartService.syncGuestCart();
    } catch (_) {}
    return result.user;
  }

  Future<User> register(Map<String, dynamic> payload) async {
    final result = await _authService.register(payload);
    await _saveSession(result.token);
    _token = result.token;
    _user = result.user;
    notifyListeners();
    try {
      await _cartService.syncGuestCart();
    } catch (_) {}
    return result.user;
  }

  Future<void> logout() async {
    try {
      await _authService.logout();
    } catch (_) {}
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('np_cart');
    _token = null;
    _user = null;
    notifyListeners();
  }

  Future<void> _saveSession(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
  }
}
