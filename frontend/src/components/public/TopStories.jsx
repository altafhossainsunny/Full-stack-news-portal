import React from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';
import { truncateText } from '../../utils/truncateText';
import { imgUrl } from '../../utils/imageUrl';

function StoryCard({ article }) {
  return (
    <article className="group cursor-pointer">
      <Link to={`/articles/${article.slug}`}>
        <div className="relative overflow-hidden mb-3">
          {article.featured_image ? (
            <img
              src={imgUrl(article.featured_image)}
              alt={article.title}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-xs">No image</span>
            </div>
          )}
          {article.category_name && (
            <span className="absolute top-3 left-3 bg-[#e94560] text-white text-xs px-3 py-0.5 uppercase tracking-wide">
              {article.category_name}
            </span>
          )}
        </div>
        <h3 className="text-lg font-serif leading-tight mb-2 group-hover:text-[#e94560] transition-colors">
          {article.title}
        </h3>
      </Link>
      {article.summary && (
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
          {truncateText(article.summary, 120)}
        </p>
      )}
      <div className="flex items-center gap-1.5 text-xs text-gray-500">
        <Clock size={12} />
        <span>{formatDate(article.publish_date)}</span>
      </div>
    </article>
  );
}

export default function TopStories({ stories }) {
  if (!stories || stories.length === 0) return null;

  return (
    <section className="bg-white py-10">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-serif pb-3 border-b-4 border-[#e94560] inline-block">
          Top Stories
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {stories.slice(0, 4).map(article => (
            <StoryCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </section>
  );
}

