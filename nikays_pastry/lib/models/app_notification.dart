class AppNotification {
  final int id;
  final String title;
  final String message;
  final bool isRead;
  final int? orderId;
  final String createdAt;

  AppNotification({
    required this.id,
    required this.title,
    required this.message,
    this.isRead = false,
    this.orderId,
    this.createdAt = '',
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id: json['id'] ?? 0,
      title: json['title'] ?? '',
      message: json['message'] ?? '',
      isRead: json['is_read'] ?? json['read'] ?? false,
      orderId: json['order_id'],
      createdAt: json['created_at'] ?? '',
    );
  }

  String get formattedDate {
    if (createdAt.isEmpty) return '';
    try {
      final normalized = createdAt.contains('T') ? createdAt : createdAt.replaceFirst(' ', 'T');
      final dt = DateTime.parse(normalized);
      final months = [
        '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      return '${months[dt.month]} ${dt.day}, ${dt.year} ${dt.hour % 12 == 0 ? 12 : dt.hour % 12}:${dt.minute.toString().padLeft(2, '0')} ${dt.hour >= 12 ? 'PM' : 'AM'}';
    } catch (_) {}
    return createdAt;
  }
}
