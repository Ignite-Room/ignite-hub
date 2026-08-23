import { Linkedin, Github } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useSEO } from '@/hooks/use-seo';
import team from '../lib/team';

export default function TeamPage() {
  useSEO({
    title: 'Our Team',
    description: 'Meet the full Ignite Room team: the people behind the community, their roles, and how to connect with them.',
    path: '/team',
  });

  return (
    <div className="relative min-h-screen bg-background">
      <Navbar />

      <main className="relative z-10 w-full px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <section className="text-center mb-12">
            <span className="font-body text-primary font-bold text-xs uppercase tracking-[0.15em] mb-4 block">
              Our Team
            </span>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
              Meet the Full Team
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Learn more about the people who run Ignite: their roles, links and a fun fact.
            </p>
          </section>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map((member) => (
              <article key={member.name} className="border-t-2 border-primary/40 pt-4">
                <div className="flex items-center gap-4">
                  <img src={member.image} alt={member.name} className="w-20 h-20 rounded-full object-cover" loading="lazy" />
                  <div>
                    <h3 className="font-heading text-lg font-bold text-foreground">{member.name}</h3>
                    <p className="text-primary text-sm">{member.role}</p>
                    <p className="text-muted-foreground text-sm mt-2">{member.funFact}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <a href={member.linkedin} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/20 transition-colors">
                        <Linkedin className="w-4 h-4" />
                      </a>
                      <a href={member.github} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/20 transition-colors">
                        <Github className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
