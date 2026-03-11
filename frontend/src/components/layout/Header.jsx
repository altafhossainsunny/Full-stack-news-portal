import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, Facebook, Twitter, Instagram, Youtube, Menu, X } from 'lucide-react';
import { useQuery } from 'react-query';
import { useAuth } from '../../context/AuthContext';
import categoryService from '../../services/categoryService';

export default function Header() {
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: categories = [] } = useQuery(
    'nav-categories',
    () => categoryService.listPublic(),
    { staleTime: 30000, refetchOnWindowFocus: true }
  );

  const handleSearch = (e) => {
    e.preventDefault();
    const q = search.trim();
    if (q) {
      navigate(`/search?q=${encodeURIComponent(q)}`);
      setSearch('');
      setMenuOpen(false);
    }
  };

  // Build nav: Home → dynamic categories → 🔴 Live
  const navLinks = [
    { to: '/', label: 'Home', end: true },
    ...(Array.isArray(categories) ? categories : []).map(cat => ({
      to: `/category/${cat.slug}`,
      label: cat.name,
      end: false,
    })),
    { to: '/live', label: '🔴 Live', end: false },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      {/* Utility Bar */}
      <div className="bg-gray-100 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-1.5">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span className="hidden sm:block">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
              })}
            </span>
            <div className="flex items-center gap-4 ml-auto">
              <Link to="/about" className="hover:text-gray-900 transition-colors">About</Link>
              <Link to="/contact" className="hover:text-gray-900 transition-colors">Contact</Link>
              <div className="flex gap-2 ml-1">
                <a href="#" aria-label="Facebook" className="hover:text-blue-600 transition-colors"><Facebook size={13} /></a>
                <a href="#" aria-label="Twitter" className="hover:text-blue-400 transition-colors"><Twitter size={13} /></a>
                <a href="#" aria-label="Instagram" className="hover:text-pink-600 transition-colors"><Instagram size={13} /></a>
                <a href="#" aria-label="YouTube" className="hover:text-red-600 transition-colors"><Youtube size={13} /></a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <div className="font-serif leading-tight">
              <div className="text-2xl md:text-3xl text-gray-900">
                Bangladesh <span className="text-[#e94560]">Global</span>
              </div>
              <div className="text-xs uppercase tracking-[0.2em] text-gray-400 font-sans font-light">
                Newspaper
              </div>
            </div>
          </Link>

          {/* Search (desktop) */}
          <form onSubmit={handleSearch} className="flex-grow max-w-xl hidden md:block mx-auto">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search for news..."
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#e94560] focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#e94560] transition-colors"
              >
                <Search size={17} />
              </button>
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-3 ml-auto">
            {user ? (
              <Link
                to={`/${user.role}`}
                className="hidden sm:inline-block bg-[#1a1a2e] text-white text-xs px-4 py-2 rounded hover:bg-[#16213e] transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                to="/auth/login"
                className="hidden sm:inline-block bg-[#e94560] text-white text-xs px-4 py-2 rounded hover:opacity-90 transition-opacity"
              >
                Sign In
              </Link>
            )}
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="md:hidden p-1 text-gray-700"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Nav Bar */}
      <nav className="bg-[#1a1a2e] text-white text-sm">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="hidden md:flex gap-7 py-3 overflow-x-auto">
            {navLinks.map(link => (
              <li key={link.to} className="flex-shrink-0">
                <NavLink
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    isActive
                      ? 'text-[#e94560]'
                      : 'hover:text-[#e94560] transition-colors'
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Mobile dropdown */}
          {menuOpen && (
            <div className="md:hidden py-3 border-t border-gray-700">
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="w-full px-4 py-2 pr-10 rounded text-gray-900 text-sm focus:outline-none"
                  />
                  <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <Search size={15} />
                  </button>
                </div>
              </form>
              <ul className="flex flex-col gap-0.5">
                {navLinks.map(link => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      onClick={() => setMenuOpen(false)}
                      className="block py-2 hover:text-[#e94560] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li className="pt-3 border-t border-gray-700 mt-2">
                  {user ? (
                    <Link
                      to={`/${user.role}`}
                      onClick={() => setMenuOpen(false)}
                      className="text-[#e94560] text-sm"
                    >
                      ← Dashboard
                    </Link>
                  ) : (
                    <Link
                      to="/auth/login"
                      onClick={() => setMenuOpen(false)}
                      className="text-[#e94560] text-sm"
                    >
                      Sign In →
                    </Link>
                  )}
                </li>
              </ul>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

