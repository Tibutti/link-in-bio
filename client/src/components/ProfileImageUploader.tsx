import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PROFILE_IMAGES } from '@/lib/constants';
import { apiRequest } from '@/lib/queryClient';
import { Upload, X, Check, Image as ImageIcon } from 'lucide-react';
import { Profile } from '@shared/schema';

interface ProfileImageUploaderProps {
  profileId: number;
  currentImageIndex: number;
  customImageUrl: string | null;
  onImageChange: (data: { imageIndex?: number, customImageUrl?: string }) => void;
}

export default function ProfileImageUploader({
  profileId,
  currentImageIndex,
  customImageUrl,
  onImageChange,
}: ProfileImageUploaderProps) {
  const [selectedIndex, setSelectedIndex] = useState(currentImageIndex);
  const [selectedTab, setSelectedTab] = useState(customImageUrl ? 'custom' : 'preset');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(customImageUrl);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Obsługa wyboru predefiniowanego zdjęcia
  const handleSelectPreset = (index: number) => {
    setSelectedIndex(index);
    setError(null);
  };

  // Obsługa zapisu predefiniowanego zdjęcia
  const handleSavePreset = async () => {
    if (selectedIndex === currentImageIndex && selectedTab === 'preset') return;
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await apiRequest(`/api/profile/${profileId}/image`, {
        method: 'PATCH',
        body: JSON.stringify({ imageIndex: selectedIndex }),
      });
      
      const updatedProfile = await response.json();
      onImageChange({ imageIndex: selectedIndex, customImageUrl: null });
      setSuccess('Zdjęcie profilowe zostało zaktualizowane');
      setSelectedTab('preset');
    } catch (error) {
      console.error("Błąd podczas aktualizacji zdjęcia profilowego:", error);
      setError('Wystąpił błąd podczas zapisywania zdjęcia');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Obsługa kliknięcia przycisku wyboru pliku
  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Obsługa wyboru pliku
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setError(null);
    
    // Sprawdzenie typu pliku
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Dozwolone są tylko pliki obrazów (jpg, png, gif, webp)');
      return;
    }
    
    // Sprawdzenie rozmiaru pliku (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Maksymalny rozmiar pliku to 5MB');
      return;
    }
    
    // Tworzenie URL do podglądu
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    
    // Przełączenie na niestandardową zakładkę
    setSelectedTab('custom');
    
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  };

  // Obsługa usunięcia wybranego pliku
  const handleRemoveFile = () => {
    setPreviewUrl(customImageUrl);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Obsługa przesyłania niestandardowego zdjęcia
  const handleUploadCustomImage = async () => {
    if (!fileInputRef.current?.files?.length) {
      setError('Wybierz plik zdjęcia');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    const formData = new FormData();
    formData.append('profileImage', fileInputRef.current.files[0]);
    
    try {
      const response = await fetch(`/api/profile/${profileId}/upload-image`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Błąd HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Zaktualizuj stan komponentu
      onImageChange({ customImageUrl: data.imageUrl });
      setSuccess('Niestandardowe zdjęcie profilowe zostało zaktualizowane');
    } catch (error) {
      console.error("Błąd podczas przesyłania niestandardowego zdjęcia:", error);
      setError('Wystąpił błąd podczas przesyłania zdjęcia');
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
        <Tabs defaultValue={selectedTab} value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="preset" className="w-1/2">Predefiniowane</TabsTrigger>
            <TabsTrigger value="custom" className="w-1/2">Własne zdjęcie</TabsTrigger>
          </TabsList>
          
          <TabsContent value="preset">
            <div className="grid grid-cols-3 gap-4 mb-4">
              {PROFILE_IMAGES.map((image, index) => (
                <div 
                  key={index}
                  className={`
                    relative cursor-pointer rounded-md overflow-hidden border-2 transition-all
                    ${selectedIndex === index ? 'border-primary shadow-md' : 'border-muted hover:border-muted-foreground'}
                  `}
                  onClick={() => handleSelectPreset(index)}
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
              onClick={handleSavePreset} 
              disabled={selectedIndex === currentImageIndex && selectedTab === 'preset' || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Zapisywanie..." : "Zapisz zmiany"}
            </Button>
          </TabsContent>
          
          <TabsContent value="custom">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-32 h-32 mx-auto mb-2">
                {previewUrl ? (
                  <div className="relative group">
                    <img 
                      src={previewUrl} 
                      alt="Podgląd" 
                      className="w-32 h-32 rounded-full object-cover border-2 border-primary"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-2 border-dashed border-gray-400">
                    <ImageIcon className="h-10 w-10 text-gray-400" />
                  </div>
                )}
              </div>
              
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              
              <Button 
                type="button"
                onClick={handleFileButtonClick}
                variant="outline"
                className="w-full mb-2"
              >
                <Upload className="mr-2 h-4 w-4" />
                Wybierz zdjęcie
              </Button>
              
              <Button
                type="button"
                onClick={handleUploadCustomImage}
                disabled={!previewUrl || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "Przesyłanie..." : "Prześlij zdjęcie"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="mt-4 bg-green-50 border-green-200 text-green-800">
            <Check className="h-4 w-4 mr-2" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}