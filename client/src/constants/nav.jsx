import { LayoutDashboard, PieChart, TrendingUp, ArrowUpRight, ArrowDownLeft, Settings, MessageSquare } from 'lucide-react';

export const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
  { icon: PieChart, label: 'Portfolio', path: '/dashboard/portfolio' },
  { icon: TrendingUp, label: 'Invest Plans', path: '/dashboard/plans' },
  { icon: ArrowUpRight, label: 'Deposit', path: '/dashboard/deposit' },
  { icon: ArrowDownLeft, label: 'Withdraw', path: '/dashboard/withdraw' },
  { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
  { icon: MessageSquare, label: 'Support', path: '/dashboard/support' },
];

export const ADMIN_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: ArrowUpRight, label: 'Deposits', path: '/admin/deposits' },
  { icon: ArrowDownLeft, label: 'Withdrawals', path: '/admin/withdrawals' },
];
