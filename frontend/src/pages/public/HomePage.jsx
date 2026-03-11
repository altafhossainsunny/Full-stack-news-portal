import React from "react";
import { useQuery } from "react-query";
import publicService from "../../services/publicService";
import BreakingNewsTicker from "../../components/public/BreakingNewsTicker";
import LiveNowSection from "../../components/public/LiveNowSection";
import HeroSection from "../../components/public/HeroSection";
import TopStories from "../../components/public/TopStories";
import LatestNewsFeed from "../../components/public/LatestNewsFeed";
import NewsletterSignup from "../../components/public/NewsletterSignup";
import SponsoredSection, { AdBanner } from "../../components/public/SponsoredSection";

export default function HomePage() {
  const { data, isLoading, isError } = useQuery("homepage", publicService.homepage, {
    refetchInterval: 30000,   // re-poll every 30 s so un-featuring reflects automatically
    refetchOnWindowFocus: true,
  });
  const page = data?.data?.data;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#e94560] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-500 text-sm">Failed to load homepage. Please try again.</p>
      </div>
    );
  }

  const heroArticles = page?.hero || [];
  const topStories = page?.top_stories || [];
  const latest = page?.latest || [];
  const breaking = page?.breaking || [];
  const trending = page?.trending || [];
  const liveStream = page?.live_stream;
  const ads = page?.ads || [];

  return (
    <div>
      <BreakingNewsTicker articles={breaking} />
      <LiveNowSection stream={liveStream} />
      <HeroSection articles={heroArticles} />
      <AdBanner ads={ads} placement="header_banner" />
      <TopStories stories={topStories} />
      <SponsoredSection ads={ads} />
      <LatestNewsFeed news={latest} trending={trending} ads={ads} />
      <AdBanner ads={ads} placement="footer_banner" />
      <NewsletterSignup />
    </div>
  );
}

