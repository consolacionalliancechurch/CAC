import React from 'react';
import { Link } from 'react-router-dom';
import { Church, MapPin, Phone, Mail, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-foreground text-background/80">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Church className="w-6 h-6 text-primary" />
              <span className="font-heading text-xl font-bold text-background">Consolacion Alliance Church</span>
            </div>
            <p className="text-sm leading-relaxed text-background/60">
              A member church of the Christian and Missionary Alliance Churches of the Philippines, Inc. (CAMACOP). 
              Faithfully serving the community through worship, fellowship, and the Great Commission.
            </p>
          </div>
          
          <div>
            <h4 className="font-heading font-bold text-background mb-4">Quick Links</h4>
            <div className="space-y-2">
              {[
                { path: '/', label: 'Home' },
                { path: '/worship-schedule', label: 'Worship Schedule' },
                { path: '/sermons', label: 'Sermon Archive' },
                { path: '/prayer-meeting', label: 'Prayer Meetings' },
                { path: '/activities', label: 'Activities' },
                { path: '/celebrations', label: 'Celebrations' },
                { path: '/about', label: 'About Us' },
                { path: '/contact', label: 'Contact' },
              ].map(link => (
                <Link key={link.path} to={link.path} className="block text-sm text-background/60 hover:text-primary transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-heading font-bold text-background mb-4">Visit Us</h4>
            <div className="space-y-3">
              <p className="flex items-start gap-2 text-sm text-background/60">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                Consolacion, Cebu, Philippines
              </p>
              <p className="flex items-center gap-2 text-sm text-background/60">
                <Phone className="w-4 h-4 shrink-0 text-primary" />
                Sunday Worship: 9:00 AM
              </p>
              <p className="flex items-center gap-2 text-sm text-background/60">
                <Mail className="w-4 h-4 shrink-0 text-primary" />
                consolacion.alliance@email.com
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-background/10 text-center">
          <p className="text-xs text-background/40 flex items-center justify-center gap-1">
            Made with <Heart className="w-3 h-3 text-primary" /> by Consolacion Alliance Church © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}