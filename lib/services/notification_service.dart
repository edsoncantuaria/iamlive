import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/data/latest_all.dart' as tz;
import 'package:timezone/timezone.dart' as tz;

class NotificationService {
  static final NotificationService _instance = NotificationService._();
  factory NotificationService() => _instance;
  NotificationService._();

  final FlutterLocalNotificationsPlugin _plugin =
      FlutterLocalNotificationsPlugin();

  static const _channelId = 'estou_vivo_channel';
  static const _channelName = 'Estou Vivo! Lembretes';
  static const _channelDesc = 'Notificações de lembrete para confirmar que você está bem';

  // Notification IDs
  static const _id24h = 1;
  static const _id6h = 2;
  static const _idExpired = 3;

  Future<void> init() async {
    tz.initializeTimeZones();

    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );
    const settings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _plugin.initialize(settings);

    // Request permissions on Android 13+
    await _plugin
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.requestNotificationsPermission();
  }

  /// Agenda notificações de lembrete baseadas no deadline
  Future<void> scheduleReminders(DateTime deadline) async {
    await cancelAll();

    final now = DateTime.now();

    // 24h antes
    final reminder24h = deadline.subtract(const Duration(hours: 24));
    if (reminder24h.isAfter(now)) {
      await _scheduleNotification(
        id: _id24h,
        title: '⏰ Lembrete — Estou Vivo!',
        body: 'Faltam 24 horas para confirmar que você está bem.',
        scheduledDate: reminder24h,
      );
    }

    // 6h antes
    final reminder6h = deadline.subtract(const Duration(hours: 6));
    if (reminder6h.isAfter(now)) {
      await _scheduleNotification(
        id: _id6h,
        title: '🔴 Urgente — Estou Vivo!',
        body: 'Faltam apenas 6 horas! Confirme que está tudo bem.',
        scheduledDate: reminder6h,
      );
    }

    // No momento da expiração
    if (deadline.isAfter(now)) {
      await _scheduleNotification(
        id: _idExpired,
        title: '🚨 Prazo expirado — Estou Vivo!',
        body:
            'Você não confirmou a tempo. Abrindo o app para enviar alerta aos seus contatos.',
        scheduledDate: deadline,
      );
    }
  }

  Future<void> _scheduleNotification({
    required int id,
    required String title,
    required String body,
    required DateTime scheduledDate,
  }) async {
    const androidDetails = AndroidNotificationDetails(
      _channelId,
      _channelName,
      channelDescription: _channelDesc,
      importance: Importance.max,
      priority: Priority.high,
      playSound: true,
      enableVibration: true,
    );
    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );
    const details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    final tzDateTime = tz.TZDateTime.from(scheduledDate, tz.local);

    await _plugin.zonedSchedule(
      id,
      title,
      body,
      tzDateTime,
      details,
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      uiLocalNotificationDateInterpretation:
          UILocalNotificationDateInterpretation.absoluteTime,
    );
  }

  Future<void> cancelAll() async {
    await _plugin.cancelAll();
  }
}
