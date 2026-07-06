class CartItem {
  final int? id;
  final String? cartItemId;
  final int productId;
  String name;
  double price;
  int quantity;
  String size;
  String? dedication;
  String image;

  CartItem({
    this.id,
    this.cartItemId,
    required this.productId,
    required this.name,
    required this.price,
    this.quantity = 1,
    this.size = '6" Personal',
    this.dedication,
    this.image = '',
  });

  factory CartItem.fromJson(Map<String, dynamic> json) {
    return CartItem(
      id: json['id'],
      productId: json['product_id'] ?? 0,
      name: json['name'] ?? '',
      price: (json['price'] ?? 0).toDouble(),
      quantity: json['quantity'] ?? 1,
      size: json['size'] ?? '6" Personal',
      dedication: json['dedication'],
      image: json['image'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'product_id': productId,
    'name': name,
    'price': price,
    'quantity': quantity,
    'size': size,
    'dedication': dedication,
    'image': image,
  };

  double get lineTotal => price * quantity;

  String get lineId => id != null ? 'server_$id' : (cartItemId ?? 'line_$productId-$size');
}
