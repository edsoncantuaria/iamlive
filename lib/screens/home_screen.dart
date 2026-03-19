import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../providers/alive_provider.dart';
import '../theme/app_theme.dart';
import 'contacts_screen.dart';
import 'settings_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    );
    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.08).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
    _pulseController.repeat(reverse: true);
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AliveProvider>(
      builder: (context, provider, _) {
        if (!provider.isInitialized) {
          return const Scaffold(
            body: Center(
              child: CircularProgressIndicator(color: AppTheme.primaryGreen),
            ),
          );
        }

        return Scaffold(
          body: Container(
            decoration: const BoxDecoration(gradient: AppTheme.backgroundGradient),
            child: SafeArea(
              child: Column(
                children: [
                  _buildHeader(context, provider),
                  Expanded(
                    child: Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          _buildStatusText(provider),
                          const SizedBox(height: 32),
                          _buildMainButton(context, provider),
                          const SizedBox(height: 40),
                          if (provider.hasCheckedIn) _buildCountdown(provider),
                        ],
                      ),
                    ),
                  ),
                  _buildBottomHint(provider),
                  const SizedBox(height: 16),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildHeader(BuildContext context, AliveProvider provider) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Logo/title
          Row(
            children: [
              Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: _statusDotColor(provider.status),
                ),
              ),
              const SizedBox(width: 8),
              Text(
                'Estou Vivo!',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.w700,
                      color: AppTheme.warmGray,
                    ),
              ),
            ],
          ),
          // Actions
          Row(
            children: [
              _buildIconButton(
                icon: Icons.people_outline_rounded,
                badge: provider.contacts.length.toString(),
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const ContactsScreen()),
                ),
              ),
              const SizedBox(width: 4),
              _buildIconButton(
                icon: Icons.tune_rounded,
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const SettingsScreen()),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildIconButton({
    required IconData icon,
    String? badge,
    required VoidCallback onTap,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(8),
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              Icon(icon, color: AppTheme.warmGray, size: 24),
              if (badge != null && badge != '0')
                Positioned(
                  right: -6,
                  top: -6,
                  child: Container(
                    width: 16,
                    height: 16,
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      color: AppTheme.primaryGreen,
                    ),
                    child: Center(
                      child: Text(
                        badge,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusText(AliveProvider provider) {
    String text;
    Color color;

    switch (provider.status) {
      case AliveStatus.neverChecked:
        text = 'Faça seu primeiro check-in';
        color = AppTheme.warmGray;
      case AliveStatus.safe:
        text = 'Tudo certo por aqui 💚';
        color = AppTheme.safeGreen;
      case AliveStatus.warning:
        text = 'Confirme em breve ⏰';
        color = AppTheme.warningAmber;
      case AliveStatus.critical:
        text = 'Últimas horas! 🔴';
        color = AppTheme.dangerRed;
      case AliveStatus.expired:
        text = 'Prazo expirado ⚠️';
        color = AppTheme.expiredRed;
    }

    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 400),
      child: Text(
        text,
        key: ValueKey(provider.status),
        style: Theme.of(context).textTheme.bodyLarge?.copyWith(
              color: color,
              fontWeight: FontWeight.w500,
              fontSize: 18,
            ),
        textAlign: TextAlign.center,
      ),
    );
  }

  Widget _buildMainButton(BuildContext context, AliveProvider provider) {
    final gradient = _statusGradient(provider.status);
    final size = MediaQuery.of(context).size.width * 0.52;

    return AnimatedBuilder(
      animation: _pulseAnimation,
      builder: (context, child) {
        return GestureDetector(
          onTap: () => _onCheckIn(context, provider),
          child: Transform.scale(
            scale: _pulseAnimation.value,
            child: Container(
              width: size,
              height: size,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: gradient,
                boxShadow: [
                  BoxShadow(
                    color: _statusShadowColor(provider.status),
                    blurRadius: 40,
                    spreadRadius: 4,
                    offset: const Offset(0, 8),
                  ),
                  BoxShadow(
                    color: _statusShadowColor(provider.status).withValues(alpha: 0.2),
                    blurRadius: 80,
                    spreadRadius: 8,
                  ),
                ],
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    provider.isExpired
                        ? Icons.warning_rounded
                        : Icons.favorite_rounded,
                    color: Colors.white,
                    size: size * 0.22,
                  ),
                  SizedBox(height: size * 0.04),
                  Text(
                    provider.isExpired ? 'Estou aqui!' : 'Estou Vivo!',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: size * 0.1,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.5,
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildCountdown(AliveProvider provider) {
    final remaining = provider.timeRemaining;
    final days = remaining.inDays;
    final hours = remaining.inHours.remainder(24);
    final minutes = remaining.inMinutes.remainder(60);
    final seconds = remaining.inSeconds.remainder(60);

    return Column(
      children: [
        // Countdown numbers
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _countdownUnit(days.toString().padLeft(2, '0'), 'dias'),
            _countdownSeparator(),
            _countdownUnit(hours.toString().padLeft(2, '0'), 'horas'),
            _countdownSeparator(),
            _countdownUnit(minutes.toString().padLeft(2, '0'), 'min'),
            _countdownSeparator(),
            _countdownUnit(seconds.toString().padLeft(2, '0'), 'seg'),
          ],
        ),
        const SizedBox(height: 20),
        // Progress bar
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 60),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: LinearProgressIndicator(
              value: provider.config.progressPercent,
              minHeight: 6,
              backgroundColor: AppTheme.primaryGreen.withValues(alpha: 0.15),
              valueColor: AlwaysStoppedAnimation<Color>(
                _progressColor(provider.config.progressPercent),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _countdownUnit(String value, String label) {
    return Column(
      children: [
        AnimatedSwitcher(
          duration: const Duration(milliseconds: 300),
          transitionBuilder: (child, animation) => SlideTransition(
            position: Tween<Offset>(
              begin: const Offset(0, -0.3),
              end: Offset.zero,
            ).animate(animation),
            child: FadeTransition(opacity: animation, child: child),
          ),
          child: Text(
            value,
            key: ValueKey('$label-$value'),
            style: const TextStyle(
              fontSize: 36,
              fontWeight: FontWeight.w700,
              color: AppTheme.warmGray,
              fontFeatures: [FontFeature.tabularFigures()],
            ),
          ),
        ),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: AppTheme.warmGray.withValues(alpha: 0.6),
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  Widget _countdownSeparator() {
    return const Padding(
      padding: EdgeInsets.symmetric(horizontal: 6),
      child: Text(
        ':',
        style: TextStyle(
          fontSize: 32,
          fontWeight: FontWeight.w300,
          color: AppTheme.warmGray,
        ),
      ),
    );
  }

  Widget _buildBottomHint(AliveProvider provider) {
    if (!provider.hasContacts) {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 40),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          decoration: BoxDecoration(
            color: AppTheme.warningAmber.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: AppTheme.warningAmber.withValues(alpha: 0.3),
            ),
          ),
          child: Row(
            children: [
              const Icon(
                Icons.info_outline_rounded,
                color: AppTheme.warningAmber,
                size: 20,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  'Cadastre seus contatos de emergência para ativar o sistema.',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: AppTheme.warningAmber.withValues(alpha: 0.9),
                      ),
                ),
              ),
            ],
          ),
        ),
      );
    }
    return const SizedBox.shrink();
  }

  // ── Helpers ──────────────────────────────────────────────

  Future<void> _onCheckIn(BuildContext context, AliveProvider provider) async {
    HapticFeedback.mediumImpact();
    await provider.checkIn();

    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Row(
            children: [
              Icon(Icons.check_circle_rounded, color: Colors.white, size: 20),
              SizedBox(width: 10),
              Text('Check-in registrado! ✨'),
            ],
          ),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          backgroundColor: AppTheme.safeGreen,
          duration: const Duration(seconds: 2),
        ),
      );
    }
  }

  Color _statusDotColor(AliveStatus status) {
    switch (status) {
      case AliveStatus.neverChecked:
        return AppTheme.warmGray.withValues(alpha: 0.4);
      case AliveStatus.safe:
        return AppTheme.safeGreen;
      case AliveStatus.warning:
        return AppTheme.warningAmber;
      case AliveStatus.critical:
      case AliveStatus.expired:
        return AppTheme.dangerRed;
    }
  }

  LinearGradient _statusGradient(AliveStatus status) {
    switch (status) {
      case AliveStatus.neverChecked:
      case AliveStatus.safe:
        return AppTheme.safeButtonGradient;
      case AliveStatus.warning:
        return AppTheme.warningButtonGradient;
      case AliveStatus.critical:
        return AppTheme.criticalButtonGradient;
      case AliveStatus.expired:
        return AppTheme.expiredButtonGradient;
    }
  }

  Color _statusShadowColor(AliveStatus status) {
    switch (status) {
      case AliveStatus.neverChecked:
      case AliveStatus.safe:
        return AppTheme.primaryGreen.withValues(alpha: 0.35);
      case AliveStatus.warning:
        return AppTheme.warningAmber.withValues(alpha: 0.35);
      case AliveStatus.critical:
      case AliveStatus.expired:
        return AppTheme.dangerRed.withValues(alpha: 0.35);
    }
  }

  Color _progressColor(double percent) {
    if (percent < 0.6) return AppTheme.safeGreen;
    if (percent < 0.85) return AppTheme.warningAmber;
    return AppTheme.dangerRed;
  }
}
