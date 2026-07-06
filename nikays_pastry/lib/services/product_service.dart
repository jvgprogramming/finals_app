import 'api_client.dart';
import '../config/api_config.dart';
import '../models/product.dart';
import '../models/category.dart';

class ProductService {
  final ApiClient _client = ApiClient();

  Future<List<Category>> getCategories() async {
    final data = await _client.get(ApiConfig.categories);
    final list = data['data'] as List;
    return list.map((j) => Category.fromJson(j as Map<String, dynamic>)).toList();
  }

  Future<List<Product>> getProducts({Map<String, String>? filters}) async {
    final data = await _client.get(ApiConfig.products, queryParams: filters);
    final list = data['data'] as List;
    return list.map((j) => Product.fromJson(j as Map<String, dynamic>)).toList();
  }

  Future<Product> getProduct(int id) async {
    final data = await _client.get(ApiConfig.product(id));
    return Product.fromJson(data['data'] as Map<String, dynamic>);
  }

  Future<Product> createProduct(Map<String, dynamic> formData) async {
    final data = await _client.post(ApiConfig.products, body: formData, isFormData: true);
    return Product.fromJson(data['data'] as Map<String, dynamic>);
  }

  Future<Product> updateProduct(int id, Map<String, dynamic> formData) async {
    final data = await _client.post(ApiConfig.product(id), body: formData, isFormData: true);
    return Product.fromJson(data['data'] as Map<String, dynamic>);
  }

  Future<void> deleteProduct(int id) async {
    await _client.delete(ApiConfig.product(id));
  }
}
