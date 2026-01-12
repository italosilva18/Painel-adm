/**
 * Form Components
 * Modern, touch-friendly form components for mobile and desktop
 */

import React, { forwardRef, useState, useRef, useEffect } from 'react';
import { LucideIcon, ChevronDown, X, Search, Eye, EyeOff } from 'lucide-react';

// ============================================
// Input Component
// ============================================
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  hint,
  icon: Icon,
  iconPosition = 'left',
  isLoading,
  fullWidth = true,
  className = '',
  type = 'text',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          ref={ref}
          type={inputType}
          className={`
            w-full px-4 py-3 border rounded-xl bg-white
            transition-all duration-200 min-h-[48px]
            placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500
            hover:border-gray-300
            disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500
            ${Icon && iconPosition === 'left' ? 'pl-11' : ''}
            ${Icon && iconPosition === 'right' || isPassword ? 'pr-11' : ''}
            ${error ? 'border-red-300 focus:ring-red-500/50 focus:border-red-500' : 'border-gray-200'}
            ${isLoading ? 'animate-pulse' : ''}
            ${className}
          `}
          {...props}
        />
        {Icon && iconPosition === 'right' && !isPassword && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon className="w-5 h-5" />
          </div>
        )}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 -m-1 touch-target"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
          <span className="inline-block w-1 h-1 bg-red-500 rounded-full" />
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="mt-1.5 text-xs text-gray-500">{hint}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// ============================================
// Select Component
// ============================================
interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
}

interface SelectProps {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  isLoading?: boolean;
  searchable?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  hint,
  options,
  value,
  onChange,
  placeholder = 'Selecione...',
  disabled = false,
  required = false,
  isLoading = false,
  searchable = false,
  fullWidth = true,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  const filteredOptions = searchable && search
    ? options.filter(opt =>
        opt.label.toLowerCase().includes(search.toLowerCase()) ||
        opt.sublabel?.toLowerCase().includes(search.toLowerCase())
      )
    : options;

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`${fullWidth ? 'w-full' : ''}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`
            w-full px-4 py-3 border rounded-xl bg-white text-left
            transition-all duration-200 min-h-[48px]
            flex items-center justify-between gap-2
            focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500
            ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'hover:border-gray-300 cursor-pointer'}
            ${error ? 'border-red-300' : 'border-gray-200'}
            ${isLoading ? 'animate-pulse' : ''}
            ${className}
          `}
          disabled={disabled}
        >
          <span className={`truncate ${!selectedOption ? 'text-gray-400' : 'text-gray-900'}`}>
            {isLoading ? 'Carregando...' : (selectedOption?.label || placeholder)}
          </span>
          <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-hidden animate-fade-in-down">
            {/* Search */}
            {searchable && (
              <div className="p-2 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar..."
                    className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    autoFocus
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Options */}
            <div className="overflow-y-auto max-h-52 scrollbar-thin">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  Nenhum resultado encontrado
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange?.(option.value);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`
                      w-full px-4 py-3 text-left transition-colors duration-150
                      min-h-[48px] flex flex-col justify-center
                      ${value === option.value
                        ? 'bg-cyan-50 text-cyan-700'
                        : 'hover:bg-gray-50 text-gray-900'
                      }
                    `}
                  >
                    <span className="text-sm font-medium">{option.label}</span>
                    {option.sublabel && (
                      <span className="text-xs text-gray-500">{option.sublabel}</span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
          <span className="inline-block w-1 h-1 bg-red-500 rounded-full" />
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="mt-1.5 text-xs text-gray-500">{hint}</p>
      )}
    </div>
  );
};

// ============================================
// Checkbox Component
// ============================================
interface CheckboxProps {
  label: string;
  description?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  name?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  description,
  checked = false,
  onChange,
  disabled = false,
  name,
}) => {
  return (
    <label className={`
      flex items-start gap-3 cursor-pointer min-h-[48px] py-2
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    `}>
      <div className="relative flex-shrink-0 mt-0.5">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          disabled={disabled}
          className="sr-only peer"
        />
        <div className={`
          w-5 h-5 border-2 rounded-md transition-all duration-200
          peer-focus-visible:ring-2 peer-focus-visible:ring-cyan-500/50 peer-focus-visible:ring-offset-2
          ${checked
            ? 'bg-cyan-600 border-cyan-600'
            : 'bg-white border-gray-300 peer-hover:border-gray-400'
          }
        `}>
          {checked && (
            <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>
      <div className="flex-1">
        <span className="text-sm font-medium text-gray-900">{label}</span>
        {description && (
          <span className="block text-xs text-gray-500 mt-0.5">{description}</span>
        )}
      </div>
    </label>
  );
};

// ============================================
// Toggle Switch Component
// ============================================
interface ToggleProps {
  label?: string;
  labelLeft?: string;
  labelRight?: string;
  description?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Toggle: React.FC<ToggleProps> = ({
  label,
  labelLeft,
  labelRight,
  description,
  checked = false,
  onChange,
  disabled = false,
  size = 'md',
}) => {
  const sizes = {
    sm: { track: 'w-8 h-5', thumb: 'w-3 h-3', translate: 'translate-x-4' },
    md: { track: 'w-11 h-6', thumb: 'w-5 h-5', translate: 'translate-x-5' },
    lg: { track: 'w-14 h-8', thumb: 'w-6 h-6', translate: 'translate-x-7' },
  };

  const sizeConfig = sizes[size];

  return (
    <div className={`flex items-center gap-3 min-h-[48px] ${disabled ? 'opacity-50' : ''}`}>
      {label && (
        <span className="text-sm font-medium text-gray-900">{label}</span>
      )}
      {labelLeft && (
        <span className={`text-sm font-medium transition-colors ${!checked ? 'text-cyan-600' : 'text-gray-400'}`}>
          {labelLeft}
        </span>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={`
          relative inline-flex flex-shrink-0 cursor-pointer rounded-full
          border-2 border-transparent transition-colors duration-200 ease-in-out
          focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2
          ${sizeConfig.track}
          ${checked ? 'bg-cyan-600' : 'bg-gray-200'}
          ${disabled ? 'cursor-not-allowed' : ''}
        `}
      >
        <span
          className={`
            pointer-events-none inline-block rounded-full bg-white shadow-lg
            ring-0 transition duration-200 ease-in-out transform
            ${sizeConfig.thumb}
            ${checked ? sizeConfig.translate : 'translate-x-0'}
          `}
        />
      </button>
      {labelRight && (
        <span className={`text-sm font-medium transition-colors ${checked ? 'text-cyan-600' : 'text-gray-400'}`}>
          {labelRight}
        </span>
      )}
      {description && !labelLeft && !labelRight && (
        <span className="text-sm text-gray-500">{description}</span>
      )}
    </div>
  );
};

// ============================================
// Form Section Component
// ============================================
interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  columns = 1,
  className = '',
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  };

  return (
    <div className={className}>
      {(title || description) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
      )}
      <div className={`grid ${gridCols[columns]} gap-4 sm:gap-6`}>
        {children}
      </div>
    </div>
  );
};

// ============================================
// Button Component
// ============================================
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  isLoading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-cyan-500 to-teal-600 text-white shadow-md hover:shadow-lg hover:from-cyan-600 hover:to-teal-700',
    secondary: 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md hover:shadow-lg hover:from-red-600 hover:to-red-700',
    success: 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md hover:shadow-lg hover:from-green-600 hover:to-green-700',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100',
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-5 py-2.5 text-sm min-h-[44px]',
    lg: 'px-6 py-3 text-base min-h-[52px]',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-5 h-5',
  };

  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 rounded-xl font-semibold
        transition-all duration-200 active:scale-[0.98]
        focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className={`animate-spin ${iconSizes[size]}`} fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {Icon && iconPosition === 'left' && !isLoading && (
        <Icon className={iconSizes[size]} />
      )}
      {children}
      {Icon && iconPosition === 'right' && !isLoading && (
        <Icon className={iconSizes[size]} />
      )}
    </button>
  );
};
