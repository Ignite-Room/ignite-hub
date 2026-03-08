import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Flame, Loader2, Bot, User, ChevronDown, Sparkles } from 'lucide-react';
import Bytez from 'bytez.js';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

// ─── Bytez client (browser-safe singleton) ───────────────────────────────────
const BYTEZ_API_KEY = 'fb067b435bea37480bc6763510ce2623';
// Pass `true` as third arg to enable browser mode (no Node-only deps)
const sdk = new Bytez(BYTEZ_API_KEY, false, true);
const model = sdk.model('Qwen/Qwen3-Coder-480B-A35B-Instruct');

// ─── System prompt ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are the official AI assistant for the Ignite Room Campus Ambassador Program 2026. You are helpful, enthusiastic, and knowledgeable about the program.

Key facts you know:
- The program is FREE to join — no cost at all
- Campus Ambassadors represent Ignite Room at their college
- Points system: Total Score = Verified Task Submissions + External Referrals
- Current active task: Star the "daytonaio/daytona" GitHub repository → upload screenshot proof via your unique referral link → earn +1 point per verified submission
- Each external referral (from Unstop or other platforms) also boosts the leaderboard score
- Leaderboard updates in real-time
- Winners announced after the hackathon concludes; top ambassadors contacted directly
- Prizes: exclusive Ignite Room merchandise, certificates, access to events
- Any college student in India passionate about tech can join — no prior experience needed
- Sign up at igniteroom.in/ambassador/signup
- Referral links are unique and used to track tasks
- Contact: admin@igniteroom.in
- Website: igniteroom.in

Keep responses concise, friendly, and action-oriented. Use emojis sparingly to keep it lively. If asked anything outside the Campus Ambassador Program or Ignite Room, politely redirect the user.`;

// ─── Suggested questions ──────────────────────────────────────────────────────
const SUGGESTIONS = [
    'How do I earn points?',
    'What are the prizes?',
    'How do I sign up?',
    'What is the current task?',
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function AmbassadorChatbot() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: "Hey! 👋 I'm Iggy, your Campus Ambassador AI guide. Ask me anything about the Ignite Room Ambassador Program — points, tasks, prizes, sign-up, you name it!",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [showScrollBtn, setShowScrollBtn] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // ── Auto-scroll ──────────────────────────────────────────────────────────
    const scrollToBottom = (smooth = true) => {
        messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    };

    useEffect(() => {
        if (open) {
            setTimeout(() => scrollToBottom(false), 100);
            setTimeout(() => inputRef.current?.focus(), 200);
        }
    }, [open]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleScroll = () => {
        const el = messagesContainerRef.current;
        if (!el) return;
        const fromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        setShowScrollBtn(fromBottom > 80);
    };

    // ── Send message ─────────────────────────────────────────────────────────
    const sendMessage = async (text: string) => {
        const trimmed = text.trim();
        if (!trimmed || loading) return;

        const userMsg: Message = {
            id: crypto.randomUUID(),
            role: 'user',
            content: trimmed,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        // Build conversation history for the API (exclude welcome placeholder id)
        const history = [
            ...messages.filter(m => m.id !== 'welcome').map(m => ({
                role: m.role as 'user' | 'assistant',
                content: m.content,
            })),
            { role: 'user' as const, content: trimmed },
        ];

        try {
            const result = await model.run([
                { role: 'system', content: SYSTEM_PROMPT },
                ...history,
            ]);

            const reply: string =
                result?.output?.[0]?.message?.content ||
                result?.output?.content ||
                result?.output ||
                "Sorry, I couldn't get a response. Please try again!";

            const assistantMsg: Message = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: typeof reply === 'string' ? reply : JSON.stringify(reply),
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, assistantMsg]);
        } catch (err) {
            console.error('[Chatbot] Bytez error:', err);
            const errMsg: Message = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: '⚡ Oops! Something went wrong on my end. Please try again in a moment.',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errMsg]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    };

    const formatTime = (d: Date) =>
        d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
            {/* ── Chat window ───────────────────────────────────────────── */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        key="chat-window"
                        initial={{ opacity: 0, scale: 0.92, y: 20, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 20 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        className="w-[360px] sm:w-[400px] h-[560px] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-border/60"
                        style={{
                            background: 'linear-gradient(180deg, hsl(345 20% 7%) 0%, hsl(0 0% 4%) 100%)',
                            boxShadow: '0 25px 50px rgba(0,0,0,0.6), 0 0 40px hsl(345 100% 59% / 0.12)',
                        }}
                    >
                        {/* Header */}
                        <div
                            className="flex items-center gap-3 px-4 py-3 border-b border-border/40 flex-shrink-0"
                            style={{
                                background: 'linear-gradient(90deg, hsl(345 40% 10%) 0%, hsl(345 30% 8%) 100%)',
                            }}
                        >
                            <div className="relative">
                                <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                                    <Flame className="w-5 h-5 text-primary" />
                                </div>
                                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-foreground text-sm leading-tight">Iggy — Ambassador AI</p>
                                <p className="text-xs text-green-400 leading-tight">Online · Powered by Qwen3</p>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-[10px] text-muted-foreground bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5 font-medium flex items-center gap-1">
                                    <Sparkles className="w-2.5 h-2.5" /> AI
                                </span>
                                <button
                                    onClick={() => setOpen(false)}
                                    className="w-7 h-7 rounded-lg hover:bg-secondary/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors ml-1"
                                    aria-label="Close chat"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div
                            ref={messagesContainerRef}
                            onScroll={handleScroll}
                            className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin"
                            style={{ scrollbarColor: 'hsl(345 100% 59% / 0.2) transparent' }}
                        >
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {msg.role === 'assistant' && (
                                        <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <Bot className="w-3.5 h-3.5 text-primary" />
                                        </div>
                                    )}
                                    <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                                        <div
                                            className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${msg.role === 'user'
                                                ? 'bg-primary text-white rounded-br-sm'
                                                : 'bg-secondary/60 border border-border/40 text-foreground rounded-bl-sm'
                                                }`}
                                        >
                                            {msg.content}
                                        </div>
                                        <span className="text-[10px] text-muted-foreground/60 px-1">
                                            {formatTime(msg.timestamp)}
                                        </span>
                                    </div>
                                    {msg.role === 'user' && (
                                        <div className="w-7 h-7 rounded-lg bg-secondary/80 border border-border/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <User className="w-3.5 h-3.5 text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Loading bubble */}
                            {loading && (
                                <div className="flex gap-2 justify-start">
                                    <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Bot className="w-3.5 h-3.5 text-primary" />
                                    </div>
                                    <div className="px-3.5 py-3 rounded-2xl rounded-bl-sm bg-secondary/60 border border-border/40">
                                        <div className="flex gap-1 items-center">
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Scroll-to-bottom button */}
                        <AnimatePresence>
                            {showScrollBtn && (
                                <motion.button
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 5 }}
                                    onClick={() => scrollToBottom()}
                                    className="absolute bottom-[100px] right-5 w-7 h-7 rounded-full bg-primary/90 text-white flex items-center justify-center shadow-lg"
                                    aria-label="Scroll to bottom"
                                >
                                    <ChevronDown className="w-4 h-4" />
                                </motion.button>
                            )}
                        </AnimatePresence>

                        {/* Suggestion chips */}
                        {messages.length <= 2 && !loading && (
                            <div className="px-4 pb-2 flex gap-2 flex-wrap flex-shrink-0">
                                {SUGGESTIONS.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => sendMessage(s)}
                                        className="text-xs px-3 py-1.5 rounded-full border border-primary/30 bg-primary/8 text-primary hover:bg-primary/15 transition-colors"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input */}
                        <div className="px-4 pb-4 pt-2 flex-shrink-0 border-t border-border/30 mt-auto">
                            <div className="flex items-center gap-2 bg-secondary/40 border border-border/50 rounded-xl px-3 py-2 focus-within:border-primary/50 transition-colors">
                                <input
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask about the ambassador program…"
                                    disabled={loading}
                                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none disabled:opacity-50"
                                />
                                <button
                                    onClick={() => sendMessage(input)}
                                    disabled={!input.trim() || loading}
                                    className="w-8 h-8 rounded-lg bg-primary hover:bg-primary/80 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all active:scale-95 flex-shrink-0"
                                    aria-label="Send message"
                                >
                                    {loading ? (
                                        <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                                    ) : (
                                        <Send className="w-3.5 h-3.5 text-white" />
                                    )}
                                </button>
                            </div>
                            <p className="text-[10px] text-muted-foreground/40 text-center mt-2">
                                Powered by Qwen3-Coder · Ignite Room
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── FAB trigger button ─────────────────────────────────────── */}
            <motion.button
                onClick={() => setOpen(v => !v)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                className="w-14 h-14 rounded-2xl bg-primary shadow-lg shadow-primary/40 flex items-center justify-center text-white relative"
                aria-label={open ? 'Close chatbot' : 'Open ambassador chatbot'}
                style={{ boxShadow: '0 8px 30px hsl(345 100% 59% / 0.45)' }}
            >
                <AnimatePresence mode="wait" initial={false}>
                    {open ? (
                        <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
                            <X className="w-6 h-6" />
                        </motion.span>
                    ) : (
                        <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}>
                            <MessageCircle className="w-6 h-6" />
                        </motion.span>
                    )}
                </AnimatePresence>

                {/* Unread dot — only show when closed */}
                {!open && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background animate-pulse" />
                )}
            </motion.button>
        </div>
    );
}
