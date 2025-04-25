import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { GRADIENT_PRESETS, GRADIENT_DIRECTIONS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

interface GradientSettings {
  colorFrom: string;
  colorTo: string;
  direction: string;
}

interface BackgroundGradientManagerProps {
  profileId: number;
  backgroundGradient: GradientSettings | null;
  onSuccess: () => void;
}

export default function BackgroundGradientManager({
  profileId,
  backgroundGradient,
  onSuccess
}: BackgroundGradientManagerProps) {
  // Domyślny gradient
  const defaultGradient: GradientSettings = {
    colorFrom: "#3b82f6",
    colorTo: "#8b5cf6",
    direction: "to-br",
  };

  // Inicjalizacja stanu gradientu
  const [gradient, setGradient] = useState<GradientSettings>(
    backgroundGradient || defaultGradient
  );
  
  const [activeTab, setActiveTab] = useState<"presets" | "custom">(
    backgroundGradient ? "custom" : "presets"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Resetowanie gradientu gdy zmienia się props
  useEffect(() => {
    if (backgroundGradient) {
      setGradient(backgroundGradient);
    }
  }, [backgroundGradient]);

  // Obsługa wyboru presetu
  const handlePresetSelect = (preset: typeof GRADIENT_PRESETS[0]) => {
    setGradient({
      colorFrom: preset.colorFrom,
      colorTo: preset.colorTo,
      direction: preset.direction,
    });
  };

  // Obsługa zapisu gradientu
  const handleSaveGradient = async () => {
    setIsSubmitting(true);
    
    try {
      await apiRequest(`/api/profile/${profileId}`, {
        method: 'PATCH',
        body: JSON.stringify({ backgroundGradient: gradient }),
      });
      
      toast({
        title: 'Sukces',
        description: 'Gradient tła został zapisany',
      });
      
      onSuccess();
    } catch (error) {
      console.error("Błąd podczas zapisywania gradientu tła:", error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się zapisać gradientu tła',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generowanie stylu CSS dla gradientu
  const gradientStyle = {
    background: `linear-gradient(${
      gradient.direction === "to-r" ? "to right" :
      gradient.direction === "to-l" ? "to left" :
      gradient.direction === "to-b" ? "to bottom" :
      gradient.direction === "to-t" ? "to top" :
      gradient.direction === "to-tr" ? "to top right" :
      gradient.direction === "to-tl" ? "to top left" :
      gradient.direction === "to-br" ? "to bottom right" :
      "to bottom left"
    }, ${gradient.colorFrom}, ${gradient.colorTo})`,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gradient tła</CardTitle>
        <CardDescription>
          Dostosuj wygląd tła strony
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          {/* Podgląd */}
          <div 
            className="h-32 w-full rounded-md flex items-center justify-center"
            style={gradientStyle}
          >
            <span className="text-white drop-shadow-md font-semibold">
              Podgląd gradientu
            </span>
          </div>

          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={(v) => setActiveTab(v as "presets" | "custom")}>
            <TabsList className="w-full mb-4">
              <TabsTrigger value="presets" className="w-1/2">Presety</TabsTrigger>
              <TabsTrigger value="custom" className="w-1/2">Własny</TabsTrigger>
            </TabsList>
            
            <TabsContent value="presets" className="space-y-4">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {GRADIENT_PRESETS.map((preset) => (
                  <div 
                    key={preset.id}
                    className={cn(
                      "h-20 rounded-md cursor-pointer p-1 transition-all hover:ring-1 hover:ring-primary/50",
                      gradient.colorFrom === preset.colorFrom && 
                      gradient.colorTo === preset.colorTo &&
                      "ring-2 ring-primary"
                    )}
                    style={{
                      background: `linear-gradient(${
                        preset.direction === "to-r" ? "to right" :
                        preset.direction === "to-l" ? "to left" :
                        preset.direction === "to-b" ? "to bottom" :
                        preset.direction === "to-t" ? "to top" :
                        preset.direction === "to-tr" ? "to top right" :
                        preset.direction === "to-tl" ? "to top left" :
                        preset.direction === "to-br" ? "to bottom right" :
                        "to bottom left"
                      }, ${preset.colorFrom}, ${preset.colorTo})`,
                    }}
                    onClick={() => handlePresetSelect(preset)}
                  >
                    <div className="h-full flex items-end justify-start">
                      <span className="text-xs text-white drop-shadow-md font-medium p-1">
                        {preset.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="custom" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="colorFrom">Kolor początkowy</Label>
                  <div className="flex gap-2 items-center">
                    <div 
                      className="w-8 h-8 rounded-md border"
                      style={{ backgroundColor: gradient.colorFrom }}
                    />
                    <Input
                      id="colorFrom"
                      type="text"
                      value={gradient.colorFrom}
                      onChange={(e) => setGradient({ ...gradient, colorFrom: e.target.value })}
                      className="flex-1"
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="colorTo">Kolor końcowy</Label>
                  <div className="flex gap-2 items-center">
                    <div 
                      className="w-8 h-8 rounded-md border"
                      style={{ backgroundColor: gradient.colorTo }}
                    />
                    <Input
                      id="colorTo"
                      type="text"
                      value={gradient.colorTo}
                      onChange={(e) => setGradient({ ...gradient, colorTo: e.target.value })}
                      className="flex-1"
                      placeholder="#8b5cf6"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Kierunek</Label>
                <RadioGroup 
                  value={gradient.direction} 
                  onValueChange={(v) => setGradient({ ...gradient, direction: v })}
                  className="grid grid-cols-2 md:grid-cols-4 gap-2"
                >
                  {GRADIENT_DIRECTIONS.map((direction) => (
                    <div key={direction.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={direction.value} id={direction.id} />
                      <Label htmlFor={direction.id} className="text-sm cursor-pointer">
                        {direction.name}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </TabsContent>
          </Tabs>

          <Button 
            onClick={handleSaveGradient}
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Zapisywanie..." : "Zapisz gradient"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}