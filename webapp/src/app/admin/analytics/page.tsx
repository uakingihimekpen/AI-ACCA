'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.adminGetAnalytics()
      .then(setAnalytics)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="card animate-pulse h-96" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Users</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Total Users</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.users?.total || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">VIP Users</span>
              <span className="text-2xl font-bold text-vip-500">{analytics?.users?.vip || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Conversion Rate</span>
              <span className="text-lg font-bold text-accent-600">{analytics?.users?.vipConversionRate || '0%'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Daily Active</span>
              <span className="text-lg font-bold text-primary-600">{analytics?.dailyActiveUsers || 0}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Content</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Accumulators</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.accumulators?.total || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Donations</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.donations?.total || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Donation Total</span>
              <span className="text-lg font-bold text-accent-600">
                ₦{(analytics?.donations?.totalAmount || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Ratings</span>
              <span className="text-lg font-bold text-yellow-600">{analytics?.ratings?.total || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}