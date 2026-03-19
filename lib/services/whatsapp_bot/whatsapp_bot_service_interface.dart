import 'dart:async';
import 'dart:typed_data';
import '../../models/contact.dart';

abstract class WhatsAppBotImplementation {
  bool get isConnected;
  String? get qrCode;
  Uint8List? get qrBytes;
  Stream<bool> get onConnectionChange;
  Stream<String?> get onQrCode;

  Future<void> init();
  Future<void> connect();
  Future<void> disconnect();
  Future<bool> sendAutomatedMessage({
    required List<EmergencyContact> contacts,
    required String message,
  });
}
