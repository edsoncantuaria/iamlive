import 'dart:async';
import 'package:flutter/foundation.dart';
import '../models/app_state.dart';
import '../models/contact.dart';
import '../services/whatsapp_bot_service.dart';
import '../services/storage_service.dart';
import '../services/notification_service.dart';
import '../services/whatsapp_service.dart';

class AliveProvider extends ChangeNotifier {
  final StorageService _storage = StorageService();
  final NotificationService _notification = NotificationService();
  final WhatsAppBotService _botService = WhatsAppBotService();

  AppConfig _config = AppConfig();
  List<EmergencyContact> _contacts = [];
  Timer? _ticker;
  bool _isInitialized = false;

  AppConfig get config => _config;
  List<EmergencyContact> get contacts => _contacts;
  bool get isInitialized => _isInitialized;
  bool get hasContacts => _contacts.isNotEmpty;
  bool get isBotConnected => _botService.isConnected;

  /// Tempo restante formatado
  Duration get timeRemaining => _config.timeRemaining ?? Duration.zero;
  bool get isExpired => _config.isExpired;
  bool get hasCheckedIn => _config.lastCheckIn != null;

  /// Status visual do app
  AliveStatus get status {
    if (!hasCheckedIn) return AliveStatus.neverChecked;
    if (isExpired) return AliveStatus.expired;
    final remaining = timeRemaining;
    if (remaining.inHours <= 6) return AliveStatus.critical;
    if (remaining.inHours <= 24) return AliveStatus.warning;
    return AliveStatus.safe;
  }

  /// Inicialização
  Future<void> init() async {
    try {
      await _storage.init();
    } catch (_) {}
    
    try {
      await _notification.init();
    } catch (_) {}
    
    try {
      await _botService.init();
    } catch (_) {}

    _config = _storage.loadConfig();
    _contacts = await _storage.getContacts();
    _isInitialized = true;

    // Se expirou enquanto o app estava fechado, dispara alerta
    if (isExpired && hasContacts) {
      _triggerEmergency();
    }

    _startTicker();
    notifyListeners();
  }

  /// Registra check-in: "Estou Vivo!"
  Future<void> checkIn() async {
    final now = DateTime.now();
    _config.lastCheckIn = now;
    await _storage.saveLastCheckIn(now);

    // Re-agenda notificações
    if (_config.deadline != null) {
      await _notification.scheduleReminders(_config.deadline!);
    }

    _startTicker();
    notifyListeners();
  }

  /// Atualiza o intervalo de dias
  Future<void> updateInterval(int days) async {
    _config.intervalDays = days;
    await _storage.saveIntervalDays(days);

    // Re-agenda notificações se já fez check-in
    if (hasCheckedIn && _config.deadline != null) {
      await _notification.scheduleReminders(_config.deadline!);
    }

    notifyListeners();
  }

  /// Atualiza a mensagem de emergência
  Future<void> updateMessage(String message) async {
    _config.emergencyMessage = message;
    await _storage.saveMessage(message);
    notifyListeners();
  }

  // ── Contatos ──────────────────────────────────────────────

  Future<void> addContact(EmergencyContact contact) async {
    if (_contacts.length >= 2) return; // Máximo 2 contatos
    _contacts.add(contact);
    await _storage.saveContacts(_contacts);
    notifyListeners();
  }

  Future<void> updateContact(int index, EmergencyContact contact) async {
    if (index < 0 || index >= _contacts.length) return;
    _contacts[index] = contact;
    await _storage.saveContacts(_contacts);
    notifyListeners();
  }

  Future<void> removeContact(int index) async {
    if (index < 0 || index >= _contacts.length) return;
    _contacts.removeAt(index);
    await _storage.saveContacts(_contacts);
    notifyListeners();
  }

  // ── Privados ──────────────────────────────────────────────

  void _startTicker() {
    _ticker?.cancel();
    _ticker = Timer.periodic(const Duration(seconds: 1), (_) {
      if (isExpired && hasContacts) {
        _ticker?.cancel();
        _triggerEmergency();
      }
      notifyListeners();
    });
  }

  Future<void> _triggerEmergency() async {
    if (_contacts.isEmpty) return;

    // Tenta envio automático primeiro
    bool automatedSuccess = await _botService.sendAutomatedMessage(
      contacts: _contacts,
      message: _config.emergencyMessage,
    );

    // Se falhar ou não estiver conectado, usa o fallback (deep link)
    if (!automatedSuccess) {
      await WhatsAppService.sendEmergencyMessages(
        contacts: _contacts,
        message: _config.emergencyMessage,
      );
    }
  }

  @override
  void dispose() {
    _ticker?.cancel();
    super.dispose();
  }
}

enum AliveStatus {
  neverChecked,
  safe,
  warning,
  critical,
  expired,
}
