import 'package:flutter/material.dart';
import '../config/theme.dart';
import '../models/app_notification.dart';

class NotificationPanel extends StatelessWidget {
  final List<AppNotification> notifications;
  final int unreadCount;
  final bool isShaking;
  final VoidCallback onToggle;
  final VoidCallback onMarkAllRead;
  final Function(int?) onSelectOrder;

  const NotificationPanel({
    super.key,
    required this.notifications,
    required this.unreadCount,
    this.isShaking = false,
    required this.onToggle,
    required this.onMarkAllRead,
    required this.onSelectOrder,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onToggle,
        borderRadius: BorderRadius.circular(20),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          child: Stack(
            children: [
              Icon(
                Icons.notifications_outlined,
                size: 22,
                color: isShaking ? AppColors.primary : AppColors.cocoa,
              ),
              if (unreadCount > 0)
                Positioned(
                  top: -2, right: -4,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      color: AppColors.primary,
                      shape: BoxShape.circle,
                    ),
                    child: Text('$unreadCount',
                      style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: Colors.white)),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
