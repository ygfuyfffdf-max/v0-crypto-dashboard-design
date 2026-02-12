// CHRONOS INFINITY - Dashboard Layout
// Nested layout for the dashboard route group
// Note: <html>/<body> are in the root layout. Clerk auth is handled by middleware.

import type { ReactNode } from 'react';

export const metadata = {
  title: 'CHRONOS INFINITY - Dashboard',
  description: 'Panel de control avanzado con monitoreo en tiempo real',
};

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {children}
    </main>
  );
}
