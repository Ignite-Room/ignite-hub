import { motion } from 'framer-motion';
import { Users, Target, Zap } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import igniteLogo from '@/assets/ignite-logo.png';

export default function JoinUs() {
  const benefits = [
    {
      icon: Users,
      title: 'Build Community',
      description: 'Connect with like-minded developers, makers, and innovators in your area.'
    },
    {
      icon: Target,
      title: 'Learn & Grow',
      description: 'Access workshops, mentorship, and resources to accelerate your learning journey.'
    },
    {
      icon: Zap,
      title: 'Create Impact',
      description: 'Collaborate on projects and initiatives that make a real difference.'
    },
  ];

  return (
    <div className="relative min-h-screen bg-background">
      <Navbar />
      
      <main className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-6 lg:px-8 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <img src={igniteLogo} alt="Ignite logo" className="mx-auto h-16 mb-6" />
              <h1 className="text-5xl md:text-7xl font-heading font-bold text-foreground mb-6">
                Join Ignite Room
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Be part of a thriving community of developers, creators, and innovators.
                Ignite your passion, learn together, and build amazing things.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <a href="https://chat.whatsapp.com/HqqpmbtlbF7DESwKgd5Mc6" target="_blank" rel="noopener noreferrer" className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold">
                  Join WhatsApp Community
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="max-w-6xl mx-auto px-6 lg:px-8 py-20">
          <motion.h2
            className="text-4xl font-heading font-bold text-foreground text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            Why Join?
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                className="bg-secondary/50 border border-border/50 rounded-lg p-8 hover:bg-secondary/70 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <benefit.icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="max-w-6xl mx-auto px-6 lg:px-8 py-20">
          <motion.h2
            className="text-4xl font-heading font-bold text-foreground text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            How to Get Started
          </motion.h2>

          <div className="space-y-8">
            {[
              {
                step: 1,
                title: 'Join the WhatsApp Community',
                description: 'Click the link to join our official WhatsApp group where all the action happens.'
              },
              {
                step: 2,
                title: 'Introduce Yourself',
                description: 'Say hi, tell us about your college, and share what you\'re passionate about building.'
              },
              {
                step: 3,
                title: 'Attend Meetups & Hackathons',
                description: 'Access exclusive events, workshops, and collaborate hands-on with other members.'
              },
              {
                step: 4,
                title: 'Start Building',
                description: 'Participate in projects, build your portfolio, and grow with the community.'
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                className="flex gap-6"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-4xl mx-auto px-6 lg:px-8 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground mb-6">
              Ready to Ignite Your Journey?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join hundreds of developers who are already making an impact. Your journey starts here.
            </p>
            <a 
              href="https://chat.whatsapp.com/HqqpmbtlbF7DESwKgd5Mc6" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-block px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold text-lg"
            >
              Join the Movement
            </a>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
