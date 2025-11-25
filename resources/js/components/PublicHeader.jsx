import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Phone, Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const PublicHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { to: '/inicio/planes', label: 'Planes' },
    { to: '/inicio/nutricionistas', label: 'Nutricionistas' },
    { to: '/inicio/psicologos', label: 'Psicólogos' },
    { to: '/inicio/recetas', label: 'Recetas' },
    { to: '/inicio/recursos', label: 'Recursos' },
  ];

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/images/company-logo.png"
              alt="Nutri System"
              className="h-8 w-8 object-contain"
            />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Nutri System
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-foreground hover:text-primary transition-smooth font-medium"
              >
                {link.label}
              </Link>
            ))}
            
            <Link to="/inicio/emergencia">
              <Button variant="accent" size="sm">
                <Phone className="h-4 w-4 mr-2" />
                Emergencia
              </Button>
            </Link>

            {/* Auth Buttons */}
            {user ? (
              <Button variant="default" size="sm" onClick={handleDashboardClick}>
                Ir al Dashboard
              </Button>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={handleRegisterClick}>
                  Registrarse
                </Button>
                <Button variant="default" size="sm" onClick={handleLoginClick}>
                  Iniciar Sesión
                </Button>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground hover:text-primary transition-smooth"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-border pt-4">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-foreground hover:text-primary transition-smooth font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              
              <Link to="/emergencia" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="accent" size="sm" className="w-full">
                  <Phone className="h-4 w-4 mr-2" />
                  Emergencia
                </Button>
              </Link>

              {/* Mobile Auth Buttons */}
              <div className="flex flex-col gap-2 pt-2 border-t border-border">
                {user ? (
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      handleDashboardClick();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Ir al Dashboard
                  </Button>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        handleRegisterClick();
                        setMobileMenuOpen(false);
                      }}
                    >
                      Registrarse
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        handleLoginClick();
                        setMobileMenuOpen(false);
                      }}
                    >
                      Iniciar Sesión
                    </Button>
                  </>
                )}
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default PublicHeader;
