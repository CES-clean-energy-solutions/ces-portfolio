"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { InnovationArea } from "@ces/content/data/innovation";

interface UseModalHistoryReturn {
  selectedArea: InnovationArea | null;
  openModal: (area: InnovationArea) => void;
  closeModal: () => void;
  lightboxOpen: boolean;
  openLightbox: () => void;
  closeLightbox: () => void;
}

/**
 * Manages modal + lightbox state synced with browser history via hash URLs.
 *
 * Hash format:
 *   #<service-id>           → modal open
 *   #<service-id>/lightbox  → modal + lightbox open
 *
 * Back button closes lightbox first, then modal.
 * Deep-links auto-open the correct modal on page load.
 */
export function useModalHistory(
  innovations: InnovationArea[]
): UseModalHistoryReturn {
  const [selectedArea, setSelectedArea] = useState<InnovationArea | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Guard against re-entrant history operations
  const isNavigating = useRef(false);
  // Track whether we pushed the modal hash (vs. arriving via deep-link)
  const modalHashPushed = useRef(false);
  const lightboxHashPushed = useRef(false);

  // Resolve a hash string to an InnovationArea
  const findAreaByHash = useCallback(
    (hash: string): InnovationArea | null => {
      if (!hash || hash === "#") return null;
      // Strip # prefix and /lightbox suffix
      const serviceId = hash.replace(/^#/, "").replace(/\/lightbox$/, "");
      return innovations.find((a) => a.id === serviceId) ?? null;
    },
    [innovations]
  );

  // --- Open / Close callbacks ---

  const openModal = useCallback(
    (area: InnovationArea) => {
      setSelectedArea(area);
      setLightboxOpen(false);
      // Push hash entry so back button can close the modal
      history.pushState({ modal: area.id }, "", `#${area.id}`);
      modalHashPushed.current = true;
      lightboxHashPushed.current = false;
    },
    []
  );

  const closeModal = useCallback(() => {
    if (isNavigating.current) return;
    isNavigating.current = true;

    setLightboxOpen(false);
    setSelectedArea(null);

    const hash = window.location.hash.replace(/^#/, "");
    if (hash) {
      // We have a hash to clean up — go back to remove it
      // If lightbox hash is also present, we may need to go back twice
      if (lightboxHashPushed.current) {
        lightboxHashPushed.current = false;
        // Replace current lightbox hash with no-hash, then go back once for modal
        history.replaceState(null, "", window.location.pathname + window.location.search);
        modalHashPushed.current = false;
      } else if (modalHashPushed.current) {
        history.back();
        modalHashPushed.current = false;
      } else {
        // Deep-linked — replace state instead of going back (no prior entry to return to)
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    }

    // Release guard after a tick (history.back is async)
    setTimeout(() => {
      isNavigating.current = false;
    }, 50);
  }, []);

  const openLightbox = useCallback(() => {
    if (!selectedArea) return;
    setLightboxOpen(true);
    history.pushState(
      { modal: selectedArea.id, lightbox: true },
      "",
      `#${selectedArea.id}/lightbox`
    );
    lightboxHashPushed.current = true;
  }, [selectedArea]);

  const closeLightbox = useCallback(() => {
    if (isNavigating.current) return;
    isNavigating.current = true;

    setLightboxOpen(false);

    if (lightboxHashPushed.current) {
      history.back(); // Pops back to #<service-id>
      lightboxHashPushed.current = false;
    } else {
      // Lightbox wasn't pushed by us — just replace state
      if (selectedArea) {
        history.replaceState({ modal: selectedArea.id }, "", `#${selectedArea.id}`);
      }
    }

    setTimeout(() => {
      isNavigating.current = false;
    }, 50);
  }, [selectedArea]);

  // --- Popstate listener (browser back/forward) ---

  useEffect(() => {
    const handlePopState = () => {
      if (isNavigating.current) return;

      const hash = window.location.hash;
      const isLightboxHash = hash.endsWith("/lightbox");
      const area = findAreaByHash(hash);

      if (isLightboxHash && area) {
        // Back landed on lightbox hash — shouldn't normally happen, but handle it
        setSelectedArea(area);
        setLightboxOpen(true);
      } else if (area) {
        // Back landed on modal hash (e.g., popped from lightbox back to modal)
        setSelectedArea(area);
        setLightboxOpen(false);
        lightboxHashPushed.current = false;
      } else {
        // No hash or unknown hash — close everything
        setSelectedArea(null);
        setLightboxOpen(false);
        modalHashPushed.current = false;
        lightboxHashPushed.current = false;
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [findAreaByHash]);

  // --- Deep-link: parse hash on mount (FR-6) ---

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || hash === "#") return;

    const area = findAreaByHash(hash);
    if (area) {
      setSelectedArea(area);
      // Don't set modalHashPushed — we arrived via deep-link, not pushState
      modalHashPushed.current = false;

      if (hash.endsWith("/lightbox")) {
        setLightboxOpen(true);
      }
    } else {
      // Unknown hash — clear it silently (task 5.1)
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    selectedArea,
    openModal,
    closeModal,
    lightboxOpen,
    openLightbox,
    closeLightbox,
  };
}
