'use client';

import React, { useState } from 'react';
import { Copy, Check, Lock, ExternalLink, Trophy } from 'lucide-react';

interface AccumulatorCardProps {
  accumulator: any;
  isLocked?: boolean;
  compact?: boolean;
}

export default function AccumulatorCard({ accumulator, isLocked, compact }: AccumulatorCardProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'won': return <span className="badge-won">✅ Won</span>;
      case 'lost': return <span className="badge-lost">❌ Lost</span>;
      case 'void': return <span className="badge-void">➖ Void</span>;
      default: return <span className="badge-pending">⏳ Pending</span>;
    }
  };

  const getTierColor = (tier: number) => {
    switch (tier) {
      case 5: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 10: return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 20: return 'bg-vip-100 text-vip-800 dark:bg-vip-900 dark:text-vip-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLocked) {
    return (
      <div className="card animate-fade-in relative overflow-hidden">
        <div className="absolute inset-0 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 z-10 flex items-center justify-center">
          <div className="text-center">
            <Lock className="w-8 h-8 text-vip-500 mx-auto mb-2" />
            <p className="font-semibold text-gray-900 dark:text-white">VIP Content</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Upgrade to unlock 20 Odds Acca</p>
            <a href="/vip" className="btn-vip inline-block mt-3 text-sm">Unlock with VIP</a>
          </div>
        </div>
        <div className="opacity-30">
          <_CardContent accumulator={accumulator} getStatusBadge={getStatusBadge} getTierColor={getTierColor} compact={compact} />
        </div>
      </div>
    );
  }

  return (
    <div className="card animate-fade-in hover:shadow-lg transition-shadow duration-200">
      <_CardContent
        accumulator={accumulator}
        getStatusBadge={getStatusBadge}
        getTierColor={getTierColor}
        compact={compact}
        copyToClipboard={copyToClipboard}
        copiedCode={copiedCode}
      />
    </div>
  );
}

function _CardContent({
  accumulator,
  getStatusBadge,
  getTierColor,
  compact,
  copyToClipboard,
  copiedCode,
}: {
  accumulator: any;
  getStatusBadge: (s: string) => React.ReactNode;
  getTierColor: (t: number) => string;
  compact?: boolean;
  copyToClipboard?: (code: string) => void;
  copiedCode?: string | null;
}) {
  const selections = Array.isArray(accumulator.selections) ? accumulator.selections : [];
  const betslipCodes = accumulator.betslip_codes || {};

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getTierColor(accumulator.tier)}`}>
            {accumulator.tier} Odds
          </span>
          {accumulator.is_vip && (
            <span className="px-2 py-0.5 bg-vip-500 text-black text-xs font-bold rounded-full">
              VIP
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(accumulator.status)}
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(accumulator.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </span>
        </div>
      </div>

      {/* Selections */}
      {!compact && selections.length > 0 && (
        <div className="space-y-2 mb-4">
          {selections.map((sel: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {sel.home_team} vs {sel.away_team}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {sel.league} • {sel.market}
                </p>
              </div>
              <div className="text-right ml-2 flex-shrink-0">
                <p className="text-sm font-semibold text-primary-600 dark:text-primary-400">{sel.pick}</p>
                <p className="text-xs text-gray-500">@{sel.odds}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Combined Odds */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500 dark:text-gray-400">Combined Odds</span>
        <span className="text-lg font-bold text-accent-600 dark:text-accent-400">
          @{accumulator.combined_odds}
        </span>
      </div>

      {/* Betslip Codes */}
      <div className="space-y-2">
        {betslipCodes.bet9ja && (
          <_CodeRow
            label="Bet9ja"
            code={betslipCodes.bet9ja}
            color="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
            copyToClipboard={copyToClipboard}
            copiedCode={copiedCode}
          />
        )}
        {betslipCodes.sportybet && (
          <_CodeRow
            label="SportyBet"
            code={betslipCodes.sportybet}
            color="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
            copyToClipboard={copyToClipboard}
            copiedCode={copiedCode}
          />
        )}
        {betslipCodes.ixbet && (
          <_CodeRow
            label="1xBet"
            code={betslipCodes.ixbet}
            color="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
            copyToClipboard={copyToClipboard}
            copiedCode={copiedCode}
          />
        )}
      </div>
    </>
  );
}

function _CodeRow({
  label,
  code,
  color,
  copyToClipboard,
  copiedCode,
}: {
  label: string;
  code: string;
  color: string;
  copyToClipboard?: (code: string) => void;
  copiedCode?: string | null;
}) {
  return (
    <div className={`flex items-center justify-between px-3 py-2 rounded-lg ${color}`}>
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xs font-bold uppercase flex-shrink-0">{label}</span>
        <code className="text-xs font-mono truncate">{code}</code>
      </div>
      <button
        onClick={() => copyToClipboard?.(code)}
        className="flex-shrink-0 ml-2 p-1.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        title="Copy code"
      >
        {copiedCode === code ? (
          <Check className="w-3.5 h-3.5 text-green-600" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
}