import 'dart:async';
import 'dart:typed_data';
import 'package:whatsapp_bot_flutter_mobile/whatsapp_bot_flutter_mobile.dart';
import '../../models/contact.dart';
import 'whatsapp_bot_service_interface.dart';

class WhatsAppBotMobile implements WhatsAppBotImplementation {
  dynamic _bot;
  bool _isConnected = false;
  String? _qrCode;
  Uint8List? _qrBytes;

  @override
  bool get isConnected => _isConnected;
  @override
  String? get qrCode => _qrCode;
  @override
  Uint8List? get qrBytes => _qrBytes;

  final _connectionController = StreamController<bool>.broadcast();
  @override
  Stream<bool> get onConnectionChange => _connectionController.stream;

  final _qrController = StreamController<String?>.broadcast();
  @override
  Stream<String?> get onQrCode => _qrController.stream;

  @override
  Future<void> init() async {}

  @override
  Future<void> connect() async {
    if (_isConnected) return;
    try {
      _bot = await WhatsappBotFlutterMobile.connect(
        onQrCode: (String qr, Uint8List? bytes) {
          _qrCode = qr;
          _qrBytes = bytes;
          _qrController.add(qr);
        },
        onConnectionEvent: (event) {
          final eventStr = event.toString().toLowerCase();
          if (eventStr.contains('connected') || eventStr.contains('authenticated')) {
            _isConnected = true;
            _qrCode = null;
            _qrBytes = null;
            _qrController.add(null);
            _connectionController.add(true);
          } else if (eventStr.contains('disconnected') || eventStr.contains('logout')) {
            _isConnected = false;
            _connectionController.add(false);
          }
        },
      );
    } catch (e) {
      _isConnected = false;
      _connectionController.add(false);
    }
  }

  @override
  Future<void> disconnect() async {
    try {
      await _bot?.disconnect();
    } catch (_) {}
    _isConnected = false;
    _connectionController.add(false);
  }

  @override
  Future<bool> sendAutomatedMessage({
    required List<EmergencyContact> contacts,
    required String message,
  }) async {
    if (!_isConnected || _bot == null) return false;
    bool allSent = true;
    for (final contact in contacts) {
      try {
        final phone = contact.cleanPhone.replaceAll('+', '');
        await _bot!.chat.sendTextMessage(phone: phone, message: message);
      } catch (e) {
        allSent = false;
      }
    }
    return allSent;
  }
}

WhatsAppBotImplementation getImplementation() => WhatsAppBotMobile();
