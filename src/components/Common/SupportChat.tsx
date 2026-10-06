"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

type ChatMessage = {
  id: string;
  sender: "assistant" | "customer";
  text: string;
  href?: string;
  linkLabel?: string;
};

const quickQuestions = ["Delivery", "Returns", "Find my size", "Order help"];

function getAssistantReply(question: string): Omit<ChatMessage, "id" | "sender"> {
  const normalized = question.toLowerCase();

  if (/ship|deliver|arrival|how long/.test(normalized)) {
    return { text: "We offer free delivery on orders over LKR 4,500. Most orders arrive in 2–4 working days." };
  }

  if (/return|exchange|refund/.test(normalized)) {
    return { text: "We offer a 14-day hassle-free return window. Keep the item unused and in its original condition while you arrange a return." };
  }

  if (/size|fit|measurement/.test(normalized)) {
    return {
      text: "Open a product and choose “Size chart” beside the size selector to compare measurements before ordering.",
      href: "/shop-with-sidebar?category=women",
      linkLabel: "Browse clothing",
    };
  }

  if (/order|track|status/.test(normalized)) {
    return {
      text: "Sign in to your account to view your order information and account details.",
      href: "/account",
      linkLabel: "Go to my account",
    };
  }

  if (/pay|payment|checkout|card/.test(normalized)) {
    return {
      text: "Available payment options are shown during checkout. You can review your cart before continuing.",
      href: "/cart",
      linkLabel: "Review my cart",
    };
  }

  if (/accessor/.test(normalized)) {
    return { text: "Explore our accessories collection here.", href: "/shop-with-sidebar?category=accessories", linkLabel: "Shop accessories" };
  }

  if (/\bmen\b|\bmens\b/.test(normalized)) {
    return { text: "Explore the men's collection here.", href: "/shop-with-sidebar?category=men", linkLabel: "Shop men's styles" };
  }

  if (/\bwomen\b|\bwomens\b|dress/.test(normalized)) {
    return { text: "Explore the women's collection here.", href: "/shop-with-sidebar?category=women", linkLabel: "Shop women's styles" };
  }

  if (/hello|hi\b|hey/.test(normalized)) {
    return { text: "Hi! I can help with delivery, returns, sizing, orders, and checkout. What would you like to know?" };
  }

  return { text: "I can help with delivery, returns, sizing, orders, or checkout. Try one of the quick questions below." };
}

export default function SupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: "Welcome to GLEAZ! I'm your shopping assistant. Ask me about delivery, returns, sizing, or orders.",
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, isOpen]);

  const sendMessage = (rawText: string) => {
    const text = rawText.trim();
    if (!text) return;

    const timestamp = Date.now();
    const reply = getAssistantReply(text);
    setMessages((current) => [
      ...current,
      { id: `customer-${timestamp}`, sender: "customer", text },
      { id: `assistant-${timestamp}`, sender: "assistant", ...reply },
    ]);
    setDraft("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage(draft);
  };

  return (
    <div className="fixed bottom-24 right-5 z-[1000] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {isOpen && (
        <section
          id="support-chat-panel"
          aria-label="GLEAZ shopping assistant chat"
          className="flex h-[min(620px,calc(100dvh-8rem))] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-[#e7e2db] bg-white shadow-[0_20px_70px_rgba(17,17,17,0.22)]"
        >
          <header className="flex items-center justify-between bg-[#111111] px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15" aria-hidden="true">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h6m-7 8-3 1 1-4a8 8 0 1 1 3 3Z" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-semibold tracking-wide">GLEAZ Help</h2>
                <p className="mt-0.5 text-xs text-white/70">Shopping assistant · instant replies</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="flex h-9 w-9 items-center justify-center rounded-full text-2xl leading-none text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              ×
            </button>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto bg-[#faf9f7] px-4 py-5" aria-live="polite" aria-relevant="additions">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "customer" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.sender === "customer" ? "rounded-br-md bg-[#111111] text-white" : "rounded-bl-md border border-[#eee9e3] bg-white text-[#262522]"}`}>
                  <p>{message.text}</p>
                  {message.href && message.linkLabel && (
                    <Link href={message.href} onClick={() => setIsOpen(false)} className="mt-2 inline-flex font-semibold text-[#79522d] underline underline-offset-2">
                      {message.linkLabel} →
                    </Link>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-2 border-t border-[#eee9e3] bg-white px-4 py-3">
              {quickQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => sendMessage(question)}
                  className="rounded-full border border-[#ded8d0] px-3 py-1.5 text-xs font-medium text-[#33312e] transition hover:border-[#111111] hover:bg-[#f5f2ee]"
                >
                  {question}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-[#eee9e3] bg-white p-3">
            <label htmlFor="support-chat-message" className="sr-only">Type your question</label>
            <input
              id="support-chat-message"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask us anything..."
              maxLength={500}
              className="h-11 min-w-0 flex-1 rounded-full border border-[#e3ded8] px-4 text-sm text-[#111111] outline-none placeholder:text-[#96928d] focus:border-[#111111] focus:ring-1 focus:ring-[#111111]"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              aria-label="Send message"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#111111] text-white transition hover:bg-[#393939] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 3-7.2 18-3.3-7.5L3 10.2 21 3Zm0 0L10.5 13.5" />
              </svg>
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls="support-chat-panel"
        aria-label={isOpen ? "Close shopping assistant" : "Open shopping assistant"}
        className="group relative flex h-14 items-center gap-3 rounded-full bg-[#111111] px-4 text-white shadow-[0_12px_32px_rgba(17,17,17,0.28)] transition hover:-translate-y-0.5 hover:bg-[#292929]"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth="1.8" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h6m-7 8-3 1 1-4a8 8 0 1 1 3 3Z" />
        </svg>
        <span className="pr-1 text-sm font-semibold">Chat with us</span>
        <span className="absolute right-3 top-2 h-2.5 w-2.5 rounded-full border-2 border-[#111111] bg-[#68d391]" aria-hidden="true" />
      </button>
    </div>
  );
}
