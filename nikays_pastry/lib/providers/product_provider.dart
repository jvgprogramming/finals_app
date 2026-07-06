import 'package:flutter/foundation.dart';
import '../models/product.dart';
import '../models/category.dart' as cat_model;
import '../services/product_service.dart';

class ProductProvider with ChangeNotifier {
  final ProductService _productService = ProductService();
  List<Product> _products = [];
  List<cat_model.Category> _categories = [];
  bool _isLoadingProducts = false;
  String? _error;
  String _activeCategory = 'All';
  String _searchQuery = '';
  String _sortBy = 'popular';

  List<Product> get products => _products;
  List<cat_model.Category> get categories => _categories;
  bool get isLoadingProducts => _isLoadingProducts;
  String? get error => _error;
  String get activeCategory => _activeCategory;
  String get searchQuery => _searchQuery;
  String get sortBy => _sortBy;

  List<String> get availableCategories {
    final set = <String>{'All'};
    for (final p in _products) {
      if (p.categoryLabel != null) set.add(p.categoryLabel!);
    }
    return set.toList()..sort((a, b) => a == 'All' ? -1 : b == 'All' ? 1 : a.compareTo(b));
  }

  List<Product> get filteredProducts {
    var filtered = _products.where((p) {
      final matchSearch = p.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          p.description.toLowerCase().contains(_searchQuery.toLowerCase());
      final matchCategory = _activeCategory == 'All' || p.categoryLabel == _activeCategory;
      return matchSearch && matchCategory;
    }).toList();

    switch (_sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price.compareTo(b.price));
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price.compareTo(a.price));
        break;
      default:
        filtered.sort((a, b) => b.id.compareTo(a.id));
    }
    return filtered;
  }

  void setActiveCategory(String category) {
    _activeCategory = category;
    notifyListeners();
  }

  void setSearchQuery(String query) {
    _searchQuery = query;
    notifyListeners();
  }

  void setSortBy(String sort) {
    _sortBy = sort;
    notifyListeners();
  }

  Future<void> loadProducts() async {
    _isLoadingProducts = true;
    _error = null;
    notifyListeners();
    try {
      final results = await Future.wait([
        _productService.getProducts(),
        _productService.getCategories(),
      ]);
      _products = results[0] as List<Product>;
      _categories = results[1] as List<cat_model.Category>;
      for (final product in _products) {
        final cat = _categories.where((c) => c.id == product.categoryId).firstOrNull;
        product.categoryLabel = cat?.name ?? product.category?.name ?? 'Uncategorized';
      }
    } catch (e) {
      _error = e.toString();
    }
    _isLoadingProducts = false;
    notifyListeners();
  }

  Future<void> silentRefresh() async {
    try {
      final results = await Future.wait([
        _productService.getProducts(),
        _productService.getCategories(),
      ]);
      _products = results[0] as List<Product>;
      _categories = results[1] as List<cat_model.Category>;
      for (final product in _products) {
        final cat = _categories.where((c) => c.id == product.categoryId).firstOrNull;
        product.categoryLabel = cat?.name ?? product.category?.name ?? 'Uncategorized';
      }
    } catch (_) {}
    notifyListeners();
  }

  Future<void> createProduct(Map<String, dynamic> formData) async {
    final product = await _productService.createProduct(formData);
    _products.add(product);
    notifyListeners();
  }

  Future<void> updateProduct(int id, Map<String, dynamic> formData) async {
    final updated = await _productService.updateProduct(id, formData);
    final idx = _products.indexWhere((p) => p.id == id);
    if (idx >= 0) {
      _products[idx] = updated;
      notifyListeners();
    }
  }

  Future<void> deleteProduct(int id) async {
    await _productService.deleteProduct(id);
    _products.removeWhere((p) => p.id == id);
    notifyListeners();
  }

  Future<void> toggleAvailability(int id) async {
    final product = _products.where((p) => p.id == id).firstOrNull;
    if (product == null) return;
    final nextAvailable = !product.isAvailable;
    final formData = <String, dynamic>{
      'is_available': nextAvailable ? '1' : '0',
    };
    await updateProduct(id, formData);
  }
}
