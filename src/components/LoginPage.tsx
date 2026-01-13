/**
 * Login Page Component
 * Authentication page matching omnia-admin design
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { AlertCircle, Eye, EyeOff, LogIn } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError, isAuthenticated } = useAuthStore();

  const [email, setEmail] = useState(import.meta.env.VITE_DEFAULT_EMAIL || '');
  const [password, setPassword] = useState(import.meta.env.VITE_DEFAULT_PASSWORD || '');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateLoginForm = (): boolean => {
    setValidationError(null);

    if (!email.trim()) {
      setValidationError('E-mail é obrigatório');
      return false;
    }

    if (!validateEmail(email)) {
      setValidationError('E-mail inválido');
      return false;
    }

    if (!password) {
      setValidationError('Senha é obrigatória');
      return false;
    }

    if (password.length < 4) {
      setValidationError('Senha deve ter pelo menos 4 caracteres');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateLoginForm()) {
      return;
    }

    try {
      await login({ email: email.trim(), password });
      navigate('/dashboard');
    } catch (err) {
    }
  };

  const displayError = validationError || error;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-glow">
            <span className="text-white font-bold text-4xl">M</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">MARGEM</h1>
          <p className="text-gray-500 mt-2 text-sm">Sistema Administrativo</p>
        </div>

        {/* Login Card */}
        <div className="card p-8 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Entrar na sua conta</h2>

          {/* Error Alert */}
          {displayError && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-800">{displayError}</p>
              </div>
              <button
                type="button"
                onClick={clearError}
                className="text-red-400 hover:text-red-600 text-sm font-medium"
              >
                X
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="seu@email.com"
                disabled={isLoading}
                className="input-field h-12"
                autoComplete="email"
              />
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  placeholder="********"
                  disabled={isLoading}
                  className="input-field h-12 pr-12"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 transition-all duration-200 shadow-md hover:shadow-lg text-white font-medium flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Entrar
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t">
            <p className="text-center text-xs text-gray-500">
              Esqueceu sua senha?{' '}
              <a href="#" className="text-cyan-600 hover:underline font-medium">
                Recuperar acesso
              </a>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          &copy; 2025 MARGEM. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
