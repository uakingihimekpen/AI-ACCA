'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Heart, Banknote, CreditCard, Check, Copy, Users } from 'lucide-react';

export default function DonatePage() {
  const [bankDetails, setBankDetails] = useState<any>(null);
  const [donors, setDonors] = useState<any[]>([]);
  const [amount, setAmount] = useState(2000);
  const [donorName, setDonorName] = useState('');
  const [showOnWall, setShowOnWall] = useState(false);
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const PRESET_AMOUNTS = [1000, 2000, 5000, 10000, 25000, 50000];

  useEffect(() => {
    api.getBankDetails().then((res) => setBankDetails(res.bankDetails)).catch(() => {});
    api.getDonationWall().then((res) => setDonors(res.donors)).catch(() => {});
  }, []);

  const handlePaystackDonation = async () => {
    try {
      const res = await api.initializeDonation({ amount, donorName, showOnWall });
      alert('Donation initiated! In production, you\'d be redirected to Paystack.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleBankTransfer = async () => {
    try {
      const res = await api.recordBankTransfer({ amount, donorName, showOnWall });
      setMessage('Bank transfer recorded. Admin will confirm upon receipt.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const copyAccountNumber = () => {
    if (bankDetails?.accountNumber) {
      navigator.clipboard.writeText(bankDetails.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl mb-4">
          <Heart className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Support ACCA Tips</h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
          ACCA Tips is free for everyone. Your support helps us maintain and improve the service.
        </p>
      </div>

      {/* Amount Selector */}
      <div className="card">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Choose Amount</h2>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {PRESET_AMOUNTS.map((preset) => (
            <button
              key={preset}
              onClick={() => setAmount(preset)}
              className={`py-3 rounded-xl font-bold text-sm transition-all ${
                amount === preset
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              ₦{preset.toLocaleString()}
            </button>
          ))}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Custom Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
            min={100}
          />
        </div>
      </div>

      {/* Donor Info */}
      <div className="card">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Your Details (Optional)</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Name</label>
            <input
              type="text"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="John D."
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showOnWall}
              onChange={(e) => setShowOnWall(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">Show my name on the donor wall</span>
          </label>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="grid gap-4 md:grid-cols-2">
        <button onClick={handlePaystackDonation} className="card text-left hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <CreditCard className="w-6 h-6 text-primary-600" />
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Pay Online</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Card, Bank Transfer, USSD</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Pay via Paystack. Instant confirmation.</p>
          <div className="mt-3 text-sm font-semibold text-primary-600">Pay ₦{amount.toLocaleString()}</div>
        </button>

        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <Banknote className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Bank Transfer</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Direct transfer</p>
            </div>
          </div>
          {bankDetails && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Bank:</span>
                <span className="font-medium text-gray-900 dark:text-white">{bankDetails.bankName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Account:</span>
                <span className="font-medium text-gray-900 dark:text-white">{bankDetails.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Name:</span>
                <span className="font-medium text-gray-900 dark:text-white">{bankDetails.accountName}</span>
              </div>
              <button
                onClick={copyAccountNumber}
                className="w-full mt-2 btn-outline text-xs flex items-center justify-center gap-1"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied!' : 'Copy Account Number'}
              </button>
            </div>
          )}
          <button onClick={handleBankTransfer} className="w-full mt-3 btn-primary text-sm">
            I've Sent It
          </button>
        </div>
      </div>

      {message && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-xl text-sm">
          {message}
        </div>
      )}

      {/* Donor Wall */}
      {donors.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Supporters</h2>
          </div>
          <div className="grid gap-2">
            {donors.map((donor, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {donor.donor_name || 'Anonymous'}
                </span>
                <span className="text-sm font-semibold text-accent-600 dark:text-accent-400">
                  ₦{parseFloat(donor.amount).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}