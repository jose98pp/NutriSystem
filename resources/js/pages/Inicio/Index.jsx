import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Phone, ArrowRight, Sparkles, Apple, Users, ChefHat, Brain, Menu, X, Heart, Clock, LayoutGrid } from "lucide-react";
import PublicLayout from "../../components/PublicLayout";

const Index = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Datos para la sección "Qué Ofrecemos"
  const features = [
    {
      icon: Clock,
      title: "Seguimiento en Tiempo Real",
      description: "Monitorea el progreso de tus pacientes con métricas detalladas."
    },
    {
      icon: LayoutGrid,
      title: "Planes Personalizados",
      description: "Crea planes alimenticios adaptados a cada necesidad."
    },
    {
      icon: Users,
      title: "Comunidad de Apoyo",
      description: "Monitorea el progreso y apoyo de tus conocidos."
    },
  ];

  // Datos para testimonios
  const testimonials = [
    {
      name: "Ana Gómez",
      text: '"NutriSystem cambió mi vida! Perdí 10kg y me siento con mucha energía."',
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NTMzNzJ8MHwxfHNlYXJjaHwyMHx8d29tYW4lMjBzbWlsaW5nfHxlbnwwfHx8fDE3MTU0OTk4MjR8MA&ixlib=rb-4.0.3&q=80&w=1080"
    },
    {
      name: "Carlos Pérez",
      text: '"La mejor app de nutrición. Mi nutricionista es excelente y el seguimiento es clave."',
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NTMzNzJ8MHwxfHNlYXJjaHwxNHx8bWFuJTIwc21pbGluZ3xlbnwwfHx8fDE3MTU0OTk4MjV8MA&ixlib=rb-4.0.3&q=80&w=1080"
    },
  ];

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#81D833] to-[#2E8B57] text-white py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <Sparkles className="h-4 w-4 text-white" />
                <span className="text-sm font-medium">Tu bienestar empieza aquí</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-bold leading-tight">
                Transforma tu salud con NutriSystem
              </h2>
              <p className="text-lg text-white/90">
                Accede a planes nutricionales diseñados por expertos, consultas con profesionales certificados
                y una comunidad dedicada a tu bienestar integral.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/register">
                  <Button className="bg-white text-[#2E8B57] hover:bg-gray-100" size="lg">
                    Comenzar ahora
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
                <Button variant="outline" className="border-white text-white hover:bg-white/10" size="lg">
                  Conocer más
                </Button>
              </div>
            </div>
            <div className="relative flex justify-center">
              <img
                src="https://images.unsplash.com/photo-1549060273-712337e7f603?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NTMzNzJ8MHwxfHNlYXJjaHwzMHx8Zml0bmVzcyUyMHBlb3BsZXxlbnwwfHx8fDE3MTU0OTM1MTh8MA&ixlib=rb-4.0.3&q=80&w=1080"
                alt="Personas haciendo ejercicio"
                className="rounded-lg shadow-xl object-cover w-full max-w-md md:max-w-none h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Características - "Qué Ofrecemos" */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Qué Ofrecemos</h3>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Todo lo que necesitas para lograr tus objetivos de salud en un solo lugar.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="h-full border-none shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-start space-x-4 pb-2">
                <div className="p-3 bg-green-100 rounded-full">
                  <feature.icon className="h-8 w-8 text-[#2E8B57]" />
                </div>
                <CardTitle className="text-2xl font-semibold">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-gray-600">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Sección de Testimonios */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Lo que dicen nuestros clientes
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Miles de personas ya han transformado sus vidas con NutriSystem.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="shadow-lg p-6 flex flex-col items-start bg-white">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="h-5 w-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15.27L16.18 19l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 4.73L3.82 19z"/>
                    </svg>
                  ))}
                </div>
                <p className="text-lg italic text-gray-700 mb-4">{testimonial.text}</p>
                <div className="flex items-center">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name} 
                    className="h-12 w-12 rounded-full mr-4 object-cover" 
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

    </PublicLayout>
  );
};

export default Index;
