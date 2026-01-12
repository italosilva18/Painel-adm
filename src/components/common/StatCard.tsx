/**
 * StatCard Component
 * Modern stat card matching omnia-admin design
 */

import React from 'react';
import { LucideIcon, TrendingUp } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'blue' | 'purple' | 'green' | 'orange' | 'cyan' | 'indigo' | 'red' | 'amber';
  loading?: boolean;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  onClick?: () => void;
  className?: string;
  animationDelay?: number;
}

const colorStyles = {
  blue: {
    bar: 'bg-cyan-500',
    iconBg: 'bg-cyan-50',
    iconText: 'text-cyan-600',
  },
  indigo: {
    bar: 'bg-cyan-500',
    iconBg: 'bg-cyan-50',
    iconText: 'text-cyan-600',
  },
  purple: {
    bar: 'bg-violet-500',
    iconBg: 'bg-violet-50',
    iconText: 'text-violet-500',
  },
  green: {
    bar: 'bg-emerald-500',
    iconBg: 'bg-emerald-50',
    iconText: 'text-emerald-500',
  },
  orange: {
    bar: 'bg-amber-500',
    iconBg: 'bg-amber-50',
    iconText: 'text-amber-500',
  },
  amber: {
    bar: 'bg-amber-500',
    iconBg: 'bg-amber-50',
    iconText: 'text-amber-500',
  },
  cyan: {
    bar: 'bg-teal-500',
    iconBg: 'bg-teal-50',
    iconText: 'text-teal-600',
  },
  red: {
    bar: 'bg-red-500',
    iconBg: 'bg-red-50',
    iconText: 'text-red-500',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  loading = false,
  trend,
  onClick,
  className = '',
  animationDelay = 0,
}) => {
  const styles = colorStyles[color];

  return (
    <div
      onClick={onClick}
      className={`
        card p-5 relative overflow-hidden group
        hover:shadow-lg transition-all duration-300
        ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''}
        ${className}
      `}
      style={{
        animationDelay: `${animationDelay}ms`,
      }}
    >
      {/* Color bar on left */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl ${styles.bar}`} />

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-gray-500 font-medium">{title}</p>

          {loading ? (
            <div className="space-y-2 mt-2">
              <div className="skeleton h-8 w-20" />
            </div>
          ) : (
            <>
              <p className="text-3xl font-bold text-gray-900 tracking-tight">
                {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
              </p>

              {trend && (
                <div className="flex items-center gap-1 text-emerald-600">
                  <TrendingUp className="w-3 h-3" />
                  <span className="text-xs font-medium">
                    {trend.isPositive ? '+' : ''}{trend.value}%
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Icon */}
        <div className={`
          w-12 h-12 rounded-xl flex items-center justify-center
          transition-transform group-hover:scale-110
          ${styles.iconBg}
        `}>
          <Icon className={`w-6 h-6 ${styles.iconText}`} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
