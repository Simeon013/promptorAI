'use client';

import { SignUp } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { useTheme } from 'next-themes';

export default function SignUpPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div className="flex min-h-screen items-center justify-center mesh-gradient relative overflow-hidden">
      {/* Decorative gradient orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative z-10">
        <SignUp
          appearance={{
            baseTheme: isDark ? dark : undefined,
            variables: {
              colorPrimary: '#a855f7', // purple-500
              colorText: isDark ? '#e2e8f0' : '#1e293b', // slate-200 / slate-800
              colorTextSecondary: isDark ? '#94a3b8' : '#64748b', // slate-400 / slate-500
              colorBackground: isDark ? '#0f172a' : '#ffffff', // slate-900 / white
              colorInputBackground: isDark ? '#1e293b' : '#f1f5f9', // slate-800 / slate-100
              colorInputText: isDark ? '#e2e8f0' : '#1e293b', // slate-200 / slate-800
              borderRadius: '0.75rem',
            },
            elements: {
              rootBox: 'mx-auto',
              card: isDark
                ? 'glass shadow-2xl border-2 border-slate-800/50 bg-slate-900/80'
                : 'glass shadow-2xl border-2 border-slate-200/50 bg-white/80',
              headerTitle: 'text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500',
              headerSubtitle: isDark ? 'text-slate-400' : 'text-slate-600',
              socialButtonsBlockButton: isDark
                ? 'glass border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 text-slate-200'
                : 'glass border border-slate-300/50 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 text-slate-800',
              socialButtonsBlockButtonText: isDark ? 'font-medium text-slate-200' : 'font-medium text-slate-800',
              formButtonPrimary: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 font-semibold text-white border-0',
              formFieldInput: isDark
                ? 'glass border-2 border-slate-700/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 bg-slate-800/50 text-slate-200'
                : 'glass border-2 border-slate-300/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 bg-slate-50/50 text-slate-800',
              formFieldLabel: isDark ? 'font-medium text-slate-300' : 'font-medium text-slate-700',
              footerActionLink: isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-500',
              identityPreviewText: isDark ? 'font-medium text-slate-200' : 'font-medium text-slate-800',
              identityPreviewEditButton: isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-500',
              formResendCodeLink: isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-500',
              otpCodeFieldInput: isDark
                ? 'border-2 border-slate-700/50 focus:border-purple-500 bg-slate-800/50 text-slate-200'
                : 'border-2 border-slate-300/50 focus:border-purple-500 bg-slate-50/50 text-slate-800',
              dividerLine: 'bg-gradient-to-r from-transparent via-purple-500/50 to-transparent',
              dividerText: isDark ? 'text-slate-400' : 'text-slate-600',
              formFieldInputShowPasswordButton: isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-800',
              formFieldAction: isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-500',
              footerActionText: isDark ? 'text-slate-400' : 'text-slate-600',
              footer: isDark ? 'text-slate-400' : 'text-slate-600',
            },
            layout: {
              shimmer: true,
            },
          }}
        />
      </div>
    </div>
  );
}
