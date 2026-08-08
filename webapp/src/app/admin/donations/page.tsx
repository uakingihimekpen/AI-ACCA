'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Check, Filter } from 'lucide-react';

export default function AdminDonationsPage() {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => { loadDonations(); }, [filter]);

  const loadDonations = async () => {
    try {
      const res = await api.adminGetDonations({ status: filter || undefined });
      setDonations(res.donations);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleConfirm = async (id: string) => {
    try {
      await api.adminConfirmDonation(id);
      loadDonations();
    } catch (err: any) { alert(err.message); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Donations</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm">
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="">All</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="card animate-pulse h-12" />)}</div>
      ) : (
        <div className="space-y-3">
          {donations.map((d) => (
            <div key={d.id} className="card flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-accent-600 dark:text-accent-400">₦{parseFloat(d.amount).toLocaleString()}</p>
                  <p className={`text-xs px-2 py-0.5 rounded-full ${
                    d.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>{d.status}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{d.donor_name || 'Anonymous'}</p>
                  <p className="text-xs text-gray-500">{d.method === 'paystack' ? 'Paystack' : 'Bank Transfer'}</p>
                  <p className="text-xs text-gray-400">{new Date(d.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {d.status === 'pending' && d.method === 'bank_transfer' && (
                  <button onClick={() => handleConfirm(d.id)} className="btn-accent text-sm flex items-center gap-1">
                    <Check className="w-4 h-4" /> Confirm
                  </button>
                )}
                {d.paystack_reference && (
                  <span className="text-xs text-gray-400">Ref: {d.paystack_reference.slice(0, 8)}...</span>
                )}
              </div>
            </div>
          ))}
          {donations.length === 0 && <div className="card text-center py-8 text-gray-500">No donations found</div>}
        </div>
      )}
    </div>
  );
}