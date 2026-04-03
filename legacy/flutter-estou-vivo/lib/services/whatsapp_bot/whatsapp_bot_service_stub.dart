import 'dart:async';
import 'dart:typed_data';
import '../../models/contact.dart';
import 'whatsapp_bot_service_interface.dart';

class WhatsAppBotStub implements WhatsAppBotImplementation {
  @override
  bool get isConnected => false;
  @override
  String? get qrCode => null;
  @override
  Uint8List? get qrBytes => null;

  @override
  Stream<bool> get onConnectionChange => const Stream.empty();
  @override
  Stream<String?> get onQrCode => const Stream.empty();

  @override
  Future<void> init() async {}
  @override
  Future<void> connect() async {}
  @override
  Future<void> disconnect() async {}
  @override
  Future<bool> sendAutomatedMessage({
    required List<EmergencyContact> contacts,
    required String message,
  }) async => false;
}

WhatsAppBotImplementation getImplementation() => WhatsAppBotStub();
