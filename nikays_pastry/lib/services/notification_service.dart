import 'api_client.dart';
import '../config/api_config.dart';
import '../models/app_notification.dart';

class NotificationService {
  final ApiClient _client = ApiClient();

  Future<List<AppNotification>> getNotifications({int page = 1}) async {
    final data = await _client.get(ApiConfig.notifications, queryParams: {'page': '$page'});
    final list = data['data'] as List;
    return list.map((j) => AppNotification.fromJson(j as Map<String, dynamic>)).toList();
  }

  Future<void> markAllRead() async {
    await _client.patch(ApiConfig.markAllNotificationsRead);
  }

  Future<void> markRead(int id) async {
    await _client.patch(ApiConfig.markNotificationRead(id));
  }
}
