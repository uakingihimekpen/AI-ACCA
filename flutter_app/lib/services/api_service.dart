import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String baseUrl = 'http://10.0.2.2:5000';
  static String? _token;

  static Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('token');
  }

  static String? getToken() => _token;

  static Future<void> setToken(String? token) async {
    _token = token;
    final prefs = await SharedPreferences.getInstance();
    if (token != null) {
      await prefs.setString('token', token);
    } else {
      await prefs.remove('token');
    }
  }

  static Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    if (_token != null) 'Authorization': 'Bearer $_token',
  };

  static Future<Map<String, dynamic>> get(String endpoint) async {
    final response = await http.get(Uri.parse('$baseUrl$endpoint'), headers: _headers);
    return _handleResponse(response);
  }

  static Future<Map<String, dynamic>> post(String endpoint, {Map<String, dynamic>? body}) async {
    final response = await http.post(
      Uri.parse('$baseUrl$endpoint'),
      headers: _headers,
      body: body != null ? jsonEncode(body) : null,
    );
    return _handleResponse(response);
  }

  static Future<Map<String, dynamic>> put(String endpoint, {Map<String, dynamic>? body}) async {
    final response = await http.put(
      Uri.parse('$baseUrl$endpoint'),
      headers: _headers,
      body: body != null ? jsonEncode(body) : null,
    );
    return _handleResponse(response);
  }

  static Map<String, dynamic> _handleResponse(http.Response response) {
    final data = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return data;
    }
    throw Exception(data['error'] ?? 'Request failed');
  }

  // Auth
  static Future<Map<String, dynamic>> register(String name, String email, String password) {
    return post('/api/auth/register', body: {'name': name, 'email': email, 'password': password, 'platform': 'android'});
  }
  static Future<Map<String, dynamic>> login(String email, String password) {
    return post('/api/auth/login', body: {'email': email, 'password': password});
  }
  static Future<Map<String, dynamic>> getProfile() => get('/api/auth/profile');

  // Accumulators
  static Future<Map<String, dynamic>> getTodayAccumulators() => get('/api/accumulators/today');
  static Future<Map<String, dynamic>> getHistory({int? tier, String? status, int page = 1}) {
    final params = <String, String>{'page': page.toString()};
    if (tier != null) params['tier'] = tier.toString();
    if (status != null) params['status'] = status;
    final query = params.entries.map((e) => '${e.key}=${e.value}').join('&');
    return get('/api/accumulators/history?$query');
  }
  static Future<Map<String, dynamic>> getStats() => get('/api/accumulators/stats');

  // Rollovers
  static Future<Map<String, dynamic>> getActiveRollovers() => get('/api/rollovers/active');
  static Future<Map<String, dynamic>> getRolloverHistory() => get('/api/rollovers/history');

  // VIP
  static Future<Map<String, dynamic>> getVipPlans() => get('/api/vip/plans');
  static Future<Map<String, dynamic>> getVipStatus() => get('/api/vip/status');
  static Future<Map<String, dynamic>> initializeVipPayment(String plan) => post('/api/vip/initialize', body: {'plan': plan});

  // Donations
  static Future<Map<String, dynamic>> getBankDetails() => get('/api/donations/bank-details');
  static Future<Map<String, dynamic>> getDonationWall() => get('/api/donations/wall');
  static Future<Map<String, dynamic>> recordBankTransfer(double amount, {String? donorName, bool showOnWall = false}) {
    return post('/api/donations/bank-transfer', body: {'amount': amount, 'donorName': donorName, 'showOnWall': showOnWall});
  }

  // Ratings
  static Future<Map<String, dynamic>> getRatings() => get('/api/ratings');
  static Future<Map<String, dynamic>> submitRating(int stars, {String? comment}) {
    return post('/api/ratings', body: {'stars': stars, 'comment': comment});
  }
}