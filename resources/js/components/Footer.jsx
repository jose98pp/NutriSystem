import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/images/company-logo.png" alt="Nutri System" className="h-6 w-6 object-contain" />
              <h4 className="font-bold text-lg">Nutri System</h4>
            </div>
            <p className="text-muted-foreground text-sm">
              Tu aliado en el camino hacia una vida más saludable y balanceada.
            </p>
          </div>

          {/* Services Section */}
          <div>
            <h5 className="font-semibold mb-4">Servicios</h5>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/inicio/planes" className="hover:text-primary transition-smooth">
                  Planes Nutricionales
                </Link>
              </li>
              <li>
                <Link to="/inicio/nutricionistas" className="hover:text-primary transition-smooth">
                  Nutricionistas
                </Link>
              </li>
              <li>
                <Link to="/inicio/psicologos" className="hover:text-primary transition-smooth">
                  Psicólogos
                </Link>
              </li>
              <li>
                <Link to="/inicio/recetas" className="hover:text-primary transition-smooth">
                  Recetas
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Section */}
          <div>
            <h5 className="font-semibold mb-4">Soporte</h5>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/inicio/emergencia" className="hover:text-primary transition-smooth">
                  Emergencia
                </Link>
              </li>
              <li>
                <Link to="/inicio/recursos" className="hover:text-primary transition-smooth">
                  Recursos
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-smooth">
                  Centro de Ayuda
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h5 className="font-semibold mb-4">Contacto</h5>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>info@nutrisystem.com</li>
              <li>+1 (555) 123-4567</li>
              <li>Lun - Dom: 24/7</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© {currentYear} Nutri System. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
