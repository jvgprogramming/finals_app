import 'api_client.dart';
import '../config/api_config.dart';
import '../models/user.dart';

class AuthService {
  final ApiClient _client = ApiClient();

  Future<({User user, String token})> login(String username, String password) async {
    final data = await _client.post(ApiConfig.login, body: {
      'username': username,
      'password': password,
    });
    final user = User.fromJson(data['user'] as Map<String, dynamic>);
    final token = data['token'] as String;
    return (user: user, token: token);
  }

  Future<({User user, String token})> register(Map<String, dynamic> payload) async {
    final data = await _client.post(ApiConfig.register, body: payload);
    final user = User.fromJson(data['user'] as Map<String, dynamic>);
    final token = data['token'] as String;
    return (user: user, token: token);
  }

  Future<void> logout() async {
    try {
      await _client.post(ApiConfig.logout);
    } catch (_) {}
  }

  Future<User> me() async {
    final data = await _client.get(ApiConfig.me);
    return User.fromJson(data['user'] as Map<String, dynamic>);
  }
}
