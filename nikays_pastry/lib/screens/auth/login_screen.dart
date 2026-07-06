import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../config/theme.dart';

class LoginScreen extends StatefulWidget {
  final VoidCallback? onSuccess;
  const LoginScreen({super.key, this.onSuccess});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  bool _isRegister = false;
  bool _showPassword = false;
  bool _isLoading = false;

  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();

  String? _error;

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _firstNameController.dispose();
    _lastNameController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() {
      _error = null;
      _isLoading = true;
    });

    try {
      final auth = context.read<AuthProvider>();
      if (_isRegister) {
        if (_firstNameController.text.trim().isEmpty ||
            _lastNameController.text.trim().isEmpty) {
          setState(() => _error = 'Please provide your full name.');
          _isLoading = false;
          return;
        }
        if (_passwordController.text != _confirmPasswordController.text) {
          setState(() => _error = 'Passwords do not match.');
          _isLoading = false;
          return;
        }
        await auth.register({
          'username': _usernameController.text.trim(),
          'password': _passwordController.text,
          'password_confirmation': _confirmPasswordController.text,
          'first_name': _firstNameController.text.trim(),
          'last_name': _lastNameController.text.trim(),
        });
      } else {
        await auth.login(
          _usernameController.text.trim(),
          _passwordController.text,
        );
      }
      if (widget.onSuccess != null) widget.onSuccess!();
      if (mounted) Navigator.of(context).pop();
    } catch (e) {
      setState(() => _error = e.toString().replaceAll('ApiException: ', ''));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.alabaster,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Container(
              constraints: const BoxConstraints(maxWidth: 420),
              child: Column(
                children: [
                  // Logo
                  Container(
                    width: 60, height: 60,
                    decoration: BoxDecoration(
                      color: AppColors.primaryLight,
                      shape: BoxShape.circle,
                      border: Border.all(color: AppColors.primary, width: 1.5),
                    ),
                    child: const Center(
                      child: Text('N', style: TextStyle(
                        fontFamily: 'PlayfairDisplay',
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary,
                      )),
                    ),
                  ),
                  const SizedBox(height: 12),
                  const Text("Nikay's Pastry", style: TextStyle(
                    fontFamily: 'PlayfairDisplay',
                    fontSize: 28,
                    fontWeight: FontWeight.w700,
                    color: AppColors.espresso,
                  )),
                  const Text('Premium Confeitaria', style: TextStyle(
                    fontSize: 10,
                    letterSpacing: 2,
                    color: AppColors.cocoa,
                  )),
                  const SizedBox(height: 32),
                  // Toggle
                  Row(
                    children: [
                      _toggleButton('Sign In', !_isRegister, () => setState(() => _isRegister = false)),
                      const SizedBox(width: 8),
                      _toggleButton('Create Account', _isRegister, () => setState(() => _isRegister = true)),
                    ],
                  ),
                  const SizedBox(height: 24),
                  if (_isRegister) ...[
                    Row(
                      children: [
                        Expanded(child: _textField('First name', _firstNameController)),
                        const SizedBox(width: 12),
                        Expanded(child: _textField('Last name', _lastNameController)),
                      ],
                    ),
                    const SizedBox(height: 16),
                  ],
                  _textField('Username', _usernameController, icon: Icons.person_outline),
                  const SizedBox(height: 16),
                  _passwordField(),
                  if (_isRegister) ...[
                    const SizedBox(height: 16),
                    _textField('Confirm Password', _confirmPasswordController, obscure: true),
                  ],
                  const SizedBox(height: 16),
                  if (_error != null)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(12),
                      margin: const EdgeInsets.only(bottom: 16),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFF7F7),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppColors.danger.withValues(alpha: 0.18)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.warning_amber_rounded, size: 18, color: AppColors.danger),
                          const SizedBox(width: 8),
                          Expanded(child: Text(_error!, style: const TextStyle(fontSize: 13, color: AppColors.danger))),
                        ],
                      ),
                    ),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      onPressed: _isLoading ? null : _submit,
                      child: _isLoading
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : Text(_isRegister ? 'Create Account' : 'Sign In'),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _toggleButton(String label, bool isActive, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isActive ? AppColors.primary : Colors.transparent,
          borderRadius: BorderRadius.circular(20),
          border: isActive ? null : Border.all(color: AppColors.almond),
        ),
        child: Text(label, style: TextStyle(
          fontFamily: 'Outfit',
          fontSize: 13,
          fontWeight: FontWeight.w600,
          color: isActive ? Colors.white : AppColors.cocoa,
        )),
      ),
    );
  }

  Widget _textField(String label, TextEditingController controller, {IconData? icon, bool obscure = false}) {
    return TextField(
      controller: controller,
      obscureText: obscure,
      style: const TextStyle(fontFamily: 'Outfit', fontSize: 14),
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: icon != null ? Icon(icon, size: 18) : null,
      ),
    );
  }

  Widget _passwordField() {
    return TextField(
      controller: _passwordController,
      obscureText: !_showPassword,
      style: const TextStyle(fontFamily: 'Outfit', fontSize: 14),
      decoration: InputDecoration(
        labelText: 'Password',
        prefixIcon: const Icon(Icons.lock_outline, size: 18),
        suffixIcon: IconButton(
          icon: Icon(_showPassword ? Icons.visibility_off : Icons.visibility, size: 18),
          onPressed: () => setState(() => _showPassword = !_showPassword),
        ),
      ),
    );
  }
}
