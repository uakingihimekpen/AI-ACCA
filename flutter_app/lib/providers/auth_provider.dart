import 'package:flutter/material.dart';
import '../services/api_service.dart';

class AuthProvider extends ChangeNotifier {
  Map<String, dynamic>? _user;
  bool _loading = true;

  Map<String, dynamic>? get user => _user;
  bool get loading => _loading;
  bool get isLoggedIn => _user != null;
  bool get isAdmin => _user?['role'] == 'admin';
  bool get isVip => _user?['is_vip'] == true;

  AuthProvider() {
    _init();
  }

  Future<void> _init() async {
    await ApiService.init();
    if (ApiService.getToken() != null) {
      try {
        final res = await ApiService.getProfile();
        _user = res['user'];
      } catch (_) {
        await ApiService.setToken(null);
      }
    }
    _loading = false;
    notifyListeners();
  }

  Future<void> login(String email, String password) async {
    final res = await ApiService.login(email, password);
    await ApiService.setToken(res['token']);
    _user = res['user'];
    notifyListeners();
  }

  Future<void> register(String name, String email, String password) async {
    final res = await ApiService.register(name, email, password);
    await ApiService.setToken(res['token']);
    _user = res['user'];
    notifyListeners();
  }

  Future<void> logout() async {
    await ApiService.setToken(null);
    _user = null;
    notifyListeners();
  }
}