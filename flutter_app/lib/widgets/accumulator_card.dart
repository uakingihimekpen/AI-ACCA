import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class AccumulatorCard extends StatelessWidget {
  final Map<String, dynamic> accumulator;
  final bool isLocked;

  const AccumulatorCard({super.key, required this.accumulator, this.isLocked = false});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    if (isLocked) {
      return Stack(
        children: [
          Opacity(opacity: 0.3, child: _buildCard(theme, context)),
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

    return _buildCard(theme, context);
  }

  Widget _buildCard(ThemeData theme, BuildContext context) {
    final selections = accumulator['selections'] as List<dynamic>? ?? [];
    final betslipCodes = accumulator['betslip_codes'] as Map<String, dynamic>? ?? {};
    final tier = accumulator['tier'] ?? 5;
    final status = accumulator['status'] ?? 'pending';
    final date = accumulator['date'] ?? '';

    Color getTierColor() {
      switch (tier) { case 5: return Colors.blue; case 10: return Colors.purple; case 20: return Colors.amber; default: return Colors.grey; }
    }
    Color getStatusColor() {
      switch (status) { case 'won': return Colors.green; case 'lost': return Colors.red; case 'void': return Colors.grey; default: return Colors.orange; }
    }
    String getStatusText() {
      switch (status) { case 'won': return '✅ Won'; case 'lost': return '❌ Lost'; case 'void': return '➖ Void'; default: return '⏳ Pending'; }
    }

    void copyCode(String code) {
      Clipboard.setData(ClipboardData(text: code));
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Copied!')));
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(color: getTierColor().withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                      child: Text('$tier Odds', style: TextStyle(fontWeight: FontWeight.bold, color: getTierColor(), fontSize: 12)),
                    ),
                    if (accumulator['is_vip'] == true) ...[
                      const SizedBox(width: 4),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(color: Colors.amber, borderRadius: BorderRadius.circular(8)),
                        child: const Text('VIP', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Colors.black)),
                      ),
                    ],
                  ],
                ),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(color: getStatusColor().withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                      child: Text(getStatusText(), style: TextStyle(fontSize: 11, color: getStatusColor())),
                    ),
                    const SizedBox(width: 8),
                    Text(date.toString().substring(0, 10), style: const TextStyle(fontSize: 11, color: Colors.grey)),
                  ],
                ),
              ],
            ),
            // Selections
            if (selections.isNotEmpty) ...[
              const SizedBox(height: 12),
              ...selections.take(3).map((sel) => Container(
                padding: const EdgeInsets.all(8),
                margin: const EdgeInsets.only(bottom: 4),
                decoration: BoxDecoration(color: Colors.grey.shade50, borderRadius: BorderRadius.circular(8)),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('${sel['home_team']} vs ${sel['away_team']}', style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 13)),
                          Text('${sel['league']} • ${sel['market']}', style: const TextStyle(fontSize: 11, color: Colors.grey)),
                        ],
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(sel['pick'] ?? '', style: TextStyle(fontWeight: FontWeight.bold, color: theme.colorScheme.primary, fontSize: 13)),
                        Text('@${sel['odds']}', style: const TextStyle(fontSize: 11, color: Colors.grey)),
                      ],
                    ),
                  ],
                ),
              )),
            ],
            const SizedBox(height: 8),
            // Combined Odds
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Combined Odds', style: TextStyle(fontSize: 12, color: Colors.grey)),
                Text('@${accumulator['combined_odds']}', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.green.shade600)),
              ],
            ),
            // Betslip codes
            if (betslipCodes['bet9ja'] != null && betslipCodes['bet9ja'].toString().isNotEmpty)
              _codeRow('Bet9ja', betslipCodes['bet9ja'].toString(), Colors.green, copyCode),
            if (betslipCodes['sportybet'] != null && betslipCodes['sportybet'].toString().isNotEmpty)
              _codeRow('SportyBet', betslipCodes['sportybet'].toString(), Colors.orange, copyCode),
            if (betslipCodes['ixbet'] != null && betslipCodes['ixbet'].toString().isNotEmpty)
              _codeRow('1xBet', betslipCodes['ixbet'].toString(), Colors.red, copyCode),
          ],
        ),
      ),
    );
  }

  Widget _codeRow(String label, String code, Color color, Function(String) onCopy) {
    return Padding(
      padding: const EdgeInsets.only(top: 4),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
        child: Row(
          children: [
            Text(label, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: color)),
            const SizedBox(width: 8),
            Expanded(child: Text(code, style: const TextStyle(fontSize: 11, fontFamily: 'monospace'))),
            GestureDetector(
              onTap: () => onCopy(code),
              child: const Icon(Icons.copy, size: 16),
            ),
          ],
        ),
      ),
    );
  }
}