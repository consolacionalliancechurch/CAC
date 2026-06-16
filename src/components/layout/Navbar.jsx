import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User as UserIcon, Shield } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { sundayServicesService } from '@/services';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/worship-schedule', label: 'Schedule' },
  { path: '/sermons', label: 'Sermons' },
  { path: '/vlogs', label: 'Vlogs' },
  { path: '/activities', label: 'Activities' },
  { path: '/celebrations', label: 'Celebrations' },
  { path: '/prayer-request', label: 'Prayer' },
  { path: '/about', label: 'About' },
  { path: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setIsOpen(false); }, [location]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const { data: upcomingService } = useQuery({
    queryKey: ['upcoming-service'],
    queryFn: () => sundayServicesService.getUpcoming(),
  });
  const isLive = !!upcomingService?.livestream_url;

  return (
    <>
      {isLive && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-primary/90 backdrop-blur-sm text-primary-foreground text-center py-1.5 text-sm font-body">
          <span className="inline-flex items-center gap-2">
            <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
            LIVE NOW — Sunday Worship Service
          </span>
        </div>
      )}
      <nav className={`fixed ${isLive ? 'top-8' : 'top-0'} left-0 right-0 z-40 transition-all duration-500 ${
        scrolled ? 'bg-background/90 backdrop-blur-md shadow-sm' : 'bg-background/80 backdrop-blur-sm'
      }`}>
        <div className="flex items-center justify-between px-6 py-4 w-full">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex items-center justify-center w-10 h-10 overflow-hidden rounded-full">
              <img src="/CACLogo.jpg" alt="CAC Logo" className="object-cover w-full h-full"
                onError={e => { e.target.style.display = 'none'; }} />
            </div>
            <div className="hidden sm:block">
              <p className="text-lg font-bold leading-tight font-heading text-foreground">Consolacion Alliance Church</p>
              <p className="text-xs tracking-wider uppercase text-muted-foreground">CAMACOP</p>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="items-center hidden gap-1 md:flex">
            {navLinks.map(link => (
              <Link key={link.path} to={link.path}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  location.pathname === link.path
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground/70 hover:text-foreground hover:bg-muted'
                }`}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Admin controls — only visible when logged in */}
          {isAuthenticated && user ? (
            <div className="items-center hidden gap-2 pl-2 ml-2 border-l md:flex border-border">
              <div className="flex items-center gap-2 px-3 py-2 text-sm rounded-full bg-muted text-foreground/80">
                <UserIcon className="w-3.5 h-3.5" />
                <span className="max-w-[120px] truncate">{user.email}</span>
              </div>
              <Link to="/super-admin" className="p-2 transition-colors rounded-full hover:bg-muted text-primary" title="Super Admin">
                <Shield className="w-4 h-4" />
              </Link>
              <button onClick={handleLogout} className="p-2 transition-colors rounded-full hover:bg-muted text-muted-foreground hover:text-foreground" title="Logout">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Empty spacer so layout doesn't shift — no login button shown to public */
            <div className="hidden w-8 md:block" />
          )}

          <button onClick={() => setIsOpen(!isOpen)} className="p-2 transition-colors rounded-lg md:hidden hover:bg-muted">
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} className="overflow-hidden border-t md:hidden bg-background/95 backdrop-blur-md border-border">
              <div className="px-6 py-4 space-y-1">
                {navLinks.map(link => (
                  <Link key={link.path} to={link.path} onClick={() => setIsOpen(false)}
                    className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === link.path ? 'bg-primary text-primary-foreground' : 'text-foreground/70 hover:bg-muted'
                    }`}>
                    {link.label}
                  </Link>
                ))}
                {/* Admin mobile menu — only when logged in */}
                {isAuthenticated && user && (
                  <div className="pt-3 mt-3 space-y-1 border-t border-border">
                    <p className="px-4 py-2 text-sm truncate text-muted-foreground">{user.email}</p>
                    <Link to="/super-admin" onClick={() => setIsOpen(false)}
                      className="flex items-center w-full gap-2 px-4 py-3 text-sm font-medium transition-colors rounded-lg text-primary hover:bg-muted">
                      <Shield className="w-4 h-4" /> Super Admin
                    </Link>
                    <button onClick={handleLogout} className="flex items-center w-full gap-2 px-4 py-3 text-sm font-medium transition-colors rounded-lg text-foreground/70 hover:bg-muted">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}