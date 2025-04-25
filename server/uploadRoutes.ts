import express, { Express, Request, Response } from 'express';
import { authenticateToken } from './auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Pozyskaj ścieżkę do bieżącego pliku i katalogu
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Konfiguracja miejsca przechowywania plików
const uploadDir = path.resolve('./uploads');

// Sprawdzenie czy katalog istnieje, jeśli nie - utwórz go
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfiguracja multera
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    // Generuj unikalną nazwę pliku z oryginalną końcówką
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `issue-image-${uniqueSuffix}${ext}`);
  }
});

// Skonfiguruj multer z ograniczeniami
const upload = multer({
  storage: storage,
  fileFilter: function(req, file, cb) {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Niedozwolony format pliku. Obsługiwane formaty to: JPG, PNG, GIF, WEBP.'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  }
});

export function registerUploadRoutes(app: Express) {
  // Endpoint do przesyłania obrazów
  app.post('/api/upload/image', authenticateToken, upload.single('image'), (req: any, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Nie przesłano pliku" });
      }

      // Zwraca ścieżkę dostępu do pliku
      const filePath = `/uploads/${req.file.filename}`;
      res.json({ 
        url: filePath,
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size
      });
    } catch (error: any) {
      console.error('Error uploading file:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Statyczne serwowanie plików
  app.use('/uploads', express.static(uploadDir));
}