'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Users, Trophy, Heart, Star, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.adminGetAnalytics()
      .then(setAnalytics)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="flex items-center gap-2 text-primary-600 mb-2">
            <Users className="w-5 h-5" />
            <span className="text-sm font-medium">Total Users</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics?.users?.total || 0}</p>
          <p className="text-xs text-gray-500 mt-1">
            {analytics?.users?.vip || 0} VIP ({analytics?.users?.vipConversionRate || '0%'})
          </p>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 text-accent-600 mb-2">
            <Trophy className="w-5 h-5" />
            <span className="text-sm font-medium">Accumulators</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics?.accumulators?.total || 0}</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <Heart className="w-5 h-5" />
            <span className="text-sm font-medium">Donations</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics?.donations?.total || 0}</p>
          <p className="text-xs text-gray-500 mt-1">
            ₦{(analytics?.donations?.totalAmount || 0).toLocaleString()} total
          </p>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 text-yellow-600 mb-2">
            <Star className="w-5 h-5" />
            <span className="text-sm font-medium">Ratings</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics?.ratings?.total || 0}</p>
        </div>
      </div>

      {/* Recent Accumulators */}
      <div className="card">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Accumulators</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Date</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Tier</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Odds</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {analytics?.recentAccumulators?.map((acc: any) => (
                <tr key={acc.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-2 px-3">{new Date(acc.date).toLocaleDateString()}</td>
                  <td className="py-2 px-3">{acc.tier} Odds</td>
                  <td className="py-2 px-3 font-medium">@{acc.combined_odds}</td>
                  <td className="py-2 px-3">
                    <span className={`badge-${acc.status}`}>{acc.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}