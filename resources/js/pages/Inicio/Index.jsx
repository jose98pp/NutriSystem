import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Phone, ArrowRight, Sparkles, Apple, Users, ChefHat, Brain, Menu, X } from "lucide-react";
import PublicLayout from "../../components/PublicLayout";

const Index = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const categories = [
    {
      title: "Planes Nutricionales",
      description: "Programas personalizados diseñados por expertos para alcanzar tus objetivos de salud",
      icon: Apple,
      link: "/planes",
      badge: "Popular"
    },
    {
      title: "Nutricionistas Certificados",
      description: "Profesionales especializados listos para guiarte en tu camino hacia la salud óptima",
      icon: Users,
      link: "/nutricionistas",
      badge: "Recomendado"
    },
    {
      title: "Psicólogos Certificados",
      description: "Atención psicológica profesional individual o acompañada, presencial o por videollamada",
      icon: Brain,
      link: "/psicologos",
      badge: "Nuevo"
    },
    {
      title: "Recetas Saludables",
      description: "Miles de recetas deliciosas y nutritivas para cada momento del día",
      icon: ChefHat,
      link: "/recetas",
      badge: ""
    }
  ];

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container mx-auto px-4 py-20 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-secondary px-4 py-2 rounded-full">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-secondary-foreground">
                  Tu bienestar empieza aquí
                </span>
              </div>
              <h2 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
                Transforma tu salud con
                <span className="bg-gradient-primary bg-clip-text text-transparent"> nutrición personalizada</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Accede a planes nutricionales diseñados por expertos, consultas con profesionales certificados 
                y una comunidad dedicada a tu bienestar integral.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="hero" size="lg">
                  Comenzar ahora
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                <Button variant="outline" size="lg">
                  Conocer más
                </Button>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div>
                  <p className="text-3xl font-bold text-primary">10K+</p>
                  <p className="text-sm text-muted-foreground">Clientes satisfechos</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">500+</p>
                  <p className="text-sm text-muted-foreground">Planes personalizados</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">50+</p>
                  <p className="text-sm text-muted-foreground">Nutricionistas</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-3xl rounded-full" />
              <div className="relative rounded-2xl shadow-xl w-full bg-gradient-to-br from-primary/20 to-accent/20 p-12 flex items-center justify-center min-h-[400px]">
                <Apple className="h-48 w-48 text-primary/40" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Explora nuestros servicios
          </h3>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Todo lo que necesitas para lograr tus objetivos de salud en un solo lugar
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <Link key={index} to={`/inicio${category.link}`} className="group">
              <Card className="h-full bg-gradient-card hover:shadow-xl transition-smooth border-2 border-border hover:border-primary">
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-4 bg-secondary rounded-xl group-hover:scale-110 transition-smooth">
                      <category.icon className="h-16 w-16 text-primary" />
                    </div>
                    {category.badge && (
                      <Badge variant="secondary" className="bg-accent text-accent-foreground">
                        {category.badge}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-2xl group-hover:text-primary transition-smooth">
                    {category.title}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {category.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                    Explorar
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-smooth" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="bg-secondary/50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <Link to="/inicio/emergencia">
              <Card className="h-full hover:shadow-lg transition-smooth border-2 border-accent/20 hover:border-accent bg-gradient-card">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-accent text-accent-foreground rounded-lg">
                      <Phone className="h-8 w-8" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Consulta Urgente</CardTitle>
                      <CardDescription className="text-base">
                        Necesitas asistencia inmediata? Nuestro equipo está disponible 24/7
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>

            <Link to="/inicio/recetas">
              <Card className="h-full hover:shadow-lg transition-smooth border-2 border-primary/20 hover:border-primary bg-gradient-card">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary text-primary-foreground rounded-lg">
                      <BookOpen className="h-8 w-8" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Centro de Recursos</CardTitle>
                      <CardDescription className="text-base">
                        Guías, artículos y herramientas para tu educación nutricional
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </section>

    </PublicLayout>
  );
};

export default Index;
