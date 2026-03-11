import React from 'react';
import { Link } from 'react-router-dom';
import { Radio } from 'lucide-react';

export default function LiveNowSection({ stream }) {
  if (!stream) return null;

  return (
    <div className="bg-[#1a1a2e] text-white">
      <div className="max-w-7xl mx-auto px-4 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 bg-[#e94560] text-xs font-bold px-3 py-1 rounded-sm uppercase tracking-wider animate-pulse">
            <Radio size={11} />
            Live
          </span>
          <span className="text-sm font-medium truncate">{stream.title}</span>
        </div>
        <Link
          to="/live"
          className="flex-shrink-0 bg-[#e94560] text-white text-xs px-4 py-2 rounded hover:opacity-90 transition-opacity"
        >
          Watch Live →
        </Link>
      </div>
    </div>
  );
}

