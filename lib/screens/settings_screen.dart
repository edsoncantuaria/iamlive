import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/alive_provider.dart';
import '../services/whatsapp_service.dart';
import '../theme/app_theme.dart';
import 'whatsapp_connect_screen.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  late TextEditingController _messageController;

  @override
  void initState() {
    super.initState();
    final provider = context.read<AliveProvider>();
    _messageController =
        TextEditingController(text: provider.config.emergencyMessage);
  }

  @override
  void dispose() {
    _messageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Configurações'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Container(
        decoration: const BoxDecoration(gradient: AppTheme.backgroundGradient),
        child: Consumer<AliveProvider>(
          builder: (context, provider, _) {
            return ListView(
              padding: const EdgeInsets.all(20),
              children: [
                // ── Intervalo ─────────────────────────────
                _buildSection(
                  context,
                  icon: Icons.timer_outlined,
                  title: 'Intervalo de check-in',
                  subtitle: 'Tempo entre cada confirmação',
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            '${provider.config.intervalDays}',
                            style: const TextStyle(
                              fontSize: 48,
                              fontWeight: FontWeight.w700,
                              color: AppTheme.primaryGreen,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            provider.config.intervalDays == 1 ? 'dia' : 'dias',
                            style:
                                Theme.of(context).textTheme.bodyLarge?.copyWith(
                                      color: AppTheme.warmGray.withValues(alpha: 0.7),
                                    ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      SliderTheme(
                        data: SliderThemeData(
                          activeTrackColor: AppTheme.primaryGreen,
                          inactiveTrackColor:
                              AppTheme.primaryGreen.withValues(alpha: 0.15),
                          thumbColor: AppTheme.primaryGreen,
                          overlayColor:
                              AppTheme.primaryGreen.withValues(alpha: 0.12),
                          trackHeight: 6,
                        ),
                        child: Slider(
                          value: provider.config.intervalDays.toDouble(),
                          min: 1,
                          max: 7,
                          divisions: 6,
                          label: '${provider.config.intervalDays} dias',
                          onChanged: (value) {
                            provider.updateInterval(value.round());
                          },
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              '1 dia',
                              style: Theme.of(context)
                                  .textTheme
                                  .bodySmall
                                  ?.copyWith(
                                    color:
                                        AppTheme.warmGray.withValues(alpha: 0.5),
                                  ),
                            ),
                            Text(
                              '7 dias',
                              style: Theme.of(context)
                                  .textTheme
                                  .bodySmall
                                  ?.copyWith(
                                    color:
                                        AppTheme.warmGray.withValues(alpha: 0.5),
                                  ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 20),

                // ── Mensagem ─────────────────────────────
                _buildSection(
                  context,
                  icon: Icons.message_outlined,
                  title: 'Mensagem de emergência',
                  subtitle: 'Texto enviado aos contatos via WhatsApp',
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      TextField(
                        controller: _messageController,
                        maxLines: 4,
                        decoration: const InputDecoration(
                          hintText: 'Escreva sua mensagem...',
                        ),
                        onChanged: (value) {
                          provider.updateMessage(value);
                        },
                      ),
                      const SizedBox(height: 12),
                      TextButton.icon(
                        onPressed: () {
                          _messageController.text =
                              'Oi, não consegui confirmar que estou bem no app "Estou Vivo!". '
                              'Pode verificar se está tudo certo comigo?';
                          provider.updateMessage(_messageController.text);
                        },
                        icon: const Icon(Icons.refresh_rounded, size: 18),
                        label: const Text('Restaurar mensagem padrão'),
                        style: TextButton.styleFrom(
                          foregroundColor: AppTheme.warmGray.withValues(alpha: 0.6),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 20),

                // ── Conexão Automática ──────────────────────
                _buildSection(
                  context,
                  icon: Icons.auto_mode_rounded,
                  title: 'WhatsApp Automático',
                  subtitle: provider.isBotConnected
                      ? 'Status: Sincronizado ✅'
                      : 'Status: Não conectado ❌',
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const Text(
                        'Conecte seu WhatsApp para que o app envie a mensagem sem precisar que você abra o telefone.',
                        style: TextStyle(fontSize: 13),
                      ),
                      const SizedBox(height: 16),
                      FilledButton.icon(
                        onPressed: () => Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const WhatsAppConnectScreen(),
                          ),
                        ),
                        icon: Icon(provider.isBotConnected
                            ? Icons.settings_bluetooth_rounded
                            : Icons.qr_code_scanner_rounded),
                        label: Text(provider.isBotConnected
                            ? 'Gerenciar Conexão'
                            : 'Conectar agora'),
                        style: FilledButton.styleFrom(
                          backgroundColor: provider.isBotConnected
                              ? AppTheme.darkTeal
                              : AppTheme.primaryGreen,
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 20),

                // ── Testar WhatsApp ──────────────────────
                if (provider.hasContacts)
                  _buildSection(
                    context,
                    icon: Icons.send_rounded,
                    title: 'Testar envio',
                    subtitle: 'Envie uma mensagem de teste via WhatsApp',
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        ...provider.contacts.map(
                          (contact) => Padding(
                            padding: const EdgeInsets.only(bottom: 8),
                            child: OutlinedButton.icon(
                              onPressed: () async {
                                await WhatsAppService.sendEmergencyMessages(
                                  contacts: [contact],
                                  message:
                                      '🔔 [TESTE] ${provider.config.emergencyMessage}',
                                );
                              },
                              icon: const Icon(Icons.send_rounded, size: 18),
                              label: Text('Enviar para ${contact.name}'),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: AppTheme.primaryGreen,
                                side: const BorderSide(
                                  color: AppTheme.primaryGreen,
                                ),
                                padding:
                                    const EdgeInsets.symmetric(vertical: 14),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                const SizedBox(height: 32),

                // About
                Center(
                  child: Column(
                    children: [
                      Text(
                        'Estou Vivo! v1.0.0',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: AppTheme.warmGray.withValues(alpha: 0.4),
                            ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Cuidando de quem mora sozinho 💚',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: AppTheme.warmGray.withValues(alpha: 0.4),
                            ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _buildSection(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required Widget child,
  }) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: AppTheme.primaryGreen, size: 22),
              const SizedBox(width: 10),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                  Text(
                    subtitle,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppTheme.warmGray.withValues(alpha: 0.6),
                        ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),
          child,
        ],
      ),
    );
  }
}
