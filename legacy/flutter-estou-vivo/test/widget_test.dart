import 'package:flutter_test/flutter_test.dart';
import 'package:estou_vivo/app.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  testWidgets('App should render home screen', (WidgetTester tester) async {
    await tester.pumpWidget(const EstouVivoApp());
    
    // Aguarda inicialização (SharedPreferences mock é instantâneo)
    await tester.pump(const Duration(milliseconds: 100)); 
    // Outro pump para renderizar após o CircularProgressIndicator sumir
    await tester.pump(const Duration(milliseconds: 100));

    // Verifica que o botão principal é renderizado
    // O texto no código é "Estou Vivo!" (Case sensitive)
    expect(find.text('Estou Vivo!'), findsWidgets);
  });
}
