import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, TrendingUp } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';
import { truncateText } from '../../utils/truncateText';
import { imgUrl } from '../../utils/imageUrl';
import { AdBanner } from './SponsoredSection';

function NewsItem({ article }) {
  return (
    <article className="bg-white p-4 flex gap-4 hover:shadow-md transition-shadow">
      {article.featured_image && (
        <div className="flex-shrink-0">
          <img
            src={imgUrl(article.featured_image)}
            alt={article.title}
            className="w-28 h-28 object-cover rounded-sm"
          />
        </div>
      )}
      <div className="flex-grow min-w-0">
        {article.category_name && (
          <span className="text-[#e94560] text-xs uppercase tracking-wide font-semibold">
            {article.category_name}
          </span>
        )}
        <h3 className="text-base font-serif mt-1 mb-1.5 leading-tight hover:text-[#1a1a2e] transition-colors">
          <Link to={`/articles/${article.slug}`}>{article.title}</Link>
        </h3>
        {article.summary && (
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
            {truncateText(article.summary, 110)}
          </p>
        )}
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Clock size={12} />
          <span>{formatDate(article.publish_date)}</span>
        </div>
      </div>
    </article>
  );
}

export default function LatestNewsFeed({ news, trending, ads }) {
  return (
    <section className="bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-serif pb-3 border-b-4 border-[#1a1a2e] inline-block">
          Latest News
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* News list */}
          <div className="lg:col-span-2 space-y-4">
            {news && news.length > 0 ? (
              news.map(a => <NewsItem key={a.id} article={a} />)
            ) : (
              <p className="text-gray-400 text-sm italic">No latest news available.</p>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trending */}
            {trending && trending.length > 0 && (
              <div className="bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                  <TrendingUp className="text-[#e94560] flex-shrink-0" size={18} />
                  <h3 className="text-lg font-serif">Trending Now</h3>
                </div>
                <ol className="space-y-3">
                  {trending.slice(0, 5).map((a, i) => (
                    <li key={a.id} className="flex gap-3 group">
                      <span className="text-[#e94560] font-bold text-sm flex-shrink-0 mt-0.5">{i + 1}.</span>
                      <Link
                        to={`/articles/${a.slug}`}
                        className="text-gray-700 text-sm group-hover:text-[#1a1a2e] transition-colors leading-snug"
                      >
                        {a.title}
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Sidebar advertisement */}
            <AdBanner ads={ads} placement="sidebar_banner" />
          </div>
        </div>
      </div>
    </section>
  );
}

