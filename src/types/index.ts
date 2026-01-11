export type User = {
  id: string
  email: string
  name?: string
  demo?: boolean
}

export type MetricSet = {
  users: number
  active: number
  revenue: number // in USD
  conversion: number // percentage 0-100
}

export type RevenuePoint = {
  ts: number
  value: number
}

export type ActivityItem = {
  id: string
  user: string
  action: string
  when: number
}

export type Client = {
  id: string
  name: string
  email?: string
  company?: string
  status?: 'active' | 'prospect' | 'inactive'
  createdAt: number
}

export type RequestItem = {
  id: string
  clientId: string
  title: string
  description?: string
  status: 'open' | 'pending' | 'done'
  assignee?: string
  createdAt: number
}

export type OrderItem = {
  id: string
  clientId: string
  amount: number
  status: 'pending' | 'completed' | 'cancelled'
  createdAt: number
}
