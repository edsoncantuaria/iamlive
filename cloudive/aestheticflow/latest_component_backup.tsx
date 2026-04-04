"use client";

import { useEffect, useState } from "react";

export function CloudiveSplash() {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        // Keep splash visible for 2 seconds
        const timer = setTimeout(() => setVisible(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#180309]">
            {/* 
        bg-[#180309] corresponds to hsl(330, 10%, 5%) - very dark pink/black 
      */}
            <div className="w-full max-w-[280px]">
                <svg
                    viewBox="0 0 280 88"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-auto"
                >
                    <style>
                        {`
              .bubble {
                opacity: 0;
                transform: scale(0.4);
                transform-origin: center;
                transform-box: fill-box;
                animation: fadeScale 1.2s ease-out forwards;
              }

              .b2 { animation-delay: 0.15s; }
              .b3 { animation-delay: 0.3s; }

              .pulse {
                transform-origin: center;
                transform-box: fill-box;
                animation: pulse 2.4s 1.4s ease-in-out infinite;
              }

              .brand-text {
                opacity: 0;
                animation: textFade 1.2s 0.9s ease-out forwards;
              }

              @keyframes fadeScale {
                0%   { opacity: 0; transform: scale(0.4); }
                100% { opacity: 1; transform: scale(1); }
              }

              @keyframes pulse {
                0%   { transform: scale(1); }
                50%  { transform: scale(1.06); }
                100% { transform: scale(1); }
              }

              @keyframes textFade {
                0%   { opacity: 0; transform: translateX(10px); }
                100% { opacity: 1; transform: translateX(0); }
              }
            `}
                    </style>

                    {/* Group: Logo Circles */}
                    {/* Adjusted transform to center vertically in new viewBox if needed, or stick to logos.md coords */}
                    <g className="pulse" transform="translate(0, 14)">
                        {/* Coords from logos.md: (28,30), (52,22), (52,46) */}
                        <circle
                            className="bubble b1"
                            cx="28"
                            cy="30"
                            r="18"
                            fill="hsl(330, 80%, 65%)"
                        />
                        <circle
                            className="bubble b2"
                            cx="52"
                            cy="22"
                            r="18"
                            fill="hsl(330, 70%, 75%)"
                        />
                        <circle
                            className="bubble b3"
                            cx="52"
                            cy="46"
                            r="18"
                            fill="hsl(330, 40%, 90%)"
                        />
                    </g>

                    {/* Text: Side by side */}
                    <text
                        className="brand-text"
                        x="95"
                        y="60"
                        fontFamily="Inter, system-ui, -apple-system, sans-serif"
                        fontSize="40"
                        fontWeight="600"
                        fill="hsl(330, 20%, 95%)"
                        letterSpacing="1"
                    >
                        Cloudive
                    </text>
                </svg>
            </div>
        </div>
    );
}
