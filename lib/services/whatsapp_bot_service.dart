import 'dart:async';
import 'dart:typed_data';
import '../models/contact.dart';
import 'whatsapp_bot/whatsapp_bot_service_interface.dart';
import 'whatsapp_bot/whatsapp_bot_service_stub.dart'
    if (dart.library.io) 'whatsapp_bot/whatsapp_bot_service_mobile.dart'
    if (dart.library.html) 'whatsapp_bot/whatsapp_bot_service_stub.dart';

class WhatsAppBotService {
  static final WhatsAppBotService _instance = WhatsAppBotService._();
  factory WhatsAppBotService() => _instance;
  WhatsAppBotService._();

  final WhatsAppBotImplementation _impl = getImplementation();

  bool get isConnected => _impl.isConnected;
  String? get qrCode => _impl.qrCode;
  Uint8List? get qrBytes => _impl.qrBytes;

  Stream<bool> get onConnectionChange => _impl.onConnectionChange;
  Stream<String?> get onQrCode => _impl.onQrCode;

  Future<void> init() => _impl.init();
  Future<void> connect() => _impl.connect();
  Future<void> disconnect() => _impl.disconnect();
  
  Future<bool> sendAutomatedMessage({
    required List<EmergencyContact> contacts,
    required String message,
  }) => _impl.sendAutomatedMessage(contacts: contacts, message: message);
}
