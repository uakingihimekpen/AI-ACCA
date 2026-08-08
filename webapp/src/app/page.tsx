'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import AccumulatorCard from '@/components/AccumulatorCard';
import RolloverTracker from '@/components/RolloverTracker';
import { Trophy, TrendingUp, Crown, Heart, Star, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { user } = useAuth();
  const [accumulators, setAccumulators] = useState<any[]>([]);
  const [rollovers, setRollovers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [ratings, setRatings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [accRes, rollRes, statsRes, ratingRes] = await Promise.all([
        api.getTodayAccumulators().catch(() => ({ accumulators: [] })),
        api.getActiveRollovers().catch(() => ({ rollovers: [] })),
        api.getAccumulatorStats().catch(() => null),
        api.getRatings().catch(() => null),
      ]);
      setAccumulators(accRes.accumulators);
      setRollovers(rollRes.rollovers);
      setStats(statsRes);
      setRatings(ratingRes);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          Today's Betting Accumulators
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          Professional daily accumulators with transparent track record. 
          Copy betslip codes directly into your betting app.
        </p>
        
        {/* Stats Banner */}
        {stats && (
          <div className="flex items-center justify-center gap-6 mt-6 flex-wrap">
            <div className="text-center">
              <p className="text-2xl font-bold text-accent-600 dark:text-accent-400">{stats.overall.winRate}</p>
              <p className="text-xs text-gray-500">Win Rate</p>
            </div>
            <div className="w-px h-10 bg-gray-300 dark:bg-gray-600" />
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{stats.overall.total}</p>
              <p className="text-xs text-gray-500">Total Accas</p>
            </div>
            <div className="w-px h-10 bg-gray-300 dark:bg-gray-600" />
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.overall.won}</p>
              <p className="text-xs text-gray-500">Won</p>
            </div>
          </div>
        )}
      </div>

      {/* Today's Accumulators */}
      <section>
        {/* Tier Tabs */}
        <div className="flex gap-2 mb-6">
          {[5, 10, 20].map((tier, idx) => {
            const acc = accumulators.find((a) => a.tier === tier);
            const isVip = tier === 20;
            const isLocked = isVip && (!user?.is_vip);
            const isActive = activeTab === idx;
            return (
              <button
                key={tier}
                onClick={() => setActiveTab(idx)}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 ${
                  isActive
                    ? tier === 20
                      ? 'bg-vip-500 text-black shadow-lg'
                      : 'bg-primary-600 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-primary-300'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  {isVip && <Crown className="w-4 h-4" />}
                  {tier} Odds
                </div>
                <div className={`text-xs mt-0.5 ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
                  {isVip ? 'VIP' : 'Free'}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Tab Content */}
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
            {accumulators.filter((a) => a.tier === [5, 10, 20][activeTab]).map((acc) => (
              <AccumulatorCard
                key={acc.id}
                accumulator={acc}
                isLocked={acc.locked}
              />
            ))}
            {accumulators.filter((a) => a.tier === [5, 10, 20][activeTab]).length === 0 && (
              <div className="card text-center py-8">
                <Trophy className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No accumulators published for today yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Check back later or visit the history page</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Active Rollover Section */}
      {rollovers.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent-500" />
              Active Rollovers
            </h2>
            <Link href="/rollovers" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {rollovers.slice(0, 2).map((rollover) => (
              <RolloverTracker
                key={rollover.id}
                rollover={rollover}
                isLocked={rollover.locked}
              />
            ))}
          </div>
        </section>
      )}

      {/* Donation Section */}
      <section className="card bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="flex items-start gap-4">
          <Heart className="w-8 h-8 flex-shrink-0 text-primary-200" />
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-1">Support This Project</h3>
            <p className="text-sm text-primary-100 mb-4">
              ACCA Tips is free for everyone. If you find value in our predictions, 
              consider supporting us to keep the service running.
            </p>
            <Link href="/donate" className="inline-flex items-center gap-1 bg-white text-primary-700 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-primary-50 transition-colors">
              Support Us
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Rating Section */}
      {ratings && (
        <section className="text-center">
          <div className="inline-flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {ratings.aggregate?.average || '0.0'}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({ratings.aggregate?.total || 0} reviews)
            </span>
          </div>
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(parseFloat(ratings.aggregate?.average || '0'))
                    ? 'text-yellow-500 fill-yellow-500'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            ))}
          </div>
          {user && (
            <Link href="/donate" className="text-sm text-primary-600 hover:text-primary-700 mt-2 inline-block">
              Rate us
            </Link>
          )}
        </section>
      )}

      {/* Responsible Gambling Notice */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 text-center">
        <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
          ⚠️ Bet responsibly, 18+ only
        </p>
        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
          These are predictions/opinions, not guaranteed outcomes. Past performance doesn't guarantee future results.
        </p>
      </div>
    </div>
  );
}