import 'package:url_launcher/url_launcher.dart';
import '../models/contact.dart';

class WhatsAppService {
  /// Envia mensagem via deep link do WhatsApp para todos os contatos de emergência.
  /// Abre o WhatsApp com a mensagem pré-preenchida para cada contato.
  static Future<void> sendEmergencyMessages({
    required List<EmergencyContact> contacts,
    required String message,
  }) async {
    for (final contact in contacts) {
      await _sendToContact(contact, message);
    }
  }

  static Future<void> _sendToContact(
    EmergencyContact contact,
    String message,
  ) async {
    // Limpa o número removendo caracteres não numéricos (mantém o +)
    final phone = contact.cleanPhone;
    final encodedMessage = Uri.encodeComponent(message);

    // Tenta abrir via WhatsApp API (funciona em ambos Android e iOS)
    final whatsappUrl = Uri.parse('https://wa.me/$phone?text=$encodedMessage');

    if (await canLaunchUrl(whatsappUrl)) {
      await launchUrl(whatsappUrl, mode: LaunchMode.externalApplication);
    } else {
      // Fallback: tenta o deep link direto do WhatsApp
      final fallbackUrl = Uri.parse(
        'whatsapp://send?phone=$phone&text=$encodedMessage',
      );
      if (await canLaunchUrl(fallbackUrl)) {
        await launchUrl(fallbackUrl, mode: LaunchMode.externalApplication);
      }
    }
  }

  /// Testa envio de mensagem para um contato específico
  static Future<bool> testSend({
    required EmergencyContact contact,
    required String message,
  }) async {
    final phone = contact.cleanPhone;
    final encodedMessage = Uri.encodeComponent(message);
    final url = Uri.parse('https://wa.me/$phone?text=$encodedMessage');
    return canLaunchUrl(url);
  }
}
