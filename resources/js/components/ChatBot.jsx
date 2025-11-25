import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "¡Hola! Soy tu asistente virtual de Nutri System. ¿En qué puedo ayudarte hoy?"
    }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage = { role: "user", content: input };
    setMessages([...messages, newMessage]);
    
    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "Entiendo tu consulta sobre nutrición. Te recomiendo hablar con uno de nuestros nutricionistas certificados para obtener un plan personalizado.",
        "Excelente pregunta. Puedes encontrar más información en nuestra sección de Recursos o agendar una consulta con un especialista.",
        "Te puedo ayudar con eso. ¿Te gustaría explorar nuestros planes nutricionales o hablar directamente con un nutricionista?",
        "Gracias por tu consulta. Para brindarte la mejor atención, te sugiero revisar nuestras recetas saludables o contactar a nuestro equipo de emergencia si es urgente."
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setMessages(prev => [...prev, { role: "assistant", content: randomResponse }]);
    }, 1000);

    setInput("");
  };
  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl z-50"
        variant="hero"
        size="icon"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-96 h-[500px] shadow-2xl z-50 flex flex-col border-2 border-primary">
          <CardHeader className="bg-gradient-primary text-primary-foreground rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <CardTitle>Asistente Virtual</CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  Siempre disponible para ayudarte
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Escribe tu mensaje..."
                  className="flex-1"
                />
                <Button onClick={handleSend} size="icon" variant="default">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default ChatBot;
