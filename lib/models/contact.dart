import 'dart:convert';

class EmergencyContact {
  String name;
  String phone;

  EmergencyContact({
    required this.name,
    required this.phone,
  });

  Map<String, dynamic> toJson() => {
        'name': name,
        'phone': phone,
      };

  factory EmergencyContact.fromJson(Map<String, dynamic> json) =>
      EmergencyContact(
        name: json['name'] as String,
        phone: json['phone'] as String,
      );

  /// Retorna o número limpo (somente dígitos) para envio via WhatsApp
  String get cleanPhone => phone.replaceAll(RegExp(r'[^\d+]'), '');

  static String encodeList(List<EmergencyContact> contacts) =>
      jsonEncode(contacts.map((c) => c.toJson()).toList());

  static List<EmergencyContact> decodeList(String jsonString) {
    final List<dynamic> list = jsonDecode(jsonString) as List<dynamic>;
    return list
        .map((e) => EmergencyContact.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}
