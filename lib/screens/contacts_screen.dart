import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/contact.dart';
import '../providers/alive_provider.dart';
import '../theme/app_theme.dart';

class ContactsScreen extends StatelessWidget {
  const ContactsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Contatos de Emergência'),
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
                // Header explanation
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppTheme.primaryGreen.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.shield_outlined,
                        color: AppTheme.primaryGreen,
                        size: 24,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          'Estas pessoas serão notificadas caso você não confirme seu check-in a tempo.',
                          style:
                              Theme.of(context).textTheme.bodyMedium?.copyWith(
                                    color: AppTheme.darkTeal,
                                  ),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                // Contact cards
                ...List.generate(
                  provider.contacts.length,
                  (index) => _buildContactCard(
                    context,
                    provider,
                    provider.contacts[index],
                    index,
                  ),
                ),

                // Add contact button
                if (provider.contacts.length < 2) ...[
                  const SizedBox(height: 16),
                  _buildAddButton(context, provider),
                ],

                // Limit note
                if (provider.contacts.length >= 2) ...[
                  const SizedBox(height: 16),
                  Center(
                    child: Text(
                      'Máximo de 2 contatos cadastrados',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppTheme.warmGray.withValues(alpha: 0.5),
                          ),
                    ),
                  ),
                ],
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _buildContactCard(
    BuildContext context,
    AliveProvider provider,
    EmergencyContact contact,
    int index,
  ) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Container(
        padding: const EdgeInsets.all(16),
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
        child: Row(
          children: [
            // Avatar
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: AppTheme.safeButtonGradient,
              ),
              child: Center(
                child: Text(
                  contact.name.isNotEmpty
                      ? contact.name[0].toUpperCase()
                      : '?',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 16),
            // Info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    contact.name,
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    contact.phone,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: AppTheme.warmGray.withValues(alpha: 0.6),
                        ),
                  ),
                ],
              ),
            ),
            // Actions
            IconButton(
              icon: Icon(
                Icons.edit_outlined,
                color: AppTheme.warmGray.withValues(alpha: 0.5),
                size: 20,
              ),
              onPressed: () =>
                  _showContactDialog(context, provider, index: index),
            ),
            IconButton(
              icon: Icon(
                Icons.delete_outline_rounded,
                color: AppTheme.dangerRed.withValues(alpha: 0.6),
                size: 20,
              ),
              onPressed: () => _confirmDelete(context, provider, index),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAddButton(BuildContext context, AliveProvider provider) {
    return GestureDetector(
      onTap: () => _showContactDialog(context, provider),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: AppTheme.primaryGreen.withValues(alpha: 0.3),
            width: 1.5,
            strokeAlign: BorderSide.strokeAlignInside,
          ),
        ),
        child: Column(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppTheme.primaryGreen.withValues(alpha: 0.1),
              ),
              child: const Icon(
                Icons.person_add_outlined,
                color: AppTheme.primaryGreen,
                size: 24,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Adicionar contato',
              style: Theme.of(context).textTheme.labelLarge?.copyWith(
                    color: AppTheme.primaryGreen,
                  ),
            ),
          ],
        ),
      ),
    );
  }

  void _showContactDialog(
    BuildContext context,
    AliveProvider provider, {
    int? index,
  }) {
    final isEditing = index != null;
    final existing = isEditing ? provider.contacts[index] : null;
    final nameController = TextEditingController(text: existing?.name ?? '');
    final phoneController = TextEditingController(text: existing?.phone ?? '');
    final formKey = GlobalKey<FormState>();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(ctx).viewInsets.bottom,
        ),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(24, 16, 24, 24),
          child: Form(
            key: formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Handle bar
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: AppTheme.warmGray.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                Text(
                  isEditing ? 'Editar Contato' : 'Novo Contato',
                  style: Theme.of(context).textTheme.headlineMedium,
                ),
                const SizedBox(height: 20),
                TextFormField(
                  controller: nameController,
                  decoration: const InputDecoration(
                    labelText: 'Nome',
                    prefixIcon: Icon(Icons.person_outline_rounded),
                  ),
                  textCapitalization: TextCapitalization.words,
                  validator: (v) =>
                      v == null || v.trim().isEmpty ? 'Informe o nome' : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: phoneController,
                  decoration: const InputDecoration(
                    labelText: 'Telefone (com DDD)',
                    hintText: '+5511999999999',
                    prefixIcon: Icon(Icons.phone_outlined),
                  ),
                  keyboardType: TextInputType.phone,
                  validator: (v) {
                    if (v == null || v.trim().isEmpty) {
                      return 'Informe o telefone';
                    }
                    final clean = v.replaceAll(RegExp(r'[^\d+]'), '');
                    if (clean.length < 10) {
                      return 'Telefone inválido';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 24),
                FilledButton(
                  onPressed: () {
                    if (formKey.currentState!.validate()) {
                      final contact = EmergencyContact(
                        name: nameController.text.trim(),
                        phone: phoneController.text.trim(),
                      );
                      if (isEditing) {
                        provider.updateContact(index, contact);
                      } else {
                        provider.addContact(contact);
                      }
                      Navigator.pop(ctx);
                    }
                  },
                  style: FilledButton.styleFrom(
                    backgroundColor: AppTheme.primaryGreen,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: Text(
                    isEditing ? 'Salvar' : 'Adicionar',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                const SizedBox(height: 8),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _confirmDelete(
    BuildContext context,
    AliveProvider provider,
    int index,
  ) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Remover contato'),
        content: Text(
          'Deseja remover ${provider.contacts[index].name} da sua lista de emergência?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancelar'),
          ),
          FilledButton(
            onPressed: () {
              provider.removeContact(index);
              Navigator.pop(ctx);
            },
            style: FilledButton.styleFrom(
              backgroundColor: AppTheme.dangerRed,
            ),
            child: const Text('Remover'),
          ),
        ],
      ),
    );
  }
}
