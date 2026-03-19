"use client";

import { useState, useEffect, useCallback } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { X } from "lucide-react";
import type { InnovationLink } from "@ces/content/data/innovation";

interface ManualResourceModalProps {
  link: InnovationLink | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManualResourceModal({
  link,
  open,
  onOpenChange,
}: ManualResourceModalProps) {
  const [copied, setCopied] = useState(false);

  // Reset copied state when modal closes
  useEffect(() => {
    if (!open) setCopied(false);
  }, [open]);

  // Auto-dismiss ~1.5s after copy
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => onOpenChange(false), 1500);
    return () => clearTimeout(timer);
  }, [copied, onOpenChange]);

  const handleCopy = useCallback(async () => {
    if (!link || copied) return;
    try {
      await navigator.clipboard.writeText(link.href);
      setCopied(true);
    } catch {
      // Clipboard API may fail in some contexts — silently degrade
    }
  }, [link, copied]);

  if (!link) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            {/* Backdrop */}
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-[60] bg-black/60"
              />
            </Dialog.Overlay>

            {/* Content */}
            <Dialog.Content
              asChild
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="fixed inset-0 z-[60] flex items-center justify-center p-6"
                onClick={(e) => {
                  if (e.target === e.currentTarget) onOpenChange(false);
                }}
              >
                <div className="relative w-full max-w-xs rounded-xl border border-white/10 bg-neutral-950/90 p-6 shadow-2xl backdrop-blur-xl">
                  {/* Close button */}
                  <Dialog.Close asChild>
                    <button
                      className="absolute right-2 top-2 flex min-h-11 min-w-11 items-center justify-center rounded-full text-white/40 transition-colors hover:text-white"
                      aria-label="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </Dialog.Close>

                  {/* Resource icon */}
                  {link.image && (
                    <div className="mb-4 flex justify-center">
                      <div className="relative h-16 w-16 overflow-hidden rounded-lg">
                        <Image
                          src={link.image}
                          alt={link.imageAlt ?? link.label}
                          fill
                          sizes="64px"
                          className="object-contain"
                        />
                      </div>
                    </div>
                  )}

                  {/* Tool name — click to secretly copy URL */}
                  <Dialog.Title asChild>
                    <button
                      onClick={handleCopy}
                      className="w-full cursor-pointer text-center text-base font-semibold text-white transition-colors hover:text-brand-gold"
                    >
                      {link.label}
                    </button>
                  </Dialog.Title>

                  {/* Static CTA text */}
                  <p className="mt-3 w-full text-center text-sm text-white/50">
                    Coming soon — ask for early access
                  </p>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
