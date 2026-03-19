import 'package:shared_preferences/shared_preferences.dart';
import '../models/contact.dart';
import '../models/app_state.dart';

class StorageService {
  static const _keyContacts = 'emergency_contacts';
  static const _keyLastCheckIn = 'last_check_in';
  static const _keyIntervalDays = 'interval_days';
  static const _keyMessage = 'emergency_message';

  late SharedPreferences _prefs;

  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  // ── Contatos ──────────────────────────────────────────────

  Future<List<EmergencyContact>> getContacts() async {
    final json = _prefs.getString(_keyContacts);
    if (json == null) return [];
    return EmergencyContact.decodeList(json);
  }

  Future<void> saveContacts(List<EmergencyContact> contacts) async {
    await _prefs.setString(_keyContacts, EmergencyContact.encodeList(contacts));
  }

  // ── Check-in ──────────────────────────────────────────────

  DateTime? getLastCheckIn() {
    final ms = _prefs.getInt(_keyLastCheckIn);
    if (ms == null) return null;
    return DateTime.fromMillisecondsSinceEpoch(ms);
  }

  Future<void> saveLastCheckIn(DateTime dateTime) async {
    await _prefs.setInt(_keyLastCheckIn, dateTime.millisecondsSinceEpoch);
  }

  // ── Intervalo ─────────────────────────────────────────────

  int getIntervalDays() {
    return _prefs.getInt(_keyIntervalDays) ?? AppConfig.defaultIntervalDays;
  }

  Future<void> saveIntervalDays(int days) async {
    await _prefs.setInt(_keyIntervalDays, days);
  }

  // ── Mensagem ──────────────────────────────────────────────

  String getMessage() {
    return _prefs.getString(_keyMessage) ?? AppConfig.defaultMessage;
  }

  Future<void> saveMessage(String message) async {
    await _prefs.setString(_keyMessage, message);
  }

  // ── Carregar config completa ──────────────────────────────

  AppConfig loadConfig() {
    return AppConfig(
      intervalDays: getIntervalDays(),
      emergencyMessage: getMessage(),
      lastCheckIn: getLastCheckIn(),
    );
  }
}
