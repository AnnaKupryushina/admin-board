import type { MetricSet, RevenuePoint, ActivityItem } from '../types'

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export async function fetchMetrics(): Promise<MetricSet> {
  // simulate network
  await new Promise((r) => setTimeout(r, 300))
  return {
    users: randomBetween(1200, 5400),
    active: randomBetween(80, 980),
    revenue: Number((Math.random() * 12000 + 2000).toFixed(2)),
    conversion: Number((Math.random() * 5 + 1).toFixed(2)),
  }
}

export async function fetchRevenueSeries(): Promise<RevenuePoint[]> {
  await new Promise((r) => setTimeout(r, 250))
  const now = Date.now()
  const points: RevenuePoint[] = []
  for (let i = 24; i >= 0; i--) {
    points.push({ ts: now - i * 60 * 60 * 1000, value: Number((Math.random() * 2000 + 200).toFixed(2)) })
  }
  return points
}

export async function fetchActivity(): Promise<ActivityItem[]> {
  await new Promise((r) => setTimeout(r, 200))
  return Array.from({ length: 6 }).map((_, i) => ({
    id: String(i + 1),
    user: ['Alice', 'Bob', 'Clara', 'Devon', 'Eve', 'Frank'][i % 6],
    action: ['created an invoice', 'updated settings', 'invited a user', 'exported report', 'approved request', 'commented'][i % 6],
    when: Date.now() - (i * 7 + randomBetween(1, 40)) * 60 * 1000,
  }))
}

// Simple subscription API for live updates (used by widgets to show activity)
let activitySubscribers: Array<(items: ActivityItem[]) => void> = []

export function subscribeActivity(cb: (items: ActivityItem[]) => void) {
  activitySubscribers.push(cb)
  return () => {
    activitySubscribers = activitySubscribers.filter((s) => s !== cb)
  }
}

// internal: periodically push a new random activity item
setInterval(() => {
  const item = {
    id: String(Math.floor(Math.random() * 100000)),
    user: ['Maya', 'Chris', 'Jordan', 'Pat', 'Sam'][Math.floor(Math.random() * 5)],
    action: ['uploaded a file', 'created a project', 'paid invoice', 'commented'][Math.floor(Math.random() * 4)],
    when: Date.now(),
  }
  activitySubscribers.forEach((s) => s([item]))
}, 20_000)
