import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useSEO } from '@/hooks/use-seo';

export default function Blog() {
  useSEO({
    title: 'Blog',
    description: 'Tutorials, stories, and announcements from the Ignite Room community: hackathon guides, portfolio tips, and mentorship advice for student builders.',
    path: '/blog',
  });

  const blogPosts = [
    { id: 1, title: 'Getting Started with Ignite', excerpt: 'How to join and get the most out of the community.' },
    { id: 2, title: 'Building a Strong Portfolio', excerpt: 'Tips and project ideas for students.' },
    { id: 3, title: 'Dev Tools We Love', excerpt: 'A curated list of tools and resources.' },
    { id: 4, title: 'Hosting Your First Hackathon', excerpt: 'Step-by-step planning checklist.' },
    { id: 5, title: 'Mentorship Best Practices', excerpt: 'How to both give and receive meaningful mentorship.' },
    { id: 6, title: 'From Idea to MVP', excerpt: 'A practical guide to shipping quickly.' },
  ];

  return (
    <div className="relative min-h-screen bg-background">
      <Navbar />

      <main className="relative z-10 w-full">
        <section className="w-full px-6 lg:px-8 py-20">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">Blog</h1>
              <p className="text-muted-foreground text-lg mb-8">Learn from our community: tutorials, stories and announcements.</p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {blogPosts.map((post, index) => (
                <motion.article
                  key={post.id}
                  className="group bg-secondary/50 border border-border/50 rounded-lg overflow-hidden hover:border-primary/50 transition-all cursor-pointer p-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-2xl font-semibold text-foreground mb-2">{post.title}</h3>
                  <p className="text-muted-foreground">{post.excerpt}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
