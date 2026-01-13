/**
 * NotFoundModal Component
 * Reusable modal for "not found" scenarios with option to create new
 */

import React from 'react';
import { AlertCircle, Plus, X } from 'lucide-react';

interface NotFoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  searchValue: string;
  entityName: string;
  fieldLabel: string;
}

export const NotFoundModal: React.FC<NotFoundModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  searchValue,
  entityName,
  fieldLabel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 animate-scale-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Fechar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6 text-amber-600" />
        </div>

        {/* Content */}
        <h3 id="modal-title" className="text-lg font-semibold text-gray-900 text-center mb-2">
          {title}
        </h3>

        <p className="text-gray-600 text-center mb-6">
          {entityName} com {fieldLabel}{' '}
          <span className="font-semibold text-gray-900">{searchValue}</span>{' '}
          não foi encontrado(a) no sistema.
        </p>

        <p className="text-sm text-gray-500 text-center mb-6">
          Deseja cadastrar um novo registro com esse {fieldLabel.toLowerCase()}?
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-xl hover:from-cyan-600 hover:to-teal-700 transition-all font-medium flex items-center justify-center gap-2"
            autoFocus
          >
            <Plus className="w-4 h-4" />
            Cadastrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundModal;
