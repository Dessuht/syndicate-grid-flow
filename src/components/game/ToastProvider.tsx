"use client";

import { Toaster } from 'react-hot-toast';

export const ToastProvider = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: 'hsl(222 47% 8%)',
          color: 'hsl(210 40% 92%)',
          border: '1px solid hsl(240 20% 20%)',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '14px',
        },
        success: {
          iconTheme: {
            primary: 'hsl(142 80% 50%)',
            secondary: 'hsl(222 47% 8%)',
          },
          style: {
            borderColor: 'hsl(142 80% 50% / 0.5)',
          },
        },
        error: {
          iconTheme: {
            primary: 'hsl(0 90% 55%)',
            secondary: 'hsl(222 47% 8%)',
          },
          style: {
            borderColor: 'hsl(0 90% 55% / 0.5)',
          },
        },
      }}
    />
  );
};