'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Plus, Check, X } from 'lucide-react';

export default function AdminRolloversPage() {
  const [rollovers, setRollovers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ program: '7day', variant: '2odds', startDate: new Date().toISOString().split('T')[0] });

  useEffect(() => { loadRollovers(); }, []);

  const loadRollovers = async () => {
    try {
      const res = await api.adminGetRollovers();
      setRollovers(res.rollovers);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.adminCreateRollover(form);
      setShowForm(false);
      loadRollovers();
    } catch (err: any) { alert(err.message); }
  };

  const handleGradeDay = async (rolloverId: string, dayNumber: number, status: string) => {
    try {
      await api.adminUpdateRolloverDay(rolloverId, dayNumber, { status });
      loadRollovers();
    } catch (err: any) { alert(err.message); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rollovers</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> {showForm ? 'Cancel' : 'New Rollover'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Program</label>
              <select value={form.program} onChange={(e) => setForm({ ...form, program: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm">
                <option value="7day">7-Day</option><option value="15day">15-Day</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Variant</label>
              <select value={form.variant} onChange={(e) => setForm({ ...form, variant: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm">
                <option value="2odds">2 Odds</option><option value="5odds">5 Odds</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm" />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full">Create Rollover</button>
        </form>
      )}

      {loading ? (
        <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="card animate-pulse h-20" />)}</div>
      ) : (
        <div className="space-y-4">
          {rollovers.map((ro) => (
            <div key={ro.id} className="card">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {ro.program === '7day' ? '7-Day' : '15-Day'} Rollover
                  </span>
                  <span className="ml-2 text-sm text-gray-500">{ro.variant === '2odds' ? '2 Odds' : '5 Odds'}</span>
                  <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                    ro.status === 'active' ? 'bg-green-100 text-green-700' : ro.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                  }`}>{ro.status}</span>
                </div>
                <span className="text-xs text-gray-500">{new Date(ro.start_date).toLocaleDateString()}</span>
              </div>
              <div className="grid gap-2">
                {(ro.days || []).map((day: any) => (
                  <div key={day.day_number} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold w-6 text-center">D{day.day_number}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {day.selections?.length > 0 ? day.selections.map((s: any) => s.home_team).join(', ') : 'Not set'}
                      </span>
                      {day.odds && <span className="text-xs font-medium text-accent-600">@{day.odds}</span>}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        day.status === 'pass' ? 'bg-green-100 text-green-700' : day.status === 'fail' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
                      }`}>{day.status || 'pending'}</span>
                      {day.status === 'pending' && (
                        <>
                          <button onClick={() => handleGradeDay(ro.id, day.day_number, 'pass')} className="p-1 text-green-600 hover:bg-green-50 rounded"><Check className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleGradeDay(ro.id, day.day_number, 'fail')} className="p-1 text-red-600 hover:bg-red-50 rounded"><X className="w-3.5 h-3.5" /></button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {rollovers.length === 0 && <div className="card text-center py-8 text-gray-500">No rollovers yet</div>}
        </div>
      )}
    </div>
  );
}