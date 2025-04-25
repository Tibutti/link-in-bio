import { Request, Response, Express } from 'express';
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { storage } from './storage';
import { authenticateToken } from './auth';

// W ES Modules musimy stworzyć __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Konfiguracja zapisu plików
const uploadsDir = path.join(__dirname, '../uploads');

// Upewniamy się, że katalog istnieje
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage_config = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage_config,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (_req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    
    cb(new Error('Tylko pliki obrazów są dozwolone (jpeg, jpg, png, gif, webp)'));
  }
});

export function registerUploadRoutes(app: Express) {
  // Endpoint do przesyłania zdjęcia profilowego
  app.post('/api/profile/:id/upload-image', authenticateToken, upload.single('profileImage'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Nie przesłano pliku' });
      }
      
      const profileId = parseInt(req.params.id);
      
      // Sprawdzamy czy profil istnieje
      const profile = await storage.getProfile(profileId);
      if (!profile) {
        return res.status(404).json({ message: 'Profil nie znaleziony' });
      }
      
      // Tworzymy publiczny URL do zdjęcia (względem serwera)
      const imageUrl = `/uploads/${req.file.filename}`;
      
      // Aktualizujemy profil z nowym URL zdjęcia
      const updatedProfile = await storage.updateProfile(profileId, { 
        customImageUrl: imageUrl
      });
      
      res.json({ 
        success: true, 
        profile: updatedProfile,
        imageUrl
      });
    } catch (error) {
      console.error('Błąd podczas przesyłania zdjęcia:', error);
      res.status(500).json({ 
        message: 'Wystąpił błąd podczas przesyłania zdjęcia', 
        error: (error as Error).message 
      });
    }
  });

  // Endpoint do serwowania plików ze statycznego katalogu uploads
  app.use('/uploads', express.static(uploadsDir));
}