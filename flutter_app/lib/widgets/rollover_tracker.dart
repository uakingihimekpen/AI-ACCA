import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';

class RolloverTracker extends StatelessWidget {
  final Map<String, dynamic> rollover;
  final bool isLocked;

  const RolloverTracker({super.key, required this.rollover, this.isLocked = false});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final days = (rollover['days'] as List<dynamic>?) ?? [];
    final passedDays = days.where((d) => d['status'] == 'pass').length;
    final totalDays = days.length;
    final progress = totalDays > 0 ? (passedDays / totalDays) * 100 : 0.0;
    final isActive = rollover['status'] == 'active';

    if (isLocked) {
      return Stack(
        children: [
          Opacity(opacity: 0.3, child: _buildCard(theme, days, passedDays, totalDays, progress, isActive)),
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                color: Colors.black.withOpacity(0.1),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.lock, color: Colors.amber, size: 32),
                  const SizedBox(height: 8),
                  Text('VIP Content', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  ElevatedButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.workspace_premium, size: 16),
                    label: const Text('Unlock with VIP'),
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.amber),
                  ),
                ],
              ),
            ),
          ),
        ],
      );
    }

    return _buildCard(theme, days, passedDays, totalDays, progress, isActive);
  }

  Widget _buildCard(ThemeData theme, List<dynamic> days, int passedDays, int totalDays, double progress, bool isActive) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${rollover['program'] == '7day' ? '7-Day' : '15-Day'} Rollover',
                      style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold),
                    ),
                    Text(
                      rollover['variant'] == '2odds' ? '2 Odds per day' : '5 Odds per day',
                      style: const TextStyle(fontSize: 12, color: Colors.grey),
                    ),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: isActive ? Colors.green.withOpacity(0.1) : Colors.red.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        isActive ? 'Still Alive 🔥' : rollover['status'] == 'completed' ? 'Completed ✅' : 'Failed ❌',
                        style: TextStyle(fontSize: 11, color: isActive ? Colors.green : Colors.red),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Started ${rollover['start_date'].toString().substring(0, 10)}',
                      style: const TextStyle(fontSize: 10, color: Colors.grey),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Progress bar
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Day ${passedDays + 1} of $totalDays', style: const TextStyle(fontSize: 12, color: Colors.grey)),
                Text('${progress.round()}%', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
              ],
            ),
            const SizedBox(height: 4),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: progress / 100,
                backgroundColor: Colors.grey.shade200,
                valueColor: AlwaysStoppedAnimation<Color>(Colors.green),
                minHeight: 8,
              ),
            ),
            const SizedBox(height: 12),

            // Days
            ...days.map((day) => Container(
              padding: const EdgeInsets.all(10),
              margin: const EdgeInsets.only(bottom: 4),
              decoration: BoxDecoration(
                color: day['status'] == 'pass' ? Colors.green.withOpacity(0.1) :
                        day['status'] == 'fail' ? Colors.red.withOpacity(0.1) : Colors.grey.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: day['status'] == 'pass' ? Colors.green.shade200 :
                    day['status'] == 'fail' ? Colors.red.shade200 : Colors.grey.shade300),
              ),
              child: Row(
                children: [
                  Container(
                    width: 28, height: 28,
                    decoration: BoxDecoration(
                      color: Colors.white, shape: BoxShape.circle,
                      border: Border.all(color: Colors.grey.shade300),
                    ),
                    child: Center(child: Text('${day['day_number']}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold))),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      day['selections'] != null && (day['selections'] as List).isNotEmpty
                          ? (day['selections'] as List).map((s) => s['home_team'] ?? '').join(', ')
                          : 'Not yet set',
                      style: const TextStyle(fontSize: 12),
                    ),
                  ),
                  Icon(
                    day['status'] == 'pass' ? Icons.check_circle :
                    day['status'] == 'fail' ? Icons.cancel : Icons.schedule,
                    color: day['status'] == 'pass' ? Colors.green :
                        day['status'] == 'fail' ? Colors.red : Colors.grey,
                    size: 20,
                  ),
                ],
              ),
            )),
          ],
        ),
      ),
    );
  }
}