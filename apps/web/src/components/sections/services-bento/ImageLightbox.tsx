"use client";

import { useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageLightboxProps {
  images: Array<{
    src: string;
    alt: string;
    caption?: string;
    animated?: boolean;
  }>;
  currentIndex: number | null;
  onClose: () => void;
  onNavigate?: (index: number) => void;
}

export function ImageLightbox({
  images,
  currentIndex,
  onClose,
  onNavigate,
}: ImageLightboxProps) {
  const open = currentIndex !== null;
  const currentImage = currentIndex !== null ? images[currentIndex] : null;
  const hasPrevious = currentIndex !== null && currentIndex > 0;
  const hasNext = currentIndex !== null && currentIndex < images.length - 1;

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && hasPrevious && onNavigate) {
        onNavigate(currentIndex! - 1);
      } else if (e.key === "ArrowRight" && hasNext && onNavigate) {
        onNavigate(currentIndex! + 1);
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, currentIndex, hasPrevious, hasNext, onNavigate, onClose]);

  if (!currentImage) return null;

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            {/* Backdrop */}
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm"
              />
            </Dialog.Overlay>

            {/* Content */}
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 sm:p-8"
                onClick={onClose}
              >
                {/* Close button */}
                <Dialog.Close asChild>
                  <button
                    className="absolute right-4 top-4 z-10 flex min-h-11 min-w-11 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
                    aria-label="Close lightbox"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </Dialog.Close>

                {/* Navigation buttons */}
                {onNavigate && hasPrevious && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate(currentIndex! - 1);
                    }}
                    className="absolute left-4 top-1/2 z-10 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                )}

                {onNavigate && hasNext && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate(currentIndex! + 1);
                    }}
                    className="absolute right-4 top-1/2 z-10 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                )}

                {/* Image container */}
                <div
                  className="relative flex max-h-full w-full max-w-7xl flex-col items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Image */}
                  <div className="flex max-h-[calc(100vh-12rem)] w-full items-center justify-center sm:max-h-[calc(100vh-16rem)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={currentImage.src}
                      alt={currentImage.alt}
                      loading="eager"
                      className="max-h-[calc(100vh-12rem)] w-auto max-w-full rounded-lg sm:max-h-[calc(100vh-16rem)]"
                    />
                  </div>

                  {/* Caption */}
                  {currentImage.caption && (
                    <Dialog.Description asChild>
                      <div className="mt-4 max-w-4xl text-center">
                        <p className="text-sm text-white/80 sm:text-base">
                          {currentImage.caption}
                        </p>
                        {onNavigate && images.length > 1 && (
                          <p className="mt-2 text-xs text-white/50">
                            {currentIndex! + 1} / {images.length}
                          </p>
                        )}
                      </div>
                    </Dialog.Description>
                  )}
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
