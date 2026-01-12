/**
 * MenuCard Component
 * Quick access menu card matching omnia-admin design
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MenuCardProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  color: 'blue' | 'purple' | 'green' | 'orange' | 'cyan' | 'indigo' | 'red' | 'amber';
  onClick?: () => void;
  badge?: string;
  disabled?: boolean;
  className?: string;
  animationDelay?: number;
}

const colorStyles = {
  blue: 'from-cyan-500 to-teal-600',
  indigo: 'from-cyan-500 to-teal-600',
  purple: 'from-violet-500 to-violet-600',
  green: 'from-emerald-500 to-emerald-600',
  orange: 'from-amber-500 to-amber-600',
  amber: 'from-amber-500 to-amber-600',
  cyan: 'from-cyan-500 to-teal-600',
  red: 'from-red-500 to-red-600',
};

export const MenuCard: React.FC<MenuCardProps> = ({
  title,
  description,
  color,
  onClick,
  disabled = false,
  className = '',
  animationDelay = 0,
}) => {
  const gradient = colorStyles[color];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        group card p-4 text-left w-full
        transition-all duration-300 hover:shadow-lg hover:-translate-y-1
        overflow-hidden relative
        focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2
        ${disabled ? 'opacity-50 cursor-not-allowed hover:translate-y-0' : ''}
        ${className}
      `}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Gradient bar at top */}
      <div className={`h-1 rounded-full mb-4 transition-all duration-300 bg-gradient-to-r ${gradient}`} />

      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{description}</p>

      {/* Hover overlay */}
      <div className={`
        absolute inset-0 opacity-0 group-hover:opacity-5
        transition-opacity duration-300
        bg-gradient-to-br ${gradient}
        pointer-events-none
      `} />
    </button>
  );
};

export default MenuCard;
