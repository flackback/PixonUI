import React, { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { Surface } from '../../primitives/Surface';
import { Button } from '../button/Button';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  logo?: React.ReactNode;
  links?: { label: string; href: string }[];
  actions?: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const maxWidthClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full',
};

export function Navbar({
  logo,
  links = [],
  actions,
  className,
  maxWidth = 'xl',
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 py-4',
        isScrolled ? 'py-3' : 'py-6',
        className
      )}
    >
      <div className={cn('mx-auto transition-all duration-300', maxWidthClasses[maxWidth])}>
        <Surface
          className={cn(
            'flex items-center justify-between px-6 py-3 transition-all duration-300',
            isScrolled 
              ? 'rounded-2xl border-white/10 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-lg' 
              : 'rounded-2xl border-transparent bg-transparent dark:bg-transparent backdrop-blur-none shadow-none'
          )}
        >
          {/* Logo */}
          <div className="flex items-center gap-2">
            {logo || <span className="text-xl font-bold tracking-tighter">PIXON</span>}
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Actions & Mobile Toggle */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              {actions}
            </div>
            
            <button
              className="md:hidden p-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/[0.03] rounded-2xl transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </Surface>

        {/* Mobile Menu */}
        <div
          className={cn(
            'md:hidden absolute top-full left-4 right-4 mt-2 transition-all duration-300 origin-top',
            isMobileMenuOpen 
              ? 'opacity-100 scale-100 translate-y-0' 
              : 'opacity-0 scale-95 -translate-y-4 pointer-events-none'
          )}
        >
          <Surface className="p-4 flex flex-col gap-4 shadow-2xl border-white/10 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-base font-medium px-4 py-2 rounded-2xl hover:bg-zinc-100 dark:hover:bg-white/[0.03] text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-4 border-t border-zinc-200 dark:border-white/10 flex flex-col gap-2">
              {actions}
            </div>
          </Surface>
        </div>
      </div>
    </nav>
  );
}
