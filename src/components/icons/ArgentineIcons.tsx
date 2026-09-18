import React from 'react';

// Sol de Mayo (Minimalista)
export const SunOfMayIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 512 512" className={className} xmlns="http://www.w3.org/2000/svg">
    <path fill="currentColor" d="M256 341.333c-47.042 0-85.333-38.292-85.333-85.333s38.292-85.333 85.333-85.333 85.333 38.292 85.333 85.333-38.292 85.333-85.333 85.333zm0-149.333c-35.292 0-64 28.708-64 64s28.708 64 64 64 64-28.708 64-64-28.708-64-64-64z"/>
    <path fill="currentColor" d="M256 0l21.333 85.333L256 106.667l-21.333-21.334L256 0zm181.01 74.98l-45.24 78.366-15.086-15.086 15.085-30.17L437.01 74.98zm-362.02 0l45.24 78.366 15.086-15.086-15.085-30.17L74.99 74.98zm437.01 181.02l-85.333 21.333-21.333-21.333 21.333-21.333L512 256zM0 256l85.333-21.333 21.333 21.333-21.333 21.333L0 256zm74.99 181.02l78.366-45.24-15.086-15.086-30.17 15.085-33.11 45.241zm362.02 0l-78.366-45.24 15.086-15.086 30.17 15.085 33.11 45.241zM256 512l-21.333-85.333L256 405.333l21.333 21.334L256 512z"/>
  </svg>
);

// Bandera Argentina (Icono cuadrado minimalista)
export const ArgentinaFlagIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="12" width="56" height="40" rx="4" fill="#74ACDF"/>
    <rect x="4" y="26" width="56" height="12" fill="#FFFFFF"/>
    <circle cx="32" cy="32" r="3" fill="#FFB81C"/>
  </svg>
);

// Dedos en V (Icono estilizado de militancia)
export const VSignIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    {/* Pulgar doblado */}
    <path d="M8 14l-4-4a2.828 2.828 0 0 1 4-4l2 2" />
    {/* Dedo Medio (V) */}
    <path d="M12 12V3.5a1.5 1.5 0 0 1 3 0V11" />
    {/* Dedo Índice (V) */}
    <path d="M15 11V2.5a1.5 1.5 0 0 1 3 0V14" />
    {/* Anular y Meñique doblados */}
    <path d="M18 14v1a2 2 0 0 1-2 2h-4a5 5 0 0 1-5-5V9" />
  </svg>
);
