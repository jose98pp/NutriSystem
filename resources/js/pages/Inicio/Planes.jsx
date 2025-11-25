import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, Star } from "lucide-react";
import ChatBot from "@/components/ChatBot";
import PublicLayout from "../../components/PublicLayout";

const Planes = () => {
  const planes = [
    {
      id: 1,
      title: "Plan Pérdida de Peso",
      description: "Programa integral diseñado para alcanzar tu peso ideal de manera saludable y sostenible",
      price: "$99/mes",
      duration: "3 meses",
      category: "Adelgazamiento",
      rating: 4.9,
      features: [
        "Menú semanal personalizado",
        "3 consultas mensuales con nutricionista",
        "Seguimiento de progreso semanal",
        "Recetas exclusivas",
        "App móvil incluida"
      ],
      popular: true
    },
    {
      id: 2,
      title: "Plan Ganancia Muscular",
      description: "Optimiza tu desarrollo muscular con una nutrición diseñada para maximizar resultados",
      price: "$129/mes",
      duration: "4 meses",
      category: "Fitness",
      rating: 4.8,
      features: [
        "Plan alto en proteínas",
        "Timing nutricional pre y post-entrenamiento",
        "4 consultas mensuales",
        "Suplementación recomendada",
        "Ajustes según evolución"
      ],
      popular: false
    },
    {
      id: 3,
      title: "Plan Salud Integral",
      description: "Enfoque holístico para mejorar tu bienestar general y prevenir enfermedades",
      price: "$89/mes",
      duration: "6 meses",
      category: "Bienestar",
      rating: 5.0,
      features: [
        "Evaluación completa de salud",
        "Plan antiinflamatorio",
        "Control de biomarcadores",
        "Educación nutricional",
        "Soporte continuo"
      ],
      popular: false
    },
    {
      id: 4,
      title: "Plan Vegetariano/Vegano",
      description: "Nutrición plant-based completa y balanceada para tu estilo de vida consciente",
      price: "$95/mes",
      duration: "3 meses",
      category: "Especializado",
      rating: 4.9,
      features: [
        "100% basado en plantas",
        "Suplementación B12 y omega-3",
        "Recetas creativas",
        "Balance de macronutrientes",
        "Guía de compras"
      ],
      popular: false
    }
  ];

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Encuentra el plan perfecto para ti
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Todos nuestros planes incluyen seguimiento personalizado y ajustes según tu progreso
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {planes.map((plan) => (
            <Card key={plan.id} className="relative bg-gradient-card hover:shadow-xl transition-smooth border-2 border-border hover:border-primary">
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="default" className="bg-accent text-accent-foreground shadow-lg">
                    Más Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="secondary">{plan.category}</Badge>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    <span className="text-sm font-medium">{plan.rating}</span>
                  </div>
                </div>
                <CardTitle className="text-2xl">{plan.title}</CardTitle>
                <CardDescription className="text-base">{plan.description}</CardDescription>
                <div className="flex items-baseline gap-2 mt-4">
                  <span className="text-3xl font-bold text-primary">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">· {plan.duration}</span>
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button variant="hero" className="w-full" size="lg">
                  Comenzar ahora
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

    </PublicLayout>
  );
};

export default Planes;
