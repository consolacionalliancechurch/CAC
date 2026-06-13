import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

export default function PageNotFound() {
  const location = useLocation();
  const pageName = location.pathname.substring(1);
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-slate-50">
      <div className="w-full max-w-md">
        <div className="space-y-6 text-center">
          <div className="space-y-2">
            <h1 className="font-light text-7xl text-slate-300">404</h1>
            <div className="h-0.5 w-16 bg-slate-200 mx-auto"></div>
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-medium text-slate-800">Page Not Found</h2>
            <p className="leading-relaxed text-slate-600">
              The page <span className="font-medium text-slate-700">"{pageName}"</span> could not be found.
            </p>
          </div>
          {isAuthenticated && (
            <div className="p-4 mt-8 border rounded-lg bg-slate-100 border-slate-200">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                </div>
                <div className="space-y-1 text-left">
                  <p className="text-sm font-medium text-slate-700">Admin Note</p>
                  <p className="text-sm leading-relaxed text-slate-600">This page could not be found. Please check the URL or navigate from the menu.</p>
                </div>
              </div>
            </div>
          )}
          <div className="pt-6">
            <button onClick={() => window.location.href = '/'}
              className="inline-flex items-center px-4 py-2 text-sm font-medium transition-colors bg-white border rounded-lg text-slate-700 border-slate-200 hover:bg-slate-50">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Go Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}