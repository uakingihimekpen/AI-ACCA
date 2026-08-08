'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Trophy, Repeat, Heart, Star, FileText, Shield } from 'lucide-react';

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/accumulators', label: 'Accumulators', icon: Trophy },
  { href: '/admin/rollovers', label: 'Rollovers', icon: Repeat },
  { href: '/admin/donations', label: 'Donations', icon: Heart },
  { href: '/admin/analytics', label: 'Analytics', icon: FileText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="card">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Admin Access</h1>
          <p className="text-gray-500 dark:text-gray-400">Please sign in to access the admin panel.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="card">
          <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
          <p className="text-gray-500 dark:text-gray-400">You do not have admin privileges.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-56 flex-shrink-0">
        <div className="card p-3 space-y-1 sticky top-20">
          {adminLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${isActive ? 'nav-link-active' : 'nav-link-inactive'}`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden flex gap-2 overflow-x-auto pb-2">
        {adminLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link flex-shrink-0 ${isActive ? 'nav-link-active' : 'nav-link-inactive'}`}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}