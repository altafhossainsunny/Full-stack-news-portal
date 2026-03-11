import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import publicService from '../../services/publicService';
import toast from 'react-hot-toast';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    setLoading(true);
    try {
      await publicService.subscribe(trimmed);
      setSubscribed(true);
      setEmail('');
      toast.success('Successfully subscribed!');
    } catch (err) {
      const msg = err?.response?.data?.error || 'Subscription failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-[#1a1a2e] py-14">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <Mail className="text-[#e94560] mx-auto mb-4" size={40} />
        <h2 className="text-white text-2xl md:text-3xl font-serif mb-3">
          Stay Informed — Get Daily News Updates
        </h2>
        <p className="text-gray-400 mb-7 text-sm md:text-base">
          Breaking news, in-depth analysis, and stories from Bangladesh and the world — delivered every morning.
        </p>
        {subscribed ? (
          <p className="text-green-400 font-medium">✓ Thank you! You're now subscribed.</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-grow px-4 py-3 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#e94560]"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-[#e94560] text-white px-6 py-3 rounded-md text-sm hover:opacity-90 transition-opacity whitespace-nowrap disabled:opacity-60"
            >
              {loading ? 'Subscribing…' : 'Subscribe Now'}
            </button>
          </form>
        )}
        <p className="text-gray-600 text-xs mt-4">We respect your privacy. Unsubscribe at any time.</p>
      </div>
    </section>
  );
}

