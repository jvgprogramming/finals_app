import 'api_client.dart';
import '../config/api_config.dart';
import '../models/user.dart';

class UserAdminService {
  final ApiClient _client = ApiClient();

  Future<({List<User> users, int lastPage})> loadUsers(int page, {String search = ''}) async {
    final queryParams = <String, String>{'page': '$page'};
    if (search.isNotEmpty) queryParams['search'] = search;
    final data = await _client.get(ApiConfig.loadUsers, queryParams: queryParams);
    final usersData = data['users'] ?? data['data'] ?? <dynamic>[];
    final usersList = usersData['data'] as List? ?? (usersData is List ? usersData : <dynamic>[]);
    final lastPage = usersData['last_page'] ?? data['last_page'] ?? 1;
    return (
      users: usersList.map((j) => User.fromJson(j as Map<String, dynamic>)).toList(),
      lastPage: lastPage as int,
    );
  }

  Future<Map<String, dynamic>> storeUser(Map<String, dynamic> formData) async {
    return await _client.post(ApiConfig.storeUser, body: formData, isFormData: true) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> updateUser(int id, Map<String, dynamic> formData) async {
    return await _client.post(ApiConfig.updateUser(id), body: formData, isFormData: true) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> destroyUser(int id) async {
    return await _client.delete(ApiConfig.destroyUser(id)) as Map<String, dynamic>;
  }
}
