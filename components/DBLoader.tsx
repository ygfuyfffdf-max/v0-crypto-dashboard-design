"use client"

import { useEffect } from "react"
import { useAppStore } from "@/lib/store/useAppStore"

export function DBLoader() {
  const loadFromDB = useAppStore((s) => s.loadFromDB)
  const dbLoaded = useAppStore((s) => s.dbLoaded)

  useEffect(() => {
    if (!dbLoaded) {
      loadFromDB()
    }
  }, [dbLoaded, loadFromDB])

  return null
}
