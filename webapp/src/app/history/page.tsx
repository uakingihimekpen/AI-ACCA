'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import AccumulatorCard from '@/components/AccumulatorCard';
import { Filter, ChevronLeft, ChevronRight } from 'lucide-react';

export default function HistoryPage() {
  const [accumulators, setAccumulators] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ tier: '', status: '', page: 1 });

  useEffect(() => {
    loadHistory();
  }, [filter]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await api.getAccumulatorHistory({
        tier: filter.tier ? parseInt(filter.tier) : undefined,
        status: filter.status || undefined,
        page: filter.page,
      });
      setAccumulators(res.accumulators);
      setPagination(res.pagination);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Accumulator History</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filter.tier}
          onChange={(e) => setFilter({ ...filter, tier: e.target.value, page: 1 })}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="">All Tiers</option>
          <option value="5">5 Odds</option>
          <option value="10">10 Odds</option>
          <option value="20">20 Odds (VIP)</option>
        </select>
        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value, page: 1 })}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="">All Results</option>
          <option value="pending">Pending</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
          <option value="void">Void</option>
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {accumulators.map((acc) => (
            <AccumulatorCard key={acc.id} accumulator={acc} isLocked={acc.locked} />
          ))}
          {accumulators.length === 0 && (
            <div className="card text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No accumulators found</p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setFilter({ ...filter, page: filter.page - 1 })}
            disabled={filter.page <= 1}
            className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setFilter({ ...filter, page: filter.page + 1 })}
            disabled={filter.page >= pagination.totalPages}
            className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}