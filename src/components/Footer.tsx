import { motion } from 'framer-motion';
import { Twitter, Instagram, Linkedin, Github, Mail, Flame } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import igniteLogo from '@/assets/ignite-logo.png';

const footerLinks = {
  community: [
    { name: 'About Us', href: '#about' },
    { name: 'Events', href: '#events' },
    { name: 'Join Us', href: '/join-us' },
    { name: 'Careers', href: '/careers' },
  ],
  resources: [
    // { name: 'Blog', href: '/blog' },
    // { name: 'Newsletter', href: '/newsletter' },
    { name: 'FAQs', href: '/faqs' },
    { name: 'Contact', href: '/contact' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy-policy' },
    { name: 'Terms of Service', href: '/terms-of-service' },
    { name: 'Code of Conduct', href: '/code-of-conduct' },
    { name: 'Disclaimer', href: '/disclaimer' },
    { name: 'Accessibility', href: '/accessibility' },
    { name: 'Cookie Policy', href: '/cookie-policy' },
  ],
};

const socialLinks = [
  { name: 'Instagram', icon: Instagram, href: 'https://www.instagram.com/igniteroom.india/' },
  { name: 'LinkedIn', icon: Linkedin, href: 'https://www.linkedin.com/company/ignite-room/' },
  { name: 'GitHub', icon: Github, href: 'https://github.com/Ignite-Room' },
  { name: 'Email', icon: Mail, href: 'mailto:admin@igniteroom.in' },
];

export default function Footer() {
  const navigate = useNavigate();

  const handleNavigation = (href: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();

    if (href.startsWith('#')) {
      const id = href.slice(1);
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Use navigate for route paths then scroll to top
    navigate(href);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return (
    <footer className="bg-secondary/30 border-t border-border/50 pointer-events-auto">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <motion.a
              href="#home"
              className="flex items-center gap-3 mb-6"
              whileHover={{ scale: 1.02 }}
            >
              <img src={igniteLogo} alt="Ignite Room" className="h-10 w-auto" />
              <span className="font-heading font-bold text-xl text-foreground">Ignite Room</span>
            </motion.a>
            <p className="text-muted-foreground leading-relaxed mb-6 max-w-sm">
              A student-driven technology community empowering learners, innovators,
              and builders to turn ideas into reality.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/20 transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-heading font-semibold text-foreground mb-4">Community</h4>
            <ul className="space-y-3">
              {footerLinks.community.map((link) => (
                <li key={link.name}>
                  {link.href.startsWith('#') ? (
                    <a
                      href={link.href}
                      onClick={(e) => handleNavigation(link.href, e)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </a>
                  ) : (
                    <Link
                      to={link.href}
                      onClick={(e) => handleNavigation(link.href, e)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-foreground mb-4">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    onClick={(e) => handleNavigation(link.href, e)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
              <li>
                {/* Plain anchor: /chess is a separately deployed app, not a client-side route */}
                <a
                  href="/chess"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Play Chess ↗
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    onClick={(e) => handleNavigation(link.href, e)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Ignite Room. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Built with <Flame className="w-4 h-4 inline-block text-orange-500 mx-1" /> by students, for students.
          </p>
        </div>
      </div>
    </footer>
  );
}
