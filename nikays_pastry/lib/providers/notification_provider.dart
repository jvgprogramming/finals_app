import 'dart:async';
import 'package:flutter/foundation.dart';
import '../models/app_notification.dart';
import '../services/notification_service.dart';

class NotificationProvider with ChangeNotifier {
  final NotificationService _notificationService = NotificationService();
  List<AppNotification> _notifications = [];
  Timer? _pollTimer;
  bool _isShaking = false;

  List<AppNotification> get notifications => _notifications;
  bool get isShaking => _isShaking;

  int get unreadCount => _notifications.where((n) => !n.isRead).length;

  Future<void> loadNotifications() async {
    try {
      _notifications = await _notificationService.getNotifications();
      notifyListeners();
    } catch (_) {}
  }

  void startPolling() {
    _pollTimer?.cancel();
    loadNotifications();
    _pollTimer = Timer.periodic(const Duration(seconds: 10), (_) {
      loadNotifications();
    });
  }

  void stopPolling() {
    _pollTimer?.cancel();
    _pollTimer = null;
  }

  Future<void> markAllRead() async {
    try {
      await _notificationService.markAllRead();
      await loadNotifications();
    } catch (_) {}
  }

  Future<void> triggerShake() async {
    _isShaking = true;
    notifyListeners();
    await Future.delayed(const Duration(seconds: 1));
    _isShaking = false;
    notifyListeners();
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    super.dispose();
  }
}
