import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Star, Calendar, Award, Clock, Video, Users, User } from "lucide-react";
import ChatBot from "@/components/ChatBot";
import PublicLayout from "../../components/PublicLayout";

const Psicologos = () => {
  const psicologos = [
    {
      id: 1,
      name: "Dra. Laura Martínez",
      specialty: "Psicología Clínica",
      experience: "15 años",
      rating: 4.9,
      reviews: 234,
      availability: "Disponible",
      certifications: ["Lic. Psicología", "Master Terapia Cognitiva", "Cert. Trauma"],
      description: "Especialista en terapia cognitivo-conductual y manejo de ansiedad. Enfoque empático y basado en evidencia científica.",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
      modalities: ["individual", "videollamada", "presencial"]
    },
    {
      id: 2,
      name: "Dr. Roberto Silva",
      specialty: "Psicología Familiar",
      experience: "12 años",
      rating: 5.0,
      reviews: 189,
      availability: "Disponible",
      certifications: ["Lic. Psicología", "Terapia Familiar", "Cert. Parejas"],
      description: "Experto en terapia familiar y de pareja. Facilitador de procesos de comunicación y resolución de conflictos.",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop",
      modalities: ["acompañada", "individual", "videollamada", "presencial"]
    },
    {
      id: 3,
      name: "Lic. Carmen López",
      specialty: "Psicología Infantil",
      experience: "10 años",
      rating: 4.8,
      reviews: 167,
      availability: "Ocupado",
      certifications: ["Lic. Psicología", "Especialista Niños", "Terapia de Juego"],
      description: "Dedicada al bienestar emocional de niños y adolescentes. Experta en trastornos del desarrollo y conductuales.",
      avatar: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=400&fit=crop",
      modalities: ["acompañada", "presencial"]
    },
    {
      id: 4,
      name: "Dr. Miguel Ángel Torres",
      specialty: "Psicología Organizacional",
      experience: "8 años",
      rating: 4.9,
      reviews: 145,
      availability: "Disponible",
      certifications: ["Lic. Psicología", "Master Org.", "Coach Ejecutivo"],
      description: "Especialista en bienestar laboral y manejo del estrés. Coaching ejecutivo y desarrollo personal.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
      modalities: ["individual", "videollamada", "presencial"]
    }
  ];

  const getModalityIcon = (modality) => {
    switch (modality) {
      case "individual":
        return <User className="h-3 w-3" />;
      case "acompañada":
        return <Users className="h-3 w-3" />;
      case "videollamada":
        return <Video className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getModalityLabel = (modality) => {
    switch (modality) {
      case "individual":
        return "Individual";
      case "acompañada":
        return "Acompañada";
      case "videollamada":
        return "Videollamada";
      case "presencial":
        return "Presencial";
      default:
        return modality;
    }
  };
  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Atención Psicológica Profesional
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Expertos en salud mental listos para acompañarte en tu proceso de bienestar emocional
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <Badge variant="secondary" className="text-sm py-2 px-4">
              <Users className="h-4 w-4 mr-2" />
              Atención Acompañada
            </Badge>
            <Badge variant="secondary" className="text-sm py-2 px-4">
              <User className="h-4 w-4 mr-2" />
              Sesiones Individuales
            </Badge>
            <Badge variant="secondary" className="text-sm py-2 px-4">
              <Video className="h-4 w-4 mr-2" />
              Videollamadas
            </Badge>
            <Badge variant="secondary" className="text-sm py-2 px-4">
              Consultas Presenciales
            </Badge>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {psicologos.map((psicologo) => (
            <Card key={psicologo.id} className="bg-gradient-card hover:shadow-xl transition-smooth border-2 border-border hover:border-primary">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="h-20 w-20 border-4 border-primary">
                    <AvatarImage src={psicologo.avatar} alt={psicologo.name} />
                    <AvatarFallback>{psicologo.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl mb-1">{psicologo.name}</CardTitle>
                        <CardDescription className="text-base font-medium text-primary">
                          {psicologo.specialty}
                        </CardDescription>
                      </div>
                      <Badge 
                        variant={psicologo.availability === "Disponible" ? "default" : "secondary"}
                        className={psicologo.availability === "Disponible" ? "bg-success" : ""}
                      >
                        {psicologo.availability}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {psicologo.experience}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-accent text-accent" />
                        {psicologo.rating} ({psicologo.reviews})
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{psicologo.description}</p>
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Certificaciones</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {psicologo.certifications.map((cert, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium">Modalidades disponibles</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {psicologo.modalities.map((modality, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {getModalityIcon(modality)}
                        <span className="ml-1">{getModalityLabel(modality)}</span>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="hero" 
                    className="flex-1"
                    disabled={psicologo.availability !== "Disponible"}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Agendar sesión
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

export default Psicologos;
