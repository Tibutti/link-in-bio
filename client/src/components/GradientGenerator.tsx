import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { GRADIENT_PRESETS, GRADIENT_DIRECTIONS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { type Profile } from "@shared/schema";

interface GradientGeneratorProps {
  profile: Profile;
}

type GradientSettings = {
  colorFrom: string;
  colorTo: string;
  direction: string;
};

export default function GradientGenerator({ profile }: GradientGeneratorProps) {
  // Get initial gradient from profile or use default
  const defaultGradient: GradientSettings = {
    colorFrom: "#3b82f6",
    colorTo: "#8b5cf6",
    direction: "to-br",
  };

  // Initialize gradient state with profile data or default
  const [gradient, setGradient] = useState<GradientSettings>(
    profile.backgroundGradient || defaultGradient
  );
  
  const [activeTab, setActiveTab] = useState<"presets" | "custom">("presets");
  const [previewOpen, setPreviewOpen] = useState(false);

  // Update mutation
  const updateGradientMutation = useMutation({
    mutationFn: async (newGradient: GradientSettings) => {
      return await apiRequest("PATCH", `/api/profile/${profile.id}`, {
        backgroundGradient: newGradient,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
    },
  });

  // Reset gradient when profile changes
  useEffect(() => {
    if (profile.backgroundGradient) {
      setGradient(profile.backgroundGradient);
    }
  }, [profile]);

  // Handle preset selection
  const handlePresetSelect = (preset: typeof GRADIENT_PRESETS[0]) => {
    setGradient({
      colorFrom: preset.colorFrom,
      colorTo: preset.colorTo,
      direction: preset.direction,
    });
  };

  // Handle saving gradient
  const handleSaveGradient = () => {
    updateGradientMutation.mutate(gradient);
  };

  // Generate CSS gradient style
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
    <motion.div
      className="mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <h2 className="text-xl font-semibold mb-4">Background Gradient</h2>
      
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
        <div className="flex flex-col gap-6">
          {/* Preview */}
          <div 
            className="h-32 w-full rounded-md flex items-center justify-center"
            style={gradientStyle}
          >
            <span className="text-white drop-shadow-md font-semibold">
              {profile.name}
            </span>
          </div>

          <Tabs 
            value={activeTab} 
            onValueChange={(v) => setActiveTab(v as "presets" | "custom")}
            className="w-full"
          >
            <TabsList className="mb-4">
              <TabsTrigger value="presets">Presets</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>

            <TabsContent value="presets" className="space-y-4">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {GRADIENT_PRESETS.map((preset) => (
                  <div 
                    key={preset.id}
                    className={cn(
                      "h-20 rounded-md cursor-pointer p-1 transition-all",
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
                  <Label htmlFor="colorFrom">From Color</Label>
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
                  <Label htmlFor="colorTo">To Color</Label>
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
                <Label>Direction</Label>
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
            disabled={updateGradientMutation.isPending}
            className="w-full"
          >
            {updateGradientMutation.isPending ? "Saving..." : "Save Gradient"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}