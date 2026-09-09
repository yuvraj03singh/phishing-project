import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, ShieldAlert } from 'lucide-react';
import { RiskLevel } from '../types';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, size = 'md' }) => {
  const normalized = (level || 'LOW').toUpperCase() as RiskLevel;

  const config = {
    LOW: {
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      icon: ShieldCheck,
      label: 'LOW RISK'
    },
    MEDIUM: {
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      icon: AlertTriangle,
      label: 'MEDIUM RISK'
    },
    HIGH: {
      bg: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      icon: ShieldAlert,
      label: 'HIGH RISK'
    },
    CRITICAL: {
      bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse',
      icon: AlertOctagon,
      label: 'CRITICAL RISK'
    }
  }[normalized] || {
    bg: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    icon: ShieldCheck,
    label: 'UNKNOWN'
  };

  const Icon = config.icon;
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-3 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-4 py-1.5 gap-2 font-semibold'
  }[size];

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 18
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.bg} ${sizeClasses} tracking-wide font-mono uppercase`}
    >
      <Icon size={iconSizes} />
      {config.label}
    </span>
  );
};
