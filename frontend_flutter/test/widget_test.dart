import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:lingostream_universal/main.dart';
import 'package:lingostream_universal/state/app_state.dart';

void main() {
  testWidgets('KoeStream App smoke test', (WidgetTester tester) async {
    final appState = AppState();
    await tester.pumpWidget(
      ChangeNotifierProvider<AppState>.value(
        value: appState,
        child: const LingoStreamApp(),
      ),
    );
    expect(find.text('KoeStream'), findsOneWidget);
  });
}
