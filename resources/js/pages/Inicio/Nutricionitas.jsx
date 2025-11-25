import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Star, Calendar, Award, Clock } from "lucide-react";
import ChatBot from "@/components/ChatBot";
import PublicLayout from "../../components/PublicLayout";

const Nutricionistas = () => {
  const nutricionistas = [
    {
      id: 1,
      name: "Dra. María González",
      specialty: "Nutrición Deportiva",
      experience: "12 años",
      rating: 4.9,
      reviews: 156,
      availability: "Disponible",
      certifications: ["Lic. Nutrición", "Cert. Deportiva", "Master Metabolismo"],
      description: "Especialista en nutrición para atletas de alto rendimiento y personas activas. Enfoque en periodización nutricional y optimización del rendimiento.",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop"
    },
    {
      id: 2,
      name: "Dr. Carlos Méndez",
      specialty: "Nutrición Clínica",
      experience: "15 años",
      rating: 5.0,
      reviews: 203,
      availability: "Disponible",
      certifications: ["Lic. Nutrición", "Especialista Diabetes", "Cert. Obesidad"],
      description: "Experto en manejo de diabetes, obesidad y síndrome metabólico. Abordaje integral basado en evidencia científica y empatía.",
      avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop"
    },
    {
      id: 3,
      name: "Lic. Ana Rodríguez",
      specialty: "Nutrición Vegetariana",
      experience: "8 años",
      rating: 4.8,
      reviews: 98,
      availability: "Ocupado",
      certifications: ["Lic. Nutrición", "Cert. Plant-Based", "Nutrición Sostenible"],
      description: "Apasionada por la nutrición basada en plantas. Especializada en transiciones vegetarianas/veganas y optimización de nutrientes.",
      avatar: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop"
    },
    {
      id: 4,
      name: "Dr. Luis Fernández",
      specialty: "Nutrición Pediátrica",
      experience: "10 años",
      rating: 4.9,
      reviews: 187,
      availability: "Disponible",
      certifications: ["Lic. Nutrición", "Especialista Pediatría", "Nutrición Infantil"],
      description: "Dedicado a la nutrición en niños y adolescentes. Experto en manejo de alergias alimentarias y trastornos alimenticios juveniles.",
      avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop"
    }
  ];

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Conoce a nuestro equipo de expertos
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Profesionales certificados con amplia experiencia listos para ayudarte
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {nutricionistas.map((nutricionista) => (
            <Card key={nutricionista.id} className="bg-gradient-card hover:shadow-xl transition-smooth border-2 border-border hover:border-primary">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="h-20 w-20 border-4 border-primary">
                    <AvatarImage src={nutricionista.avatar} alt={nutricionista.name} />
                    <AvatarFallback>{nutricionista.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl mb-1">{nutricionista.name}</CardTitle>
                        <CardDescription className="text-base font-medium text-primary">
                          {nutricionista.specialty}
                        </CardDescription>
                      </div>
                      <Badge 
                        variant={nutricionista.availability === "Disponible" ? "default" : "secondary"}
                        className={nutricionista.availability === "Disponible" ? "bg-success" : ""}
                      >
                        {nutricionista.availability}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {nutricionista.experience}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-accent text-accent" />
                        {nutricionista.rating} ({nutricionista.reviews})
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{nutricionista.description}</p>
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Certificaciones</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {nutricionista.certifications.map((cert, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="hero" 
                    className="flex-1"
                    disabled={nutricionista.availability !== "Disponible"}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Agendar consulta
                  </Button>
                  <Button variant="outline">Ver perfil</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

    </PublicLayout>
  );
};

export default Nutricionistas;
