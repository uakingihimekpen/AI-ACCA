'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Plus, Check, X, Minus, Edit3 } from 'lucide-react';

export default function AdminAccumulatorsPage() {
  const [accumulators, setAccumulators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({
    tier: 5, date: new Date().toISOString().split('T')[0],
    selections: [{ league: '', home_team: '', away_team: '', market: 'Match Winner', pick: '', odds: '' }],
    combinedOdds: '', betslipCodes: { bet9ja: '', sportybet: '', ixbet: '' }, publishNow: true,
  });

  useEffect(() => { loadAccumulators(); }, []);

  const loadAccumulators = async () => {
    try {
      const res = await api.adminGetAccumulators();
      setAccumulators(res.accumulators);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const addSelection = () => {
    setForm({ ...form, selections: [...form.selections, { league: '', home_team: '', away_team: '', market: 'Match Winner', pick: '', odds: '' }] });
  };

  const updateSelection = (idx: number, field: string, value: string) => {
    const selections = [...form.selections];
    selections[idx][field] = value;
    // Auto-calculate combined odds
    const odds = selections.map((s: any) => parseFloat(s.odds)).filter((o: number) => !isNaN(o));
    const combined = odds.length > 0 ? odds.reduce((a: number, b: number) => a * b, 1).toFixed(2) : '';
    setForm({ ...form, selections, combinedOdds: combined });
  };

  const removeSelection = (idx: number) => {
    const selections = form.selections.filter((_: any, i: number) => i !== idx);
    setForm({ ...form, selections });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.adminCreateAccumulator(form);
      setShowForm(false);
      loadAccumulators();
      setForm({
        tier: 5, date: new Date().toISOString().split('T')[0],
        selections: [{ league: '', home_team: '', away_team: '', market: 'Match Winner', pick: '', odds: '' }],
        combinedOdds: '', betslipCodes: { bet9ja: '', sportybet: '', ixbet: '' }, publishNow: true,
      });
    } catch (err: any) { alert(err.message); }
  };

  const handleGrade = async (id: string, status: string) => {
    try {
      await api.adminGradeAccumulator(id, status);
      loadAccumulators();
    } catch (err: any) { alert(err.message); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Accumulators</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> {showForm ? 'Cancel' : 'New Acca'}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="card space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tier</label>
              <select value={form.tier} onChange={(e) => setForm({ ...form, tier: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm">
                <option value={5}>5 Odds</option><option value={10}>10 Odds</option><option value={20}>20 Odds (VIP)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Combined Odds</label>
              <input type="text" value={form.combinedOdds} readOnly
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-sm font-bold" />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.publishNow} onChange={(e) => setForm({ ...form, publishNow: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Publish now</span>
              </label>
            </div>
          </div>

          {/* Selections */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Selections</label>
              <button type="button" onClick={addSelection} className="text-sm text-primary-600 hover:text-primary-700">+ Add pick</button>
            </div>
            {form.selections.map((sel: any, idx: number) => (
              <div key={idx} className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <input placeholder="League" value={sel.league} onChange={(e) => updateSelection(idx, 'league', e.target.value)}
                  className="col-span-2 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800" />
                <input placeholder="Home" value={sel.home_team} onChange={(e) => updateSelection(idx, 'home_team', e.target.value)}
                  className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800" />
                <input placeholder="Away" value={sel.away_team} onChange={(e) => updateSelection(idx, 'away_team', e.target.value)}
                  className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800" />
                <input placeholder="Pick" value={sel.pick} onChange={(e) => updateSelection(idx, 'pick', e.target.value)}
                  className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800" />
                <div className="flex gap-1">
                  <input placeholder="Odds" value={sel.odds} onChange={(e) => updateSelection(idx, 'odds', e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800" />
                  <button type="button" onClick={() => removeSelection(idx)} className="p-1 text-red-500 hover:bg-red-50 rounded"><Minus className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>

          {/* Betslip Codes */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bet9ja Code</label>
              <input value={form.betslipCodes.bet9ja} onChange={(e) => setForm({ ...form, betslipCodes: { ...form.betslipCodes, bet9ja: e.target.value } })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SportyBet Code</label>
              <input value={form.betslipCodes.sportybet} onChange={(e) => setForm({ ...form, betslipCodes: { ...form.betslipCodes, sportybet: e.target.value } })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">1xBet Code</label>
              <input value={form.betslipCodes.ixbet} onChange={(e) => setForm({ ...form, betslipCodes: { ...form.betslipCodes, ixbet: e.target.value } })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm" />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full">Create Accumulator</button>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="card animate-pulse h-16" />)}</div>
      ) : (
        <div className="space-y-3">
          {accumulators.map((acc) => (
            <div key={acc.id} className="card flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {new Date(acc.date).toLocaleDateString()}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                  acc.tier === 20 ? 'bg-vip-100 text-vip-800' : acc.tier === 10 ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                }`}>{acc.tier} Odds</span>
                <span className="text-sm font-medium text-accent-600">@{acc.combined_odds}</span>
                <span className={`badge-${acc.status}`}>{acc.status}</span>
              </div>
              <div className="flex items-center gap-2">
                {acc.status === 'pending' && (
                  <>
                    <button onClick={() => handleGrade(acc.id, 'won')} className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg hover:bg-green-200" title="Mark Won"><Check className="w-4 h-4" /></button>
                    <button onClick={() => handleGrade(acc.id, 'lost')} className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg hover:bg-red-200" title="Mark Lost"><X className="w-4 h-4" /></button>
                    <button onClick={() => handleGrade(acc.id, 'void')} className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 rounded-lg hover:bg-gray-200" title="Mark Void"><Minus className="w-4 h-4" /></button>
                  </>
                )}
              </div>
            </div>
          ))}
          {accumulators.length === 0 && (
            <div className="card text-center py-8 text-gray-500">No accumulators yet</div>
          )}
        </div>
      )}
    </div>
  );
}