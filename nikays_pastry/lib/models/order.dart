import 'user.dart';

class OrderItem {
  final int? id;
  final int productId;
  final String name;
  final double price;
  final int quantity;
  final String? dedication;
  final String? size;
  final String? flavor;

  OrderItem({
    this.id,
    required this.productId,
    this.name = 'Product',
    this.price = 0,
    this.quantity = 1,
    this.dedication,
    this.size,
    this.flavor,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    final customization = json['customization'];
    Map<String, dynamic>? cust;
    if (customization is Map<String, dynamic>) {
      cust = customization;
    }

    return OrderItem(
      id: json['id'],
      productId: json['product_id'] ?? 0,
      name: json['name'] ?? json['product_name_snapshot'] ?? 'Product',
      price: (json['price'] ?? json['product_price_snapshot'] ?? 0).toDouble(),
      quantity: json['quantity'] ?? 1,
      dedication: cust?['dedication_message'],
      size: cust?['size'],
      flavor: cust?['flavor'],
    );
  }

  double get lineTotal => price * quantity;
}

class Order {
  final int id;
  final String orderNumber;
  final double totalAmount;
  final double? deliveryFee;
  final String status;
  final String statusKey;
  final String? notes;
  final String? customerName;
  final String? customerPhone;
  final String? fulfillmentType;
  final String? deliveryAddress;
  final String? deliveryDate;
  final String? paymentMethod;
  final List<OrderItem> items;
  final User? user;
  final String createdAt;
  final String updatedAt;

  Order({
    required this.id,
    this.orderNumber = '',
    this.totalAmount = 0,
    this.deliveryFee,
    this.status = 'pending',
    this.statusKey = 'pending',
    this.notes,
    this.customerName,
    this.customerPhone,
    this.fulfillmentType,
    this.deliveryAddress,
    this.deliveryDate,
    this.paymentMethod,
    this.items = const [],
    this.user,
    this.createdAt = '',
    this.updatedAt = '',
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    final statusRaw = (json['status'] ?? 'pending').toString().toLowerCase();
    final fulfillmentType = json['fulfillment_type'] ?? json['type'] ?? 'pickup';
    final userJson = json['user'];
    final rawItems = json['items'] ?? json['orderItems'] ?? [];
    final items = (rawItems is List)
        ? rawItems.map((i) => OrderItem.fromJson(i as Map<String, dynamic>)).toList()
        : <OrderItem>[];

    String customerName = json['customer_name'] ?? json['customerName'] ?? '';
    if (customerName.isEmpty && userJson is Map<String, dynamic>) {
      customerName =
          '${userJson['first_name'] ?? ''} ${userJson['last_name'] ?? ''}'.trim();
    }

    return Order(
      id: json['id'] ?? 0,
      orderNumber: json['order_number'] ?? '',
      totalAmount: (json['total_amount'] ?? json['totalPrice'] ?? 0).toDouble(),
      deliveryFee: (json['delivery_fee'] ?? 0).toDouble(),
      status: statusRaw[0].toUpperCase() + statusRaw.substring(1),
      statusKey: statusRaw,
      notes: json['notes'],
      customerName: customerName.isNotEmpty ? customerName : null,
      customerPhone: json['customer_phone'] ?? json['customerPhone'],
      fulfillmentType: fulfillmentType,
      deliveryAddress: json['delivery_address'] ?? json['address'],
      deliveryDate: json['delivery_date'],
      paymentMethod: json['payment_method'] ?? json['paymentMethod'] ?? 'Cash Only',
      items: items,
      user: userJson is Map<String, dynamic> ? User.fromJson(userJson) : null,
      createdAt: json['created_at'] ?? '',
      updatedAt: json['updated_at'] ?? '',
    );
  }

  String get type => fulfillmentType ?? 'pickup';
  String get address => deliveryAddress ?? '';
  double get totalPrice => totalAmount;
  String get customerPhoneFormatted => customerPhone ?? '—';

  String get date {
    final d = deliveryDate;
    if (d == null || d.isEmpty) return '—';
    try {
      final parts = d.split(' ');
      if (parts.length >= 1) {
        final dateParts = parts[0].split('-');
        if (dateParts.length == 3) {
          final months = [
            '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
          ];
          final month = int.tryParse(dateParts[1]) ?? 0;
          return '${months[month]} ${dateParts[2]}, ${dateParts[0]}';
        }
      }
    } catch (_) {}
    return d;
  }

  String get time {
    final d = deliveryDate;
    if (d == null || d.isEmpty) return '—';
    try {
      final parts = d.split(' ');
      if (parts.length >= 2) {
        final timeParts = parts[1].split(':');
        if (timeParts.length >= 2) {
          final hour = int.parse(timeParts[0]);
          final minute = timeParts[1];
          final ampm = hour >= 12 ? 'PM' : 'AM';
          final disp = hour % 12 == 0 ? 12 : hour % 12;
          return '$disp:$minute $ampm';
        }
      }
    } catch (_) {}
    return d;
  }

  String get placedDate {
    if (createdAt.isEmpty) return '—';
    try {
      final normalized = createdAt.contains('T') ? createdAt : createdAt.replaceFirst(' ', 'T');
      final date = DateTime.parse(normalized);
      final months = [
        '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      return '${months[date.month]} ${date.day}, ${date.year}';
    } catch (_) {}
    return '—';
  }

  String get placedTime {
    if (createdAt.isEmpty) return '—';
    try {
      final normalized = createdAt.contains('T') ? createdAt : createdAt.replaceFirst(' ', 'T');
      final dt = DateTime.parse(normalized);
      final hour = dt.hour;
      final minute = dt.minute.toString().padLeft(2, '0');
      final ampm = hour >= 12 ? 'PM' : 'AM';
      final disp = hour % 12 == 0 ? 12 : hour % 12;
      return '$disp:$minute $ampm';
    } catch (_) {}
    return '—';
  }
}
