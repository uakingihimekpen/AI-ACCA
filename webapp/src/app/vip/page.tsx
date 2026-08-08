'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Crown, Check, Lock, Sparkles, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const VIP_BENEFITS = [
  '20 Odds accumulator daily',
  'All rollover programs (7-day & 15-day)',
  'Ad-free experience',
  'Early access to predictions',
  'Private VIP channel access',
];

export default function VipPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<any>({});
  const [vipStatus, setVipStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string>('monthly');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [plansRes, statusRes] = await Promise.all([
        api.getVipPlans().catch(() => ({ plans: {} })),
        user ? api.getVipStatus().catch(() => null) : Promise.resolve(null),
      ]);
      setPlans(plansRes.plans);
      setVipStatus(statusRes);
    } catch (err) {
      console.error('Failed to load VIP data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!user) return;
    setProcessing(true);
    try {
      const res = await api.initializeVipPayment(selectedPlan);
      // In production, redirect to Paystack checkout
      alert(`Payment of ₦${res.amount.toLocaleString()} initiated. In production, you'd be redirected to Paystack.`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const planKeys = Object.keys(plans);
  const planLabels: Record<string, string> = { weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly' };
  const planDiscounts: Record<string, string> = { yearly: 'Save 33%' };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-vip-100 dark:bg-vip-900/30 rounded-2xl mb-4">
          <Crown className="w-8 h-8 text-vip-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Go VIP</h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
          Unlock premium features, exclusive accumulators, and an ad-free experience.
        </p>
        {vipStatus?.is_vip && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-vip-100 dark:bg-vip-900/30 rounded-full">
            <Crown className="w-4 h-4 text-vip-500" />
            <span className="text-sm font-medium text-vip-700 dark:text-vip-300">
              VIP Active - {vipStatus.daysLeft} days remaining
            </span>
          </div>
        )}
      </div>

      {/* Benefits */}
      <div className="card">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-vip-500" />
          What you get
        </h2>
        <div className="grid gap-3">
          {VIP_BENEFITS.map((benefit, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center flex-shrink-0">
                <Check className="w-3.5 h-3.5 text-accent-600" />
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300">{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Plans */}
      {!vipStatus?.is_vip && (
        <div className="grid gap-4 md:grid-cols-3">
          {planKeys.map((key) => {
            const plan = plans[key];
            const isPopular = key === 'monthly';
            const isSelected = selectedPlan === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedPlan(key)}
                className={`card text-left transition-all duration-200 ${
                  isSelected
                    ? 'ring-2 ring-vip-500 shadow-lg'
                    : 'hover:border-vip-300'
                } ${isPopular ? 'relative' : ''}`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-vip-500 text-black text-xs font-bold rounded-full">
                    Popular
                  </div>
                )}
                <div className="text-center pt-2">
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {planLabels[key] || key}
                  </h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      ₦{plan?.price?.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {key === 'yearly' ? 'per year' : `per ${key === 'weekly' ? 'week' : 'month'}`}
                  </p>
                  {planDiscounts[key] && (
                    <p className="text-xs font-medium text-accent-600 dark:text-accent-400 mt-1">
                      {planDiscounts[key]}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* CTA */}
      {user ? (
        !vipStatus?.is_vip && (
          <button
            onClick={handleSubscribe}
            disabled={processing}
            className="w-full btn-vip py-4 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? 'Processing...' : `Subscribe - ₦${(plans[selectedPlan]?.price || 0).toLocaleString()}`}
          </button>
        )
      ) : (
        <div className="card text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Sign in to purchase a VIP subscription</p>
          <Link href="/" className="btn-primary inline-block">Sign In</Link>
        </div>
      )}
    </div>
  );
}