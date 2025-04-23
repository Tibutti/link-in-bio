import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PROFILE_IMAGES } from "@/lib/constants";
import { apiRequest } from "@/lib/queryClient";

interface ProfileImageSelectorProps {
  profileId: number;
  currentImageIndex: number;
  onImageChange: (newIndex: number) => void;
}

export default function ProfileImageSelector({ 
  profileId, 
  currentImageIndex, 
  onImageChange 
}: ProfileImageSelectorProps) {
  const [selectedIndex, setSelectedIndex] = useState(currentImageIndex);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelect = (index: number) => {
    setSelectedIndex(index);
  };

  const handleSubmit = async () => {
    if (selectedIndex === currentImageIndex) return;
    
    setIsSubmitting(true);
    try {
      await apiRequest(`/api/profile/${profileId}/image`, {
        method: 'PATCH',
        body: JSON.stringify({ imageIndex: selectedIndex }),
      });
      
      onImageChange(selectedIndex);
    } catch (error) {
      console.error("Błąd podczas aktualizacji zdjęcia profilowego:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Zdjęcie profilowe</CardTitle>
        <CardDescription>
          Wybierz zdjęcie, które będzie wyświetlane jako Twoje zdjęcie profilowe
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          {PROFILE_IMAGES.map((image, index) => (
            <div 
              key={index}
              className={`
                relative cursor-pointer rounded-md overflow-hidden border-2 transition-all
                ${selectedIndex === index ? 'border-primary shadow-md' : 'border-muted hover:border-muted-foreground'}
              `}
              onClick={() => handleSelect(index)}
            >
              <img 
                src={image.url} 
                alt={image.alt} 
                className="w-full h-auto aspect-square object-cover"
              />
              {selectedIndex === index && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <div className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                    Wybrane
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <Button 
          onClick={handleSubmit} 
          disabled={selectedIndex === currentImageIndex || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Zapisywanie..." : "Zapisz zmiany"}
        </Button>
      </CardContent>
    </Card>
  );
}