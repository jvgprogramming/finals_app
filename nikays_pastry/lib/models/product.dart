import 'category.dart';
import '../config/api_config.dart';

class Product {
  final int id;
  final String name;
  final String description;
  final double price;
  final bool isAvailable;
  final String? imageUrl;
  final Category? category;
  final int? categoryId;
  String? categoryLabel;

  Product({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    this.isAvailable = true,
    this.imageUrl,
    this.category,
    this.categoryId,
    this.categoryLabel,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    final cat = json['category'];
    final category = cat != null
        ? (cat is Map<String, dynamic> ? Category.fromJson(cat) : null)
        : null;

    return Product(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      price: (json['price'] ?? 0).toDouble(),
      isAvailable: json['is_available'] ?? json['available'] ?? true,
      imageUrl: json['image_url'],
      category: category,
      categoryId: json['category_id'],
      categoryLabel: category?.name ?? 'Uncategorized',
    );
  }

  String get resolvedImageUrl {
    if (imageUrl != null && imageUrl!.isNotEmpty) {
      return ApiConfig.resolveImageUrl(imageUrl);
    }
    return 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop';
  }

  bool get available => isAvailable;
}
