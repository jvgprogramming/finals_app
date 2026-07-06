import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/auth_provider.dart';
import 'providers/cart_provider.dart';
import 'providers/order_provider.dart';
import 'providers/notification_provider.dart';
import 'providers/product_provider.dart';
import 'screens/customer/customer_home.dart';
import 'screens/admin/admin_home.dart';
import 'screens/auth/login_screen.dart';
import 'config/theme.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const NikaysPastryApp());
}

class NikaysPastryApp extends StatelessWidget {
  const NikaysPastryApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()..init()),
        ChangeNotifierProvider(create: (_) => CartProvider()),
        ChangeNotifierProvider(create: (_) => ProductProvider()),
        ChangeNotifierProvider(create: (_) => OrderProvider()),
        ChangeNotifierProvider(create: (_) => NotificationProvider()),
      ],
      child: MaterialApp(
        title: "Nikay's Pastry",
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        home: const AuthGate(),
        routes: {
          '/login': (_) => const LoginScreen(),
          '/customer': (_) => const CustomerHome(),
          '/admin': (_) => const AdminHome(),
        },
      ),
    );
  }
}

class AuthGate extends StatefulWidget {
  const AuthGate({super.key});

  @override
  State<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> {
  Timer? _pollTimer;

  @override
  void initState() {
    super.initState();
    // Initialize cart, notification polling after auth is ready
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final auth = context.read<AuthProvider>();
      auth.addListener(_onAuthChanged);
      if (auth.isAuthenticated) {
        _loadUserData();
      }
    });
  }

  void _onAuthChanged() {
    final auth = context.read<AuthProvider>();
    if (auth.isAuthenticated) {
      _loadUserData();
    } else {
      context.read<NotificationProvider>().stopPolling();
      _pollTimer?.cancel();
    }
  }

  void _loadUserData() {
    context.read<CartProvider>().loadCart();
    context.read<OrderProvider>().loadOrders();
    context.read<NotificationProvider>().startPolling();
    // Also poll orders every 10 seconds (matching web app behavior)
    _pollTimer?.cancel();
    _pollTimer = Timer.periodic(const Duration(seconds: 10), (_) {
      context.read<OrderProvider>().loadOrders();
    });
  }

  @override
  void dispose() {
    context.read<AuthProvider>().removeListener(_onAuthChanged);
    _pollTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, auth, _) {
        if (auth.isLoading) {
          return const Scaffold(
            body: Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  SizedBox(
                    width: 40, height: 40,
                    child: CircularProgressIndicator(
                      strokeWidth: 3,
                      color: Color(0xFFD47C6A),
                    ),
                  ),
                  SizedBox(height: 16),
                  Text('Restoring your session…', style: TextStyle(
                    fontFamily: 'Outfit',
                    fontSize: 14,
                    color: Color(0xFF6E5A56),
                  )),
                ],
              ),
            ),
          );
        }

        if (auth.isAuthenticated && auth.user!.isAdmin) {
          return const AdminHome();
        }

        // Customer view - always available even without login
        return const CustomerHome();
      },
    );
  }
}
