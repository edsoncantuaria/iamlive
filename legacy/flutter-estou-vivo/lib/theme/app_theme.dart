import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // ── Cores principais ────────────────────────────────────

  static const Color primaryGreen = Color(0xFF4ECDC4);
  static const Color darkTeal = Color(0xFF2C7A7B);
  static const Color warmGray = Color(0xFF556270);
  static const Color softWhite = Color(0xFFF7FFF7);
  static const Color offWhite = Color(0xFFF0F4F0);
  static const Color dangerRed = Color(0xFFE63946);
  static const Color warningAmber = Color(0xFFF4A261);
  static const Color safeGreen = Color(0xFF06D6A0);
  static const Color expiredRed = Color(0xFFE63946);

  // ── Gradientes ────────────────────────────────────────

  static const LinearGradient backgroundGradient = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [softWhite, offWhite],
  );

  static const LinearGradient safeButtonGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF4ECDC4), Color(0xFF2AB7AD)],
  );

  static const LinearGradient warningButtonGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFFF4A261), Color(0xFFE76F51)],
  );

  static const LinearGradient criticalButtonGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFFE63946), Color(0xFFC1121F)],
  );

  static const LinearGradient expiredButtonGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF9D0208), Color(0xFF6B0F1A)],
  );

  // ── Tema do Material ─────────────────────────────────

  static ThemeData get theme => ThemeData(
        useMaterial3: true,
        brightness: Brightness.light,
        colorSchemeSeed: primaryGreen,
        scaffoldBackgroundColor: softWhite,
        textTheme: GoogleFonts.outfitTextTheme().copyWith(
          displayLarge: GoogleFonts.outfit(
            fontSize: 56,
            fontWeight: FontWeight.w700,
            color: warmGray,
          ),
          displayMedium: GoogleFonts.outfit(
            fontSize: 36,
            fontWeight: FontWeight.w600,
            color: warmGray,
          ),
          headlineMedium: GoogleFonts.outfit(
            fontSize: 24,
            fontWeight: FontWeight.w600,
            color: warmGray,
          ),
          titleLarge: GoogleFonts.outfit(
            fontSize: 20,
            fontWeight: FontWeight.w500,
            color: warmGray,
          ),
          bodyLarge: GoogleFonts.inter(
            fontSize: 16,
            fontWeight: FontWeight.w400,
            color: warmGray,
          ),
          bodyMedium: GoogleFonts.inter(
            fontSize: 14,
            fontWeight: FontWeight.w400,
            color: warmGray,
          ),
          labelLarge: GoogleFonts.inter(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: warmGray,
          ),
        ),
        appBarTheme: AppBarTheme(
          backgroundColor: softWhite,
          foregroundColor: warmGray,
          elevation: 0,
          centerTitle: true,
          titleTextStyle: GoogleFonts.outfit(
            fontSize: 20,
            fontWeight: FontWeight.w600,
            color: warmGray,
          ),
        ),
        cardTheme: CardThemeData(
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          color: Colors.white,
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Colors.white,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: primaryGreen.withValues(alpha: 0.3)),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: primaryGreen.withValues(alpha: 0.3)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: primaryGreen, width: 2),
          ),
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        ),
      );
}
