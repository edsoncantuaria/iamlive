"use client";

import { useEffect, useState } from "react";

/**
 * Splash do app Estou Vivo: bolhas + nome da empresa **Cloudive** (paleta teal do produto).
 * Para Next.js / web. O splash nativo Expo usa `splash-icon.png` gerado do SVG em `apps/mobile/assets/`.
 */
export function EstouVivoSplash() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backgroundColor: "#052a2c" }}
    >
      <div className="w-full max-w-[280px] px-6">
        <svg
          viewBox="0 0 280 88"
          xmlns="http://www.w3.org/2000/svg"
          className="h-auto w-full"
          aria-label="Cloudive"
          role="img"
        >
          <style>
            {`
              .ev-bubble {
                opacity: 0;
                transform: scale(0.4);
                transform-origin: center;
                transform-box: fill-box;
                animation: evFadeScale 1.2s ease-out forwards;
              }
              .ev-b2 { animation-delay: 0.15s; }
              .ev-b3 { animation-delay: 0.3s; }
              .ev-pulse {
                transform-origin: center;
                transform-box: fill-box;
                animation: evPulse 2.4s 1.4s ease-in-out infinite;
              }
              .ev-brand-text {
                opacity: 0;
                animation: evTextFade 1.2s 0.9s ease-out forwards;
              }
              @keyframes evFadeScale {
                0% { opacity: 0; transform: scale(0.4); }
                100% { opacity: 1; transform: scale(1); }
              }
              @keyframes evPulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.06); }
                100% { transform: scale(1); }
              }
              @keyframes evTextFade {
                0% { opacity: 0; transform: translateX(8px); }
                100% { opacity: 1; transform: translateX(0); }
              }
            `}
          </style>
          <g className="ev-pulse">
            <circle className="ev-bubble" cx="28" cy="42" r="18" fill="#4ECDC4" />
            <circle className="ev-bubble ev-b2" cx="52" cy="34" r="18" fill="#3dd4c8" />
            <circle className="ev-bubble ev-b3" cx="52" cy="58" r="18" fill="#dcefed" />
          </g>
          <text
            className="ev-brand-text"
            x="95"
            y="56"
            fontFamily="system-ui, -apple-system, Segoe UI, sans-serif"
            fontSize="40"
            fontWeight="600"
            fill="#F7FFF7"
            letterSpacing="1"
          >
            Cloudive
          </text>
        </svg>
      </div>
    </div>
  );
}
