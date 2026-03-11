import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#1a1a2e] text-gray-300 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="font-serif text-white mb-3">
              <span className="text-2xl">Bangladesh </span>
              <span className="text-2xl text-[#e94560]">Global</span>
              <div className="text-xs uppercase tracking-[0.2em] text-gray-500 font-sans font-light mt-0.5">Newspaper</div>
            </div>
            <p className="text-gray-400 text-sm mb-4 leading-relaxed">
              Your trusted source for breaking news, in-depth analysis, and stories from Bangladesh and around the world.
            </p>
            <div className="flex gap-3">
              <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-blue-500 transition-colors"><Facebook size={17} /></a>
              <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-blue-400 transition-colors"><Twitter size={17} /></a>
              <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-pink-500 transition-colors"><Instagram size={17} /></a>
              <a href="#" aria-label="YouTube" className="text-gray-400 hover:text-red-500 transition-colors"><Youtube size={17} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-[#e94560] transition-colors">Home</Link></li>
              <li><Link to="/about" className="hover:text-[#e94560] transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-[#e94560] transition-colors">Contact</Link></li>
              <li><Link to="/live" className="hover:text-[#e94560] transition-colors">Live Coverage</Link></li>
              <li><a href="#" className="hover:text-[#e94560] transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[#e94560] transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-4">Categories</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/category/bangladesh" className="hover:text-[#e94560] transition-colors">Bangladesh</Link></li>
              <li><Link to="/category/world" className="hover:text-[#e94560] transition-colors">World</Link></li>
              <li><Link to="/category/politics" className="hover:text-[#e94560] transition-colors">Politics</Link></li>
              <li><Link to="/category/business" className="hover:text-[#e94560] transition-colors">Business</Link></li>
              <li><Link to="/category/sports" className="hover:text-[#e94560] transition-colors">Sports</Link></li>
              <li><Link to="/category/entertainment" className="hover:text-[#e94560] transition-colors">Entertainment</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-4">Newsletter</h4>
            <p className="text-gray-400 text-sm mb-3">Get daily news updates delivered to your inbox.</p>
            {subscribed ? (
              <p className="text-green-400 text-sm">✓ You're subscribed!</p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  className="px-3 py-2 rounded text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#e94560]"
                />
                <button
                  type="submit"
                  className="bg-[#e94560] text-white text-sm py-2 rounded hover:opacity-90 transition-opacity"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="border-t border-gray-700/50 pt-6 text-center text-gray-500 text-xs">
          <p>&copy; {new Date().getFullYear()} Bangladesh Global Newspaper. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

