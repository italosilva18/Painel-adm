import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

/**
 * Login Page - Integrated with Real API
 *
 * Features:
 * - Real authentication via API
 * - Form validation
 * - Error handling with toast notifications
 * - Loading state management
 */
function LoginPageIntegrated() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState(
    import.meta.env.VITE_DEFAULT_EMAIL || ''
  );
  const [password, setPassword] = useState(
    import.meta.env.VITE_DEFAULT_PASSWORD || ''
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Email e senhá são obrigatórios');
      return;
    }

    try {
      await login({
        email,
        password,
      });

      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao fazer login');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 font-inter">
      <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-lg rounded-xl">
        {/* Logo */}
        <div className="text-center">
          <span className="text-4xl font-bold text-cyan-700">MARGEM</span>
          <p className="text-sm text-gray-500 mt-1">
            A verdade do seu negócio em suas mãos
          </p>
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800">
          Painel Administrativo
        </h2>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Email Input */}
          <div className="flex flex-col">
            <label htmlFor="email" className="mb-1 text-sm font-medium text-gray-600">
              E-mail
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com.br"
              disabled={isLoading}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
              required
            />
          </div>

          {/* Password Input */}
          <div className="flex flex-col">
            <label htmlFor="password" className="mb-1 text-sm font-medium text-gray-600">
              Senha
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="......"
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-3 font-bold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 transition-colors duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {/* Help Text */}
        <p className="text-xs text-gray-500 text-center">
          Use suas credenciais de administrador
        </p>
      </div>
    </div>
  );
}

export default LoginPageIntegrated;
