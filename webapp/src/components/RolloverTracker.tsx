'use client';

import React from 'react';
import { Check, X, Clock, Flame, Lock } from 'lucide-react';

interface RolloverTrackerProps {
  rollover: any;
  isLocked?: boolean;
}

export default function RolloverTracker({ rollover, isLocked }: RolloverTrackerProps) {
  const days = Array.isArray(rollover.days) ? rollover.days : [];
  const passedDays = days.filter((d: any) => d.status === 'pass').length;
  const failedDays = days.filter((d: any) => d.status === 'fail').length;
  const totalDays = days.length;
  const isActive = rollover.status === 'active';
  const progress = totalDays > 0 ? (passedDays / totalDays) * 100 : 0;

  if (isLocked) {
    return (
      <div className="card relative overflow-hidden">
        <div className="absolute inset-0 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 z-10 flex items-center justify-center">
          <div className="text-center">
            <Lock className="w-8 h-8 text-vip-500 mx-auto mb-2" />
            <p className="font-semibold text-gray-900 dark:text-white">VIP Content</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Upgrade to view rollovers</p>
            <a href="/vip" className="btn-vip inline-block mt-3 text-sm">Unlock with VIP</a>
          </div>
        </div>
        <div className="opacity-30">
          <_RolloverContent rollover={rollover} days={days} passedDays={passedDays} failedDays={failedDays} totalDays={totalDays} isActive={isActive} progress={progress} />
        </div>
      </div>
    );
  }

  return (
    <div className="card animate-fade-in">
      <_RolloverContent rollover={rollover} days={days} passedDays={passedDays} failedDays={failedDays} totalDays={totalDays} isActive={isActive} progress={progress} />
    </div>
  );
}

function _RolloverContent({
  rollover, days, passedDays, failedDays, totalDays, isActive, progress,
}: {
  rollover: any; days: any[]; passedDays: number; failedDays: number; totalDays: number; isActive: boolean; progress: number;
}) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <Check className="w-4 h-4 text-green-500" />;
      case 'fail': return <X className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700';
      case 'fail': return 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700';
      default: return 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600';
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white">
            {rollover.program === '7day' ? '7-Day' : '15-Day'} Rollover
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {rollover.variant === '2odds' ? '2 Odds' : '5 Odds'} per day
          </p>
        </div>
        <div className="text-right">
          {isActive ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
              <Flame className="w-3.5 h-3.5" />
              Still Alive
            </span>
          ) : rollover.status === 'completed' ? (
            <span className="badge-won">Completed ✅</span>
          ) : (
            <span className="badge-lost">Failed ❌</span>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Started {new Date(rollover.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600 dark:text-gray-400">
            Day {passedDays + (isActive ? 1 : 0) - (failedDays > 0 ? 1 : 0)} of {totalDays}
          </span>
          <span className="font-medium text-gray-900 dark:text-white">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${failedDays > 0 ? 'bg-red-500' : 'bg-accent-500'}`}
            style={{ width: `${failedDays > 0 ? 100 : progress}%` }}
          />
        </div>
      </div>

      {/* Days Stepper */}
      <div className="space-y-2">
        {days.map((day: any) => (
          <div
            key={day.day_number}
            className={`flex items-center gap-3 p-3 rounded-lg border ${getStatusColor(day.status)}`}
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600">
              <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{day.day_number}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {day.selections && day.selections.length > 0
                  ? day.selections.map((s: any) => `${s.home_team} vs ${s.away_team}`).join(', ')
                  : 'Not yet set'}
              </p>
              {day.odds && (
                <p className="text-xs text-gray-500 dark:text-gray-400">Odds: @{day.odds}</p>
              )}
            </div>
            <div className="flex-shrink-0">
              {getStatusIcon(day.status)}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}