import 'package:flutter_test/flutter_test.dart';
import 'package:nikays_pastry/main.dart';

void main() {
  testWidgets('App loads successfully', (WidgetTester tester) async {
    await tester.pumpWidget(const NikaysPastryApp());
    await tester.pumpAndSettle();
    expect(find.text("Nikay's Pastry"), findsNothing); // Title from MaterialApp
  });
}
