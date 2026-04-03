import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../services/whatsapp_bot_service.dart';
import '../theme/app_theme.dart';

class WhatsAppConnectScreen extends StatefulWidget {
  const WhatsAppConnectScreen({super.key});

  @override
  State<WhatsAppConnectScreen> createState() => _WhatsAppConnectScreenState();
}

class _WhatsAppConnectScreenState extends State<WhatsAppConnectScreen> {
  final _botService = WhatsAppBotService();
  String? _qrData;
  bool _isConnected = false;

  @override
  void initState() {
    super.initState();
    _isConnected = _botService.isConnected;
    _botService.onQrCode.listen((qr) {
      if (mounted) setState(() => _qrData = qr);
    });
    _botService.onConnectionChange.listen((connected) {
      if (mounted) {
        setState(() {
          _isConnected = connected;
          if (connected) _qrData = null;
        });
      }
    });

    if (!_isConnected) {
      _botService.connect();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Conectar WhatsApp'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Container(
        width: double.infinity,
        decoration: const BoxDecoration(gradient: AppTheme.backgroundGradient),
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (_isConnected) ...[
                const Icon(Icons.check_circle_rounded,
                    color: AppTheme.safeGreen, size: 80),
                const SizedBox(height: 24),
                Text(
                  'WhatsApp Conectado!',
                  style: Theme.of(context).textTheme.displayMedium?.copyWith(
                        fontSize: 24,
                        color: AppTheme.safeGreen,
                      ),
                ),
                const SizedBox(height: 16),
                const Text(
                  'As mensagens agora serão enviadas automaticamente sem sua intervenção.',
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 40),
                FilledButton.icon(
                  onPressed: () => _botService.disconnect(),
                  icon: const Icon(Icons.logout_rounded),
                  label: const Text('Desconectar'),
                  style: FilledButton.styleFrom(
                    backgroundColor: AppTheme.dangerRed,
                  ),
                ),
              ] else ...[
                const Text(
                  'Escaneie o QR Code abaixo com seu WhatsApp para ativar o envio automático',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.w500),
                ),
                const SizedBox(height: 40),
                if (_qrData != null)
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.05),
                          blurRadius: 20,
                        )
                      ],
                    ),
                    child: QrImageView(
                      data: _qrData!,
                      version: QrVersions.auto,
                      size: 250.0,
                    ),
                  )
                else
                  const Column(
                    children: [
                      CircularProgressIndicator(color: AppTheme.primaryGreen),
                      SizedBox(height: 16),
                      Text('Gerando QR Code...'),
                    ],
                  ),
                const SizedBox(height: 40),
                Text(
                  'Acesse WhatsApp > Dispositivos Conectados > Conectar um dispositivo',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: AppTheme.warmGray.withValues(alpha: 0.6),
                    fontSize: 14,
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
