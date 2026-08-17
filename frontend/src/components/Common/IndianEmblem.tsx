import React from 'react';

interface IndianEmblemProps {
  className?: string;
  size?: number;
  color?: string;
}

export const IndianEmblem: React.FC<IndianEmblemProps> = ({ 
  className = "w-8 h-8", 
  color = "currentColor" 
}) => {
  return (
    <svg 
      viewBox="0 0 200 240" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="silverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="50%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
        <linearGradient id="orangeAccent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff7824" />
          <stop offset="100%" stopColor="#e65100" />
        </linearGradient>
      </defs>

      {/* State Emblem of India (Silver & Orange Metallic Ashoka Capital Vector) */}
      <g fill={color === "currentColor" ? "url(#silverGradient)" : color}>
        {/* Top Central Lion Head & Mane */}
        <path d="M100 15 C88 15 80 25 80 38 C80 48 85 55 90 60 C85 64 82 72 82 80 C82 92 90 102 100 105 C110 102 118 92 118 80 C118 72 115 64 110 60 C115 55 120 48 120 38 C120 25 112 15 100 15 Z" opacity="0.98" />
        {/* Lion Crown & Details */}
        <circle cx="100" cy="30" r="5" fill="#0f172a" />
        <path d="M92 42 Q100 48 108 42" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M95 55 Q100 60 105 55" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
        <path d="M88 72 Q100 82 112 72" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
        
        {/* Left Profile Lion */}
        <path d="M60 40 C50 40 45 48 45 58 C45 68 52 75 58 80 C54 85 52 92 54 100 C56 108 64 114 74 115 C70 105 72 90 80 80 C75 70 72 55 60 40 Z" opacity="0.9" />
        <circle cx="52" cy="52" r="3.5" fill="#0f172a" />
        <path d="M48 62 Q55 66 60 62" stroke="#0f172a" strokeWidth="2" />

        {/* Right Profile Lion */}
        <path d="M140 40 C150 40 155 48 155 58 C155 68 148 75 142 80 C146 85 148 92 146 100 C144 108 136 114 126 115 C130 105 128 90 120 80 C125 70 128 55 140 40 Z" opacity="0.9" />
        <circle cx="148" cy="52" r="3.5" fill="#0f172a" />
        <path d="M140 62 Q145 66 152 62" stroke="#0f172a" strokeWidth="2" />

        {/* Middle Abacus Base Platform */}
        <rect x="35" y="116" width="130" height="24" rx="4" fill="url(#silverGradient)" />
        <rect x="30" y="140" width="140" height="6" rx="2" fill="#64748b" />

        {/* Ashoka Chakra (Wheel of Law) on Central Abacus with Orange Hub */}
        <circle cx="100" cy="128" r="9" stroke="#0f172a" strokeWidth="2" fill="none" />
        <circle cx="100" cy="128" r="2.5" fill="url(#orangeAccent)" />
        <path d="M100 119 V137 M91 128 H109 M94 122 L106 134 M94 134 L106 122" stroke="#0f172a" strokeWidth="1.2" />

        {/* Galloping Horse (Left Motif) */}
        <path d="M52 122 C48 120 44 124 46 128 C48 132 54 134 58 132 C56 128 54 124 52 122 Z" fill="#0f172a" />

        {/* Bull (Right Motif) */}
        <path d="M148 122 C152 120 156 124 154 128 C152 132 146 134 142 132 C144 128 146 124 148 122 Z" fill="#0f172a" />

        {/* Lotus Base Bell Platform */}
        <path d="M55 146 C55 146 65 172 100 172 C135 172 145 146 145 146 Z" fill="url(#silverGradient)" />

        {/* Bottom Pedestal Base */}
        <rect x="40" y="174" width="120" height="8" rx="2" fill="#64748b" />
        <rect x="48" y="184" width="104" height="4" rx="1" fill="#475569" />

        {/* Devanagari Motto Script: "सत्यमेव जयते" (Satyameva Jayate) in Saffron Orange */}
        <text 
          x="100" 
          y="212" 
          textAnchor="middle" 
          fontSize="17" 
          fontWeight="900" 
          fontFamily="serif, system-ui"
          letterSpacing="1"
          fill="url(#orangeAccent)"
        >
          सत्यमेव जयते
        </text>

        {/* Subtitle / English Tag */}
        <text 
          x="100" 
          y="230" 
          textAnchor="middle" 
          fontSize="9" 
          fontWeight="800" 
          fontFamily="monospace"
          letterSpacing="2"
          fill="url(#silverGradient)"
        >
          SATYAMEVA JAYATE
        </text>
      </g>
    </svg>
  );
};
