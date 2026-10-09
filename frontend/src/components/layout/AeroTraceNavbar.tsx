import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function AeroTraceNavbar() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Overview', path: '/' },
    { name: 'Events', path: '/events' },
    { name: 'Sources', path: '/facilities' },
    { name: 'Sensors', path: '/sensors' },
    { name: 'Reports', path: '/reports' },
    { name: 'About', path: '/about' },
  ];

  const navbarClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out border-b ${
    isHome
      ? scrolled
        ? 'bg-brand-bg/95 backdrop-blur-md border-brand-soft py-4'
        : 'bg-transparent border-transparent py-6'
      : 'bg-brand-bg/95 backdrop-blur-md border-brand-soft py-4'
  }`;

  return (
    <>
      <nav className={navbarClasses}>
        <div className="max-w-7xl mx-auto px-8 md:px-12 flex justify-between items-center">
          <Link to="/" className="text-xl tracking-[0.2em] uppercase font-medium text-brand-ink flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-moss inline-block"></span>
            AeroTrace
          </Link>
          
          <div className="hidden md:flex gap-10">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path || 
                (link.path === '/events' && location.pathname.startsWith('/investigation'));
              
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-xs tracking-widest uppercase transition-all duration-300 relative group pb-1 ${
                    isActive ? 'text-brand-ink font-medium' : 'text-brand-ink/60 hover:text-brand-ink'
                  }`}
                >
                  {link.name}
                  <span 
                    className={`absolute bottom-0 left-0 h-[1px] bg-brand-moss transition-all duration-300 ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  ></span>
                </Link>
              );
            })}
          </div>

          <button 
            className="md:hidden text-brand-ink"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-brand-bg z-[100] transition-transform duration-500 ease-in-out flex flex-col ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-8 flex justify-between items-center border-b border-brand-soft">
          <span className="text-xl tracking-[0.2em] uppercase font-medium text-brand-ink">AeroTrace</span>
          <button onClick={() => setMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>
        <div className="flex flex-col p-8 gap-8">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path || 
              (link.path === '/events' && location.pathname.startsWith('/investigation'));
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`text-3xl font-light tracking-wide transition-colors ${
                  isActive ? 'text-brand-moss' : 'text-brand-ink'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
