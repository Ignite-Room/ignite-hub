import { motion } from 'framer-motion';
import { Mail, Bell, CheckCircle, Users, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Newsletter() {
  const benefits = [
    'Weekly curated tech news and insights',
    'Exclusive tutorials and coding tips',
    'Event announcements and community updates',
    'Job opportunities and collaborations',
    'Guest articles from industry experts',
    'Special offers and early access to resources'
  ];

  return (
    <div className="relative min-h-screen bg-background">
      <Navbar />

      <main className="relative z-10 w-full">
        {/* Hero Section */}
        <section className="w-full px-6 lg:px-8 py-20">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid lg:grid-cols-2 gap-12 items-center"
            >
              <div>
                <h1 className="text-5xl md:text-6xl font-heading font-bold text-foreground mb-6">
                  Stay Connected
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                  Subscribe to the Ignite Room Newsletter and get the latest updates,
                  exclusive content, and opportunities delivered directly to your inbox.
                </p>
                <form className="space-y-4">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-6 py-3 bg-secondary border border-border/50 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors"
                    required
                  />
                  <div className="flex items-start gap-3">
                    <input type="checkbox" id="agree" className="mt-1" />
                    <label htmlFor="agree" className="text-sm text-muted-foreground">
                      I agree to receive emails from Ignite Room about news, updates, and offers.
                    </label>
                  </div>
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold flex items-center justify-center gap-2"
                  >
                    <Bell className="w-5 h-5" />
                    Subscribe Now
                  </button>
                </form>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 rounded-lg p-8"
              >
                <Mail className="w-16 h-16 text-primary mb-6" />
                <h3 className="text-2xl font-semibold text-foreground mb-4">
                  What You'll Get
                </h3>
                <p className="text-muted-foreground">
                  Our newsletter is carefully curated to bring you the most valuable insights,
                  resources, and opportunities from the tech community and Ignite Room ecosystem.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="w-full px-6 lg:px-8 py-20">
          <div className="max-w-6xl mx-auto">
            <motion.h2
              className="text-4xl font-heading font-bold text-foreground mb-12 text-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              Newsletter Highlights
            </motion.h2>

            <div className="grid md:grid-cols-2 gap-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <p className="text-lg text-muted-foreground">{benefit}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Sample Content */}
        <section className="w-full px-6 lg:px-8 py-20">
          <div className="max-w-6xl mx-auto">
            <motion.h2
              className="text-4xl font-heading font-bold text-foreground mb-12 text-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              What Our Subscribers Say
            </motion.h2>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: 'Alex Kumar',
                  role: 'Full Stack Developer',
                  quote: 'The Ignite newsletter keeps me updated with industry trends and learning opportunities. Highly recommended!'
                },
                {
                  name: 'Sarah Chen',
                  role: 'Product Designer',
                  quote: 'Great mix of technical content and community news. Love getting the exclusive early access to events.'
                },
                {
                  name: 'Ravi Patel',
                  role: 'Student & Entrepreneur',
                  quote: 'This newsletter has been instrumental in my learning journey. The resources and opportunities are invaluable.'
                },
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  className="bg-secondary/50 border border-border/50 rounded-lg p-8"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-orange-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 italic">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="w-full px-6 lg:px-8 py-20">
          <div className="max-w-4xl mx-auto">
            <motion.h2
              className="text-4xl font-heading font-bold text-foreground mb-12 text-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              Newsletter FAQ
            </motion.h2>

            <div className="space-y-6">
              {[
                {
                  q: 'How often will I receive emails?',
                  a: 'We send our newsletter weekly every Wednesday, typically with 3-5 curated pieces of content.'
                },
                {
                  q: 'Can I change my subscription preferences?',
                  a: 'Yes! You can manage your preferences or unsubscribe anytime using the link in any email we send.'
                },
                {
                  q: 'Will you share my email with third parties?',
                  a: 'Never. We take your privacy seriously and will never share your information with external parties.'
                },
                {
                  q: 'What if I miss an issue?',
                  a: 'All past newsletters are archived on our website. You can browse and read them anytime.'
                },
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  className="border-b border-border/50 pb-6 last:border-0"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-lg font-semibold text-foreground mb-3">{faq.q}</h3>
                  <p className="text-muted-foreground">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="w-full px-6 lg:px-8 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-heading font-bold text-foreground mb-4">
                Join Thousands of Subscribers
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Be part of the Ignite Room community and never miss out on important updates.
              </p>
              <button className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold">
                Subscribe to Newsletter
              </button>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
