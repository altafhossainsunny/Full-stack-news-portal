import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/formatDate';
import { imgUrl } from '../../utils/imageUrl';

export default function HeroSection({ articles }) {
  const list = Array.isArray(articles) ? articles.filter(Boolean) : [];
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent(i => (i + 1) % list.length);
  }, [list.length]);

  // Reset index if list shrinks (e.g. an article gets un-featured)
  useEffect(() => {
    if (list.length > 0 && current >= list.length) {
      setCurrent(0);
    }
  }, [list.length, current]);

  // Auto-advance every 5 seconds when multiple slides
  useEffect(() => {
    if (list.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, list.length]);

  if (list.length === 0) return null;

  const article = list[current];

  return (
    <section className="relative h-[480px] md:h-[580px] overflow-hidden">
      {/* Slides — cross-fade */}
      {list.map((a, i) => (
        <div
          key={a.id || a._id || i}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
        >
          {a.featured_image ? (
            <img src={imgUrl(a.featured_image)} alt={a.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-800" />
          )}
        </div>
      ))}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" style={{ zIndex: 2 }} />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10" style={{ zIndex: 3 }}>
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <span className="inline-block bg-[#e94560] text-white text-xs px-4 py-1 mb-4 uppercase tracking-wider">
              Featured Story
            </span>
            <h2 className="text-white text-3xl md:text-5xl font-serif leading-tight mb-4">
              <Link to={`/articles/${article.slug}`} className="hover:text-gray-200 transition-colors">
                {article.title}
              </Link>
            </h2>
            {article.summary && (
              <p className="text-gray-200 text-sm md:text-lg mb-6 line-clamp-2 max-w-2xl">
                {article.summary}
              </p>
            )}
            <div className="flex items-center gap-4 flex-wrap">
              <Link
                to={`/articles/${article.slug}`}
                className="bg-[#e94560] text-white text-sm px-7 py-2.5 uppercase tracking-wide hover:opacity-90 transition-opacity rounded-sm"
              >
                Read More
              </Link>
              {article.publish_date && (
                <span className="text-gray-300 text-sm">{formatDate(article.publish_date)}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dot indicators (only when multiple slides) */}
      {list.length > 1 && (
        <div className="absolute bottom-5 right-6 md:right-10 flex gap-2 items-center" style={{ zIndex: 4 }}>
          {list.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? 'bg-[#e94560] w-6 h-2.5'
                  : 'bg-white/50 hover:bg-white/80 w-2.5 h-2.5'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Prev / Next arrows (only when multiple slides) */}
      {list.length > 1 && (
        <>
          <button
            onClick={() => setCurrent(i => (i - 1 + list.length) % list.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors"
            style={{ zIndex: 4 }}
            aria-label="Previous slide"
          >
            ‹
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors"
            style={{ zIndex: 4 }}
            aria-label="Next slide"
          >
            ›
          </button>
        </>
      )}
    </section>
  );
}

