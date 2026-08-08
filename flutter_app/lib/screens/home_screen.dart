import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../widgets/accumulator_card.dart';
import '../widgets/rollover_tracker.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<dynamic> _accumulators = [];
  List<dynamic> _rollovers = [];
  Map<String, dynamic>? _stats;
  bool _loading = true;
  int _activeTab = 0;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final accRes = await ApiService.getTodayAccumulators();
      final rollRes = await ApiService.getActiveRollovers();
      final statsRes = await ApiService.getStats();
      setState(() {
        _accumulators = accRes['accumulators'] as List<dynamic>;
        _rollovers = rollRes['rollovers'] as List<dynamic>;
        _stats = statsRes;
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final theme = Theme.of(context);
    final tiers = [5, 10, 20];

    return RefreshIndicator(
      onRefresh: _loadData,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 16),
            Text("Today's Accumulators", style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),

            // Stats banner
            if (_stats != null) ...[
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _StatItem(label: 'Win Rate', value: _stats!['overall']['winRate'].toString()),
                  const SizedBox(width: 24),
                  _StatItem(label: 'Total', value: _stats!['overall']['total'].toString()),
                  const SizedBox(width: 24),
                  _StatItem(label: 'Won', value: _stats!['overall']['won'].toString()),
                ],
              ),
              const SizedBox(height: 16),
            ],

            // Tier tabs
            Row(
              children: List.generate(tiers.length, (idx) {
                final tier = tiers[idx];
                final isActive = _activeTab == idx;
                final isVip = tier == 20;
                return Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    child: ElevatedButton(
                      onPressed: () => setState(() => _activeTab = idx),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: isActive ? (isVip ? Colors.amber : theme.colorScheme.primary) : null,
                        foregroundColor: isActive ? Colors.white : null,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: Column(
                        children: [
                          if (isVip) const Icon(Icons.workspace_premium, size: 16),
                          Text('$tier Odds', style: const TextStyle(fontWeight: FontWeight.bold)),
                          Text(isVip ? 'VIP' : 'Free', style: const TextStyle(fontSize: 10)),
                        ],
                      ),
                    ),
                  ),
                );
              }),
            ),
            const SizedBox(height: 16),

            // Accumulator cards
            if (_loading)
              ...List.generate(3, (_) => const _ShimmerCard())
            else
              ..._accumulators.where((a) => a['tier'] == tiers[_activeTab]).map((acc) => AccumulatorCard(
                accumulator: acc,
                isLocked: acc['locked'] == true || (acc['is_vip'] == true && !auth.isVip),
              )),

            // Rollovers
            if (_rollovers.isNotEmpty) ...[
              const SizedBox(height: 24),
              Text('Active Rollovers', style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              ...(_rollovers.take(2)).map((ro) => RolloverTracker(
                rollover: ro,
                isLocked: ro['locked'] == true || !auth.isVip,
              )),
            ],

            // Responsible gambling
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.yellow.shade50,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.yellow.shade200),
              ),
              child: const Column(
                children: [
                  Text('⚠️ Bet responsibly, 18+ only', style: TextStyle(fontWeight: FontWeight.bold)),
                  SizedBox(height: 4),
                  Text('These are predictions/opinions, not guaranteed outcomes.',
                      style: TextStyle(fontSize: 12, color: Colors.grey)),
                ],
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  final String label, value;
  const _StatItem({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Theme.of(context).colorScheme.primary)),
        Text(label, style: const TextStyle(fontSize: 11, color: Colors.grey)),
      ],
    );
  }
}

class _ShimmerCard extends StatelessWidget {
  const _ShimmerCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 100,
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: Colors.grey.shade200,
        borderRadius: BorderRadius.circular(12),
      ),
    );
  }
}