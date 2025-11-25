import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Users, Flame, Heart } from "lucide-react";
import ChatBot from "@/components/ChatBot";
import PublicLayout from "../../components/PublicLayout";

const Recetas = () => {
  const recetas = [
    {
      id: 1,
      title: "Bowl de Quinoa con Verduras Asadas",
      description: "Plato completo rico en proteína vegetal, fibra y antioxidantes",
      category: "Almuerzo",
      calories: "420 kcal",
      prepTime: "35 min",
      servings: "2 personas",
      difficulty: "Fácil",
      tags: ["Vegetariano", "Alto en Fibra", "Sin Gluten"],
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop"
    },
    {
      id: 2,
      title: "Salmón al Horno con Espárragos",
      description: "Fuente excepcional de omega-3 y proteína de alta calidad",
      category: "Cena",
      calories: "385 kcal",
      prepTime: "25 min",
      servings: "2 personas",
      difficulty: "Fácil",
      tags: ["Alto en Proteína", "Omega-3", "Bajo en Carbos"],
      image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=600&fit=crop"
    },
    {
      id: 3,
      title: "Smoothie Bowl de Frutas Tropicales",
      description: "Desayuno energético lleno de vitaminas y minerales",
      category: "Desayuno",
      calories: "280 kcal",
      prepTime: "10 min",
      servings: "1 persona",
      difficulty: "Muy Fácil",
      tags: ["Vegano", "Sin Azúcar Añadida", "Rápido"],
      image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&h=600&fit=crop"
    },
    {
      id: 4,
      title: "Ensalada de Pollo con Aguacate",
      description: "Comida balanceada perfecta para mantener energía todo el día",
      category: "Almuerzo",
      calories: "450 kcal",
      prepTime: "20 min",
      servings: "2 personas",
      difficulty: "Fácil",
      tags: ["Alto en Proteína", "Grasas Saludables", "Bajo IG"],
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop"
    },
    {
      id: 5,
      title: "Curry de Garbanzos con Espinacas",
      description: "Receta vegetariana rica en hierro y proteína vegetal",
      category: "Cena",
      calories: "395 kcal",
      prepTime: "40 min",
      servings: "4 personas",
      difficulty: "Media",
      tags: ["Vegetariano", "Alto en Fibra", "Antiinflamatorio"],
      image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&h=600&fit=crop"
    },
    {
      id: 6,
      title: "Parfait de Yogurt Griego con Granola",
      description: "Snack o desayuno rico en probióticos y fibra prebiótica",
      category: "Snack",
      calories: "220 kcal",
      prepTime: "5 min",
      servings: "1 persona",
      difficulty: "Muy Fácil",
      tags: ["Probiótico", "Alto en Proteína", "Rápido"],
      image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&h=600&fit=crop"
    }
  ];

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Descubre recetas deliciosas y nutritivas
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Cada receta está diseñada por nutricionistas para maximizar beneficios y sabor
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recetas.map((receta) => (
            <Card key={receta.id} className="overflow-hidden bg-gradient-card hover:shadow-xl transition-smooth border-2 border-border hover:border-primary group">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={receta.image} 
                  alt={receta.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-smooth"
                />
                <div className="absolute top-3 right-3">
                  <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-lg">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
                <div className="absolute bottom-3 left-3">
                  <Badge variant="default" className="bg-card/90 text-card-foreground backdrop-blur-sm">
                    {receta.category}
                  </Badge>
                </div>
              </div>

              <CardHeader>
                <CardTitle className="text-xl group-hover:text-primary transition-smooth">
                  {receta.title}
                </CardTitle>
                <CardDescription>{receta.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{receta.prepTime}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{receta.servings}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Flame className="h-4 w-4" />
                    <span>{receta.calories}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {receta.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <Button variant="default" className="w-full">
                  Ver receta completa
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

    </PublicLayout>
  );
};

export default Recetas;
