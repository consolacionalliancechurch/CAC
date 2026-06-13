import React from "react";
import { Church } from "lucide-react";
import { Link } from "react-router-dom";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-foreground flex-col justify-between p-12">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80"
            alt="Church"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-foreground/80 to-primary/40" />
        </div>
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center">
              <Church className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-heading text-lg font-bold text-primary-foreground leading-tight">Consolacion Alliance</p>
              <p className="text-xs text-primary-foreground/60 tracking-wider uppercase">CAMACOP</p>
            </div>
          </Link>
        </div>
        <div className="relative z-10 space-y-6">
          <blockquote className="font-heading text-3xl font-bold text-primary-foreground leading-relaxed">
            "For where two or three gather in my name, there am I with them."
          </blockquote>
          <p className="text-primary-foreground/60 text-sm tracking-wider">— Matthew 18:20</p>
        </div>
        <div className="relative z-10">
          <p className="text-primary-foreground/40 text-xs">© {new Date().getFullYear()} Consolacion Alliance Church · CAMACOP</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-background">
        {/* Mobile logo */}
        <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
          <Church className="w-6 h-6 text-primary" />
          <span className="font-heading font-bold text-foreground">Consolacion Alliance</span>
        </Link>

        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            {Icon && (
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Icon className="w-6 h-6 text-primary" />
              </div>
            )}
            <h1 className="font-heading text-2xl font-bold text-foreground">{title}</h1>
            {subtitle && <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>}
          </div>

          <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
            {children}
          </div>

          {footer && (
            <p className="text-center text-sm text-muted-foreground mt-6">{footer}</p>
          )}
        </div>
      </div>
    </div>
  );
}