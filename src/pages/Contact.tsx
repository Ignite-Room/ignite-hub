import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, User, Mail, MessageSquare, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useSEO } from '@/hooks/use-seo';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function Contact() {
  useSEO({
    title: 'Contact',
    description: 'Get in touch with Ignite Room. Reach out with questions, partnership ideas, or feedback for our student tech community.',
    path: '/contact',
  });

  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send message');
      setStatus('success');
      setForm({ name: '', email: '', message: '' });
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  return (
    <div className="relative min-h-screen bg-background">
      <Navbar />

      <main className="relative z-10 w-full">
        <section className="w-full px-6 lg:px-8 pt-28 pb-20">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Header */}
              <div className="mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/15 border border-primary/30 mb-4">
                  <Mail className="w-3.5 h-3.5 text-primary" />
                  <span className="text-primary font-semibold text-xs uppercase tracking-widest">Get in Touch</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
                  Contact <span className="text-gradient">Us</span>
                </h1>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Have a question, collaboration idea, or just want to say hi? We'd love to hear from you.
                </p>
              </div>

              {/* Form card */}
              <div className="glass-card rounded-2xl border border-border/50 p-6 sm:p-8">
                {status === 'success' ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center text-center py-8 gap-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2">Message sent!</h3>
                      <p className="text-muted-foreground text-sm">
                        We've received your message and sent a confirmation to your email. We'll get back to you shortly.
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setStatus('idle')} className="mt-2">
                      Send another message
                    </Button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name */}
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block font-medium">Your Name</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                        <input
                          type="text"
                          required
                          placeholder="Alex Morgan"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-border/50 bg-secondary/30 text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block font-medium">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                        <input
                          type="email"
                          required
                          placeholder="you@example.com"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-border/50 bg-secondary/30 text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                        />
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block font-medium">Message</label>
                      <div className="relative">
                        <MessageSquare className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground/60" />
                        <textarea
                          required
                          rows={5}
                          placeholder="What's on your mind?"
                          value={form.message}
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-border/50 bg-secondary/30 text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all resize-none"
                        />
                      </div>
                    </div>

                    {/* Error */}
                    {status === 'error' && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2.5 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive"
                      >
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {errorMsg}
                      </motion.div>
                    )}

                    {/* Submit */}
                    <Button
                      type="submit"
                      size="lg"
                      disabled={status === 'loading'}
                      className="w-full gap-2 bg-primary hover:bg-primary/90"
                    >
                      {status === 'loading' ? (
                        <><Loader2 className="w-4 h-4 animate-spin" />Sending…</>
                      ) : (
                        <><Send className="w-4 h-4" />Send Message</>
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      We'll reply to your email within 24 hours. You can also reach us at{' '}
                      <a href="mailto:admin@igniteroom.in" className="text-primary hover:underline">admin@igniteroom.in</a>
                    </p>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
