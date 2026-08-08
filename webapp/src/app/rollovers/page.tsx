'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import RolloverTracker from '@/components/RolloverTracker';
import { Repeat, Lock, Crown } from 'lucide-react';
import Link from 'next/link';

export default function RolloversPage() {
  const { user } = useAuth();
  const [activeRollovers, setActiveRollovers] = useState<any[]>([]);
  const [historyRollovers, setHistoryRollovers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [activeRes, historyRes] = await Promise.all([
        api.getActiveRollovers().catch(() => ({ rollovers: [] })),
        api.getRolloverHistory().catch(() => ({ rollovers: [] })),
      ]);
      setActiveRollovers(activeRes.rollovers);
      setHistoryRollovers(historyRes.rollovers);
    } catch (err) {
      console.error('Failed to load rollovers:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user?.is_vip) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="card">
          <Lock className="w-12 h-12 text-vip-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">VIP Content</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Rollovers are exclusive to VIP members. Upgrade your account to access 7-day and 15-day rollover programs.
          </p>
          <Link href="/vip" className="btn-vip inline-flex items-center gap-2">
            <Crown className="w-4 h-4" />
            Upgrade to VIP
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Repeat className="w-6 h-6 text-accent-500" />
          Rollover Programs
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Multi-day rollover challenges. Complete all days to win.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Active Rollovers */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Active Rollovers</h2>
            {activeRollovers.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {activeRollovers.map((ro) => (
                  <RolloverTracker key={ro.id} rollover={ro} />
                ))}
              </div>
            ) : (
              <div className="card text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No active rollovers at the moment</p>
              </div>
            )}
          </section>

          {/* Completed/Failed */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Past Rollovers</h2>
            {historyRollovers.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {historyRollovers.map((ro) => (
                  <RolloverTracker key={ro.id} rollover={ro} />
                ))}
              </div>
            ) : (
              <div className="card text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No past rollovers yet</p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}