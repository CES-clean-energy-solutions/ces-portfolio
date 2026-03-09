"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { ReactNode } from "react";

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string | ReactNode;
}

export function LegalModal({ isOpen, onClose, title, content }: LegalModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        {/* Backdrop */}
        <Dialog.Overlay
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          data-lenis-prevent
        />

        {/* Modal content */}
        <Dialog.Content
          className="fixed left-[50%] top-[50%] z-50 max-h-[85vh] w-[90vw] max-w-2xl translate-x-[-50%] translate-y-[-50%] overflow-y-auto rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:p-8"
          data-lenis-prevent
        >
          {/* Close button */}
          <Dialog.Close
            asChild
            className="absolute right-4 top-4 rounded-lg p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
          >
            <button aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </Dialog.Close>

          {/* Title */}
          <Dialog.Title className="mb-6 pr-8 text-2xl font-bold text-white sm:text-3xl">
            {title}
          </Dialog.Title>

          {/* Content */}
          <Dialog.Description asChild>
            <div className="prose prose-invert prose-sm max-w-none leading-relaxed text-white/80 sm:prose-base">
              {typeof content === "string" ? (
                <p className="whitespace-pre-line">{content}</p>
              ) : (
                content
              )}
            </div>
          </Dialog.Description>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
