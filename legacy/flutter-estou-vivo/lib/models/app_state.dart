class AppConfig {
  static const int defaultIntervalDays = 3;
  static const String defaultMessage =
      'Oi, não consegui confirmar que estou bem no app "Estou Vivo!". '
      'Pode verificar se está tudo certo comigo?';

  int intervalDays;
  String emergencyMessage;
  DateTime? lastCheckIn;

  AppConfig({
    this.intervalDays = defaultIntervalDays,
    this.emergencyMessage = defaultMessage,
    this.lastCheckIn,
  });

  /// Calcula o prazo final (deadline) a partir do último check-in
  DateTime? get deadline =>
      lastCheckIn?.add(Duration(days: intervalDays));

  /// Calcula o tempo restante até o deadline
  Duration? get timeRemaining {
    if (deadline == null) return null;
    final remaining = deadline!.difference(DateTime.now());
    return remaining.isNegative ? Duration.zero : remaining;
  }

  /// Verifica se o prazo expirou
  bool get isExpired {
    if (deadline == null) return false;
    return DateTime.now().isAfter(deadline!);
  }

  /// Porcentagem do tempo consumido (0.0 a 1.0)
  double get progressPercent {
    if (lastCheckIn == null || deadline == null) return 0.0;
    final total = deadline!.difference(lastCheckIn!).inSeconds;
    final elapsed = DateTime.now().difference(lastCheckIn!).inSeconds;
    return (elapsed / total).clamp(0.0, 1.0);
  }
}
