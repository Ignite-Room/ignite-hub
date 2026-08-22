import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/ThemeToggle';
import { useAuth, redirectPathForUser } from '@/lib/auth-context';
import igniteLogo from '@/assets/ignite-logo.png';

const navLinks = [
  { name: 'Home', href: '#home' },
  { name: 'About', href: '#about' },
  { name: 'Events', href: '/events' },
  { name: 'Ambassador', href: '/ambassador' },
  { name: 'Chapters', href: '#chapters' },
  { name: 'App', href: '#app' },
  { name: 'Careers', href: '/careers' },
  { name: 'Partners', href: '/partners' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  const handleNav = (href: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (href.startsWith('#')) {
      const id = href.slice(1);
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 120);
      } else {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }
    navigate(href);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-background/90 backdrop-blur-xl border-b border-border/60 shadow-sm' : 'bg-background/60 backdrop-blur-md'
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#home" onClick={(e) => handleNav('#home', e)} className="flex items-center gap-2.5 group">
            <motion.img
              src={igniteLogo}
              alt="Ignite Room"
              className="h-8 w-auto"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400 }}
            />
            <span className="font-heading font-bold text-lg text-foreground group-hover:text-primary transition-colors">
              Ignite Room
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNav(link.href, e)}
                className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />
            {isAuthenticated && user ? (
              <>
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => navigate(redirectPathForUser(user))}>
                  Dashboard
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { logout(); navigate('/login', { replace: true }); }}>
                  Log Out
                </Button>
              </>
            ) : (
              <Button variant="default" size="sm" className="group rounded-full px-5" onClick={() => navigate('/login')}>
                Login
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Button>
            )}
            <Button variant="default" size="sm" className="rounded-full" onClick={() => window.open('https://chat.whatsapp.com/HqqpmbtlbF7DESwKgd5Mc6', '_blank')}>
              Join Community
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-foreground p-2"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Accent underline */}
      <div className="h-[2px] w-full bg-gradient-to-r from-primary via-primary/60 to-transparent" />

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background/95 backdrop-blur-xl border-b border-border"
          >
            <div className="px-6 py-4 space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                    setIsMobileMenuOpen(false);
                    handleNav(link.href, e as unknown as React.MouseEvent);
                  }}
                  className="block text-foreground hover:text-primary transition-colors font-medium py-2"
                >
                  {link.name}
                </a>
              ))}
              {isAuthenticated && user ? (
                <>
                  <Button variant="outline" className="w-full mt-4 rounded-full" onClick={() => { setIsMobileMenuOpen(false); navigate(redirectPathForUser(user)); }}>
                    Dashboard
                  </Button>
                  <Button variant="ghost" className="w-full mt-2" onClick={() => { setIsMobileMenuOpen(false); logout(); navigate('/login', { replace: true }); }}>
                    Log Out
                  </Button>
                </>
              ) : (
                <Button variant="default" className="w-full mt-4 rounded-full" onClick={() => { setIsMobileMenuOpen(false); navigate('/login'); }}>
                  Login
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              )}
              <Button variant="default" className="w-full mt-2 rounded-full" onClick={() => { setIsMobileMenuOpen(false); navigate('/join-us'); }}>
                Join Community
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
