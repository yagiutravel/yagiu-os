"use client";

import { useCallback, useMemo, useState } from "react";
import { Bot, Loader2, Plus, Sparkles } from "lucide-react";
import { aiCoreService } from "@/ai";
import { Button } from "@/components/ui/Button";
import { getErrorMessage } from "@/shared/utils/error";
import { AiMessageBubble, type AiChatMessage } from "./AiMessageBubble";
import { formatAiResponse } from "./format-response";

const QUICK_SUGGESTIONS = [
  "Chi deve ancora pagare?",
  "Quali documenti mancano?",
  "Quanti posti liberi ci sono?",
  "Fammi un riepilogo del Tour Himalaya.",
];

type AiConversation = {
  id: string;
  title: string;
  messages: AiChatMessage[];
  updatedAt: string;
};

function createMessage(role: AiChatMessage["role"], content: string): AiChatMessage {
  return {
    id: `msg-${crypto.randomUUID()}`,
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}

function createConversation(title = "Nuova conversazione"): AiConversation {
  const now = new Date().toISOString();
  return {
    id: `conv-${crypto.randomUUID()}`,
    title,
    messages: [],
    updatedAt: now,
  };
}

function formatTime(value: string): string {
  return new Date(value).toLocaleString("it-IT", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AiAssistantView() {
  const [conversations, setConversations] = useState<AiConversation[]>(() => [
    createConversation(),
  ]);
  const [activeId, setActiveId] = useState(() => conversations[0]?.id ?? "");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const activeConversation = useMemo(
    () => conversations.find((item) => item.id === activeId) ?? conversations[0],
    [activeId, conversations],
  );

  const updateConversation = useCallback(
    (conversationId: string, updater: (current: AiConversation) => AiConversation) => {
      setConversations((current) =>
        current.map((item) =>
          item.id === conversationId ? updater(item) : item,
        ),
      );
    },
    [],
  );

  const handleNewConversation = () => {
    const conversation = createConversation();
    setConversations((current) => [conversation, ...current]);
    setActiveId(conversation.id);
    setInput("");
  };

  const sendMessage = async (text: string) => {
    const query = text.trim();
    if (!query || !activeConversation || loading) return;

    const conversationId = activeConversation.id;
    const userMessage = createMessage("user", query);
    const title =
      activeConversation.messages.length === 0
        ? query.slice(0, 48)
        : activeConversation.title;

    updateConversation(conversationId, (current) => ({
      ...current,
      title,
      messages: [...current.messages, userMessage],
      updatedAt: new Date().toISOString(),
    }));
    setInput("");
    setLoading(true);

    try {
      const result = await aiCoreService.processRequest({
        query,
        sessionId: conversationId,
      });
      const assistantMessage = createMessage(
        "assistant",
        formatAiResponse(result),
      );

      updateConversation(conversationId, (current) => ({
        ...current,
        messages: [...current.messages, assistantMessage],
        updatedAt: new Date().toISOString(),
      }));
    } catch (error) {
      const assistantMessage = createMessage(
        "assistant",
        `Si è verificato un errore: ${getErrorMessage(error)}`,
      );
      updateConversation(conversationId, (current) => ({
        ...current,
        messages: [...current.messages, assistantMessage],
        updatedAt: new Date().toISOString(),
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void sendMessage(input);
  };

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden bg-[#f7f7f8]">
      <aside className="flex w-[280px] shrink-0 flex-col border-r border-zinc-200/80 bg-white">
        <div className="border-b border-zinc-200/80 p-4">
          <Button className="w-full" onClick={handleNewConversation}>
            <Plus className="h-4 w-4" />
            Nuova conversazione
          </Button>
        </div>
        <div className="flex-1 space-y-1 overflow-y-auto p-2">
          {conversations.map((conversation) => {
            const isActive = conversation.id === activeConversation?.id;
            const preview =
              conversation.messages[conversation.messages.length - 1]?.content ??
              "Nessun messaggio";

            return (
              <button
                key={conversation.id}
                type="button"
                onClick={() => setActiveId(conversation.id)}
                className={`w-full rounded-lg px-3 py-2.5 text-left transition-colors ${
                  isActive
                    ? "bg-violet-50 text-violet-900 ring-1 ring-inset ring-violet-600/10"
                    : "text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                <p className="truncate text-sm font-medium">{conversation.title}</p>
                <p className="mt-0.5 truncate text-xs text-zinc-500">
                  {preview.replace(/\*\*/g, "")}
                </p>
                <p className="mt-1 text-[11px] text-zinc-400">
                  {formatTime(conversation.updatedAt)}
                </p>
              </button>
            );
          })}
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
          {activeConversation?.messages.length === 0 ? (
            <div className="flex h-full min-h-[320px] flex-col items-center justify-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                <Bot className="h-6 w-6" strokeWidth={1.75} />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-zinc-900">
                Come posso aiutarti?
              </h2>
              <p className="mt-1 max-w-md text-sm text-zinc-500">
                Chiedi informazioni su clienti, tour, pagamenti, documenti o KPI
                operativi. Le risposte usano i dati del gestionale in modalità mock.
              </p>
            </div>
          ) : (
            activeConversation?.messages.map((message) => (
              <AiMessageBubble key={message.id} message={message} />
            ))
          )}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Elaborazione in corso...
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="border-t border-zinc-200/80 bg-white px-6 py-4"
        >
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Scrivi una domanda operativa..."
              disabled={loading}
              className="h-11 min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-colors focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 disabled:bg-zinc-50"
            />
            <Button type="submit" disabled={loading || !input.trim()}>
              Invia
            </Button>
          </div>
        </form>
      </section>

      <aside className="hidden w-[260px] shrink-0 flex-col border-l border-zinc-200/80 bg-white xl:flex">
        <div className="border-b border-zinc-200/80 px-4 py-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
            <Sparkles className="h-4 w-4 text-violet-600" />
            Suggerimenti rapidi
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            Domande frequenti per iniziare subito.
          </p>
        </div>
        <div className="space-y-2 overflow-y-auto p-4">
          {QUICK_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => void sendMessage(suggestion)}
              disabled={loading}
              className="w-full rounded-xl border border-zinc-200/80 px-3 py-2.5 text-left text-sm text-zinc-700 transition-colors hover:border-violet-200 hover:bg-violet-50/60 disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}
