import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, ArrowLeft, Clock, AlertCircle } from "lucide-react";
import PublicLayout from "../../components/PublicLayout";

const Emergencias = () => {
  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-gradient-card border-2 border-accent">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-4 bg-accent text-accent-foreground rounded-full">
                  <Phone className="h-8 w-8" />
                </div>
                <div>
                  <CardTitle className="text-3xl">Asistencia Inmediata</CardTitle>
                  <CardDescription className="text-base">
                    Nuestro equipo está disponible 24/7
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-3 p-4 bg-secondary rounded-lg">
                <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Línea de Emergencia</p>
                  <p className="text-2xl font-bold text-primary">1-800-NUTRICION</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-secondary rounded-lg">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Horario de Atención</p>
                  <p className="text-muted-foreground">Disponible las 24 horas, los 7 días de la semana</p>
                </div>
              </div>

              <Button variant="hero" size="lg" className="w-full">
                <Phone className="h-5 w-5 mr-2" />
                Llamar Ahora
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Emergencias;
