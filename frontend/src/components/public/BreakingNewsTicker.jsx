import React from 'react';
import { Link } from 'react-router-dom';

export default function BreakingNewsTicker({ articles }) {
  if (!articles || articles.length === 0) return null;

  return (
    <div className="bg-[#e94560] text-white">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-4 overflow-hidden">
        <span className="flex-shrink-0 bg-white text-[#e94560] font-bold text-xs px-3 py-0.5 rounded-sm uppercase tracking-wider">
          Breaking
        </span>
        <div className="overflow-x-auto flex gap-5 items-center" style={{ scrollbarWidth: 'none' }}>
          {articles.map((a, i) => (
            <React.Fragment key={a.id}>
              <Link
                to={`/articles/${a.slug}`}
                className="whitespace-nowrap text-sm hover:underline flex-shrink-0"
              >
                {a.title}
              </Link>
              {i < articles.length - 1 && (
                <span className="text-red-200 flex-shrink-0 text-xs">•</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

