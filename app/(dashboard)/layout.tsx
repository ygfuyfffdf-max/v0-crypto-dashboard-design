// CHRONOS INFINITY - Dashboard Layout
// Nested layout wrapping all dashboard routes with AppShell (sidebar + header)

"use client"

import { AppShell } from "@/app/_components/chronos-2026/layout/AppShell"
import type { ReactNode } from "react"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>
}
