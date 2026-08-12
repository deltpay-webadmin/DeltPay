import React from 'react';
import { ArrowLeft, Building2 } from 'lucide-react';
import { useAppNavigate } from '../NavigationContext';

/** Residual detail is intentionally live-data-only. */
export function MerchantResidualDetail() {
  const { navigate } = useAppNavigate();

  return (
    <div className="h-full overflow-y-auto bg-canvas">
      <div className="max-w-[1440px] mx-auto px-6 py-6">
        <button
          onClick={() => navigate('/residuals')}
          className="inline-flex items-center gap-1.5 text-sm text-brand hover:text-brand-hover font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Residuals
        </button>
        <div className="mt-6 min-h-[360px] rounded-[8px] border border-gray-200 bg-white flex flex-col items-center justify-center text-center px-6">
          <Building2 className="w-9 h-9 text-gray-300 mb-3" />
          <h1 className="text-lg font-semibold text-gray-900">Merchant not found</h1>
          <p className="mt-1 text-sm text-gray-400">This detail view will appear when the merchant is available from live CRM data.</p>
        </div>
      </div>
    </div>
  );
}
