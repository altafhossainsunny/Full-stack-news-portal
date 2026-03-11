import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "react-query";
import publicService from "../../services/publicService";
import adService from "../../services/adService";
import { imgUrl } from "../../utils/imageUrl";

/**
 * AdBanner — displays a single ad for the given placement.
 * - Pass `ads` (pre-loaded array from homepage response), OR
 * - Pass `placement` (string) to let this component self-fetch, OR both.
 * Tracks impressions on mount and clicks on click.
 */
export function AdBanner({ ads: adsProp, placement }) {
  const { data: fetched } = useQuery(
    ["ads", placement],
    () => publicService.ads(placement),
    {
      enabled: !adsProp && !!placement,
      staleTime: 5 * 60 * 1000,
    }
  );

  const rawAds = adsProp
    ? (placement ? adsProp.filter(a => a.placement === placement) : adsProp)
    : (fetched?.data?.data || []);

  // Pick one at random (rotates on each page load)
  const [ad] = useState(() => {
    if (!rawAds.length) return null;
    return rawAds[Math.floor(Math.random() * rawAds.length)];
  });

  const trackedRef = useRef(false);
  useEffect(() => {
    if (ad?.id && !trackedRef.current) {
      trackedRef.current = true;
      adService.trackImpression(ad.id).catch(() => {});
    }
  }, [ad]);

  if (!ad) return null;

  const safeUrl = ad.target_url?.startsWith("http") ? ad.target_url : `https://${ad.target_url}`;

  const handleClick = () => {
    adService.trackClick(ad.id).catch(() => {});
    window.open(safeUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div style={{ textAlign: "center", margin: "1.25rem 0" }}>
      <p style={{
        fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "1px",
        color: "#9ca3af", marginBottom: "0.35rem",
      }}>Advertisement</p>
      <div
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === "Enter" && handleClick()}
        style={{
          display: "inline-block", cursor: "pointer",
          borderRadius: 6, overflow: "hidden",
          border: "1px solid #e5e7eb",
          maxWidth: "100%",
          transition: "opacity 0.2s",
        }}
        onMouseOver={e => e.currentTarget.style.opacity = "0.9"}
        onMouseOut={e => e.currentTarget.style.opacity = "1"}
        title={ad.title}
      >
        {ad.image_url ? (
          <img
            src={imgUrl(ad.image_url)}
            alt={ad.title}
            style={{ display: "block", maxWidth: "100%", maxHeight: 200, objectFit: "cover" }}
          />
        ) : (
          <div style={{
            background: "#f3f4f6", padding: "1.5rem 3rem",
            fontWeight: 600, color: "#374151", fontSize: "1rem",
          }}>{ad.title}</div>
        )}
      </div>
    </div>
  );
}

/**
 * SponsoredSection — a horizontal row of sidebar_banner ads.
 * Used as a section between content blocks.
 */
export default function SponsoredSection({ ads }) {
  const rawAds = (ads || []).filter(a => a.placement === "mid_section_banner");
  if (!rawAds.length) return null;

  return (
    <section style={{ padding: "1.5rem 0", borderTop: "1px solid #f3f4f6", borderBottom: "1px solid #f3f4f6", margin: "1.5rem 0" }}>
      <p style={{
        fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "1px",
        color: "#9ca3af", textAlign: "center", marginBottom: "1rem",
      }}>Sponsored</p>
      <div style={{
        display: "flex", flexWrap: "wrap", gap: "1rem",
        justifyContent: "center", alignItems: "center",
      }}>
        {rawAds.map(ad => {
          const safeUrl = ad.target_url?.startsWith("http") ? ad.target_url : `https://${ad.target_url}`;
          return (
            <a
              key={ad.id}
              href={safeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => adService.trackClick(ad.id).catch(() => {})}
              style={{ display: "inline-block", borderRadius: 6, overflow: "hidden", border: "1px solid #e5e7eb" }}
              title={ad.title}
            >
              {ad.image_url ? (
                <img src={imgUrl(ad.image_url)} alt={ad.title}
                  style={{ display: "block", height: 80, maxWidth: 320, objectFit: "cover" }} />
              ) : (
                <div style={{ background: "#f3f4f6", padding: "1rem 2rem", fontWeight: 600, color: "#374151" }}>
                  {ad.title}
                </div>
              )}
            </a>
          );
        })}
      </div>
    </section>
  );
}

