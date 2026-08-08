import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ACCA Tips - Daily Sports Betting Accumulators',
  description: 'Free daily sports betting accumulators (5 & 10 odds), VIP 20-odds acca, and rollover tracking. Copy betslip codes for Bet9ja, SportyBet, and 1xBet.',
  keywords: 'betting, accumulator, acca, sports betting, bet9ja, sportybet, 1xbet, football predictions',
  applicationName: 'ACCA Tips',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ACCA Tips',
  },
};

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </main>
            <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 mt-12">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    ⚠️ Bet responsibly, 18+ only. These are predictions/opinions, not guaranteed outcomes.
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Past performance does not guarantee future results. Always gamble responsibly.
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    &copy; {new Date().getFullYear()} ACCA Tips. All rights reserved.
                  </p>
                </div>
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}