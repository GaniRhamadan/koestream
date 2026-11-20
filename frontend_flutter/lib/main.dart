import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'state/app_state.dart';
import 'screens/immersion_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final appState = AppState();
  await appState.init();

  runApp(
    ChangeNotifierProvider<AppState>.value(
      value: appState,
      child: const KoeStreamApp(),
    ),
  );
}

class KoeStreamApp extends StatelessWidget {
  const KoeStreamApp({super.key});

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);

    // KoeStream High-End Zinc-950 Dark Theme (1:1 with Web styles.css)
    final darkTheme = ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: const Color(0xFF09090B), // --bg-primary
      colorScheme: ColorScheme.fromSeed(
        seedColor: const Color(0xFF6366F1), // --primary (Soft Indigo)
        brightness: Brightness.dark,
        surface: const Color(0xFF121215), // --bg-surface
        onSurface: const Color(0xFFFAFAFA), // --text-primary
        primary: const Color(0xFF6366F1),
        secondary: const Color(0xFF1DB954), // --spotify-green
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Color(0xFF09090B),
        elevation: 0,
        centerTitle: false,
        iconTheme: IconThemeData(color: Color(0xFFFAFAFA)),
        titleTextStyle: TextStyle(
          color: Color(0xFFFAFAFA),
          fontSize: 17,
          fontWeight: FontWeight.w700,
          letterSpacing: -0.3,
        ),
      ),
      cardTheme: CardThemeData(
        color: const Color(0xFF121215),
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(14),
          side: const BorderSide(color: Color(0xFF27272A), width: 1),
        ),
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: const Color(0xFF121215),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: Color(0xFF27272A), width: 1),
        ),
      ),
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: Color(0xFF121215),
        modalBackgroundColor: Color(0xFF121215),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
      ),
    );

    // Clean Light Theme
    final lightTheme = ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: const Color(0xFFF8FAFC),
      colorScheme: ColorScheme.fromSeed(
        seedColor: const Color(0xFF2563EB),
        brightness: Brightness.light,
        surface: Colors.white,
        onSurface: const Color(0xFF0F172A),
        primary: const Color(0xFF2563EB),
        secondary: const Color(0xFF16A34A),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Color(0xFFF8FAFC),
        elevation: 0,
        centerTitle: false,
        iconTheme: IconThemeData(color: Color(0xFF0F172A)),
        titleTextStyle: TextStyle(
          color: Color(0xFF0F172A),
          fontSize: 17,
          fontWeight: FontWeight.w700,
          letterSpacing: -0.3,
        ),
      ),
      cardTheme: CardThemeData(
        color: Colors.white,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(14),
          side: const BorderSide(color: Color(0xFFE2E8F0), width: 1),
        ),
      ),
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: Colors.white,
        modalBackgroundColor: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
      ),
    );

    return MaterialApp(
      title: 'KoeStream',
      debugShowCheckedModeBanner: false,
      theme: lightTheme,
      darkTheme: darkTheme,
      themeMode: appState.isDarkMode ? ThemeMode.dark : ThemeMode.light,
      home: const ImmersionScreen(),
    );
  }
}
