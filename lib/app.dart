import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/alive_provider.dart';
import 'theme/app_theme.dart';
import 'screens/home_screen.dart';

class EstouVivoApp extends StatelessWidget {
  const EstouVivoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => AliveProvider()..init(),
      child: MaterialApp(
        title: 'Estou Vivo!',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.theme,
        home: const HomeScreen(),
      ),
    );
  }
}
