class User {
  final int id;
  final String username;
  final String firstName;
  final String lastName;
  final String? middleName;
  final String? profilePicture;
  final String role;

  User({
    required this.id,
    required this.username,
    required this.firstName,
    required this.lastName,
    this.middleName,
    this.profilePicture,
    this.role = 'user',
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? json['user_id'] ?? 0,
      username: json['username'] ?? '',
      firstName: json['first_name'] ?? '',
      lastName: json['last_name'] ?? '',
      middleName: json['middle_name'],
      profilePicture: json['profile_picture'],
      role: json['role'] ?? 'user',
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'username': username,
    'first_name': firstName,
    'last_name': lastName,
    'middle_name': middleName,
    'profile_picture': profilePicture,
    'role': role,
  };

  String get fullName => '$firstName $lastName';
  bool get isAdmin => role == 'admin';
}
