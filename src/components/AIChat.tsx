import { AnimatePresence, motion } from "framer-motion";
import { Bot, Send, Sparkles, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { generateAIResponse } from "../services/geminiService";
import { Message } from "../types";
import { MagneticButton } from "./MagneticButton";

export const AIChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: "Olá! Sou o assistente de IA do Mauro. Pergunte-me qualquer coisa sobre seu trabalho, habilidades ou disponibilidade.",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMsg = inputValue.trim();
    setInputValue("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setIsLoading(true);

    // Simulate typing delay for realism
    setMessages((prev) => [...prev, { role: "model", text: "", isTyping: true }]);

    const responseText = await generateAIResponse(
      messages.filter((m) => !m.isTyping).map((m) => ({ role: m.role, text: m.text })),
      userMsg,
    );

    setMessages((prev) => {
      const filtered = prev.filter((m) => !m.isTyping);
      return [...filtered, { role: "model", text: responseText }];
    });
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <div className="fixed bottom-8 right-8 z-40">
        <MagneticButton onClick={() => setIsOpen(!isOpen)}>
          <div className="relative">
            <div className="absolute -inset-[6px] rounded-full bg-gradient-to-tr from-blue-500/40 via-cyan-300/30 to-white/40 blur-lg opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 shadow-[0_0_40px_rgba(59,130,246)] flex items-center justify-center relative transition-all duration-300 hover:scale-105 hover:shadow-[0_0_60px_rgba(59,130,246)] interactive">
              <div className="absolute inset-[3px] rounded-full bg-white" />
              <div className="absolute inset-0 rounded-full border border-white/10" />
              {isOpen ? (
                <X className="w-8 h-8 text-black relative z-10" />
              ) : (
                <Bot className="w-8 h-8 text-black relative z-10" />
              )}
              {!isOpen && (
                <span className="absolute top-0 right-0 z-10 bg-green-400 rounded-full shadow-[0_0_12px_rgba(34,211,23)] text-xs text-black px-1.5 py-0.5 h-5 w-5 text-center font-bold">
                  1
                </span>
              )}
            </div>
          </div>
        </MagneticButton>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-28 right-8 w-[90vw] md:w-[400px] h-[500px] bg-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-40 flex flex-col"
          >
            {/* Chat Header */}
            <div className="p-4 border-b border-white/10 bg-background/80 backdrop-blur flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Mauro AI</h3>
                <p className="text-[10px] text-green-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400"></span> Online
                </p>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-white text-black rounded-br-none"
                        : "bg-white/10 text-white rounded-bl-none border border-white/5"
                    }`}
                  >
                    {msg.isTyping ? (
                      <div className="flex gap-1 items-center h-5 px-1">
                        <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"></span>
                      </div>
                    ) : (
                      msg.text
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10 bg-background/50">
              <div className="relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Pergunte sobre minha experiência..."
                  className="w-full bg-white/5 border border-white/10 rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-white/30 transition-colors text-white placeholder-gray-500 interactive"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !inputValue.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-white transition-colors interactive"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
