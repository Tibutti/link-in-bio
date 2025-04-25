import express, { Express, Request, Response } from 'express';
import { authenticateToken } from './auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from './db';
import { issueImages } from '@shared/schema';
import { captureException } from './sentry';
import { eq } from 'drizzle-orm';

// Pozyskaj ścieżkę do bieżącego pliku i katalogu
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Konfiguracja miejsca przechowywania plików
const uploadDir = path.resolve('./uploads');

// Sprawdzenie czy katalog istnieje, jeśli nie - utwórz go
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Tymczasowe przechowywanie w pamięci
const memoryStorage = multer.memoryStorage();

// Skonfiguruj multer z ograniczeniami
const upload = multer({
  storage: memoryStorage, // Używamy pamięci zamiast dysku
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

// Funkcja pomocnicza do tworzenia unikalnej nazwy pliku
function generateUniqueFilename(originalname: string): string {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const ext = path.extname(originalname);
  return `issue-image-${uniqueSuffix}${ext}`;
}

// Funkcja pomocnicza do konwersji Buffer na base64
function bufferToBase64(buffer: Buffer, mimetype: string): string {
  return `data:${mimetype};base64,${buffer.toString('base64')}`;
}

export function registerUploadRoutes(app: Express) {
  // Endpoint do przesyłania obrazów
  app.post('/api/upload/image', authenticateToken, upload.single('image'), async (req: any, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Nie przesłano pliku" });
      }

      const filename = generateUniqueFilename(req.file.originalname);
      
      // 1. Zapisujemy plik na dysku (dla kompatybilności wstecznej)
      fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer);
      
      // 2. Zapisujemy dane binarne do bazy danych
      const base64Data = bufferToBase64(req.file.buffer, req.file.mimetype);
      const [imageRecord] = await db.insert(issueImages).values({
        fileName: filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        binaryData: base64Data,
        size: req.file.size
      }).returning();
      
      // Zwracamy ścieżkę dostępu do pliku oraz ID obrazu w bazie danych
      const filePath = `/uploads/${filename}`;
      res.json({ 
        url: filePath,
        filename: filename,
        originalname: req.file.originalname,
        size: req.file.size,
        imageId: imageRecord.id
      });
    } catch (error: any) {
      console.error('Error uploading file:', error);
      captureException(error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Endpoint do pobierania obrazów po ID
  app.get('/api/images/:imageId', async (req: Request, res: Response) => {
    try {
      const imageId = parseInt(req.params.imageId);
      if (isNaN(imageId)) {
        return res.status(400).json({ error: "Nieprawidłowe ID obrazu" });
      }
      
      // Pobierz obraz z bazy danych
      const [image] = await db.select().from(issueImages).where(eq(issueImages.id, imageId));
      
      if (!image) {
        return res.status(404).json({ error: "Obraz nie znaleziony" });
      }
      
      // Wykrywamy typ MIME z danych base64
      let contentType = image.mimeType;
      if (!contentType) {
        // Wyciągamy typ MIME z nagłówka base64
        const mimeMatch = image.binaryData.match(/^data:([^;]+);base64,/);
        contentType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
      }
      
      // Wyodrębniamy dane base64 bez nagłówka
      const base64Data = image.binaryData.replace(/^data:[^;]+;base64,/, '');
      
      // Konwertujemy base64 na buffer
      const imageBuffer = Buffer.from(base64Data, 'base64');
      
      // Ustawiamy typ zawartości i zwracamy dane
      res.set('Content-Type', contentType);
      res.send(imageBuffer);
    } catch (error: any) {
      console.error('Error fetching image:', error);
      captureException(error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Funkcja middleware do próby pobrania zdjęcia z bazy danych, jeśli nie ma go na dysku
  app.use('/uploads/:filename', async (req: Request, res: Response, next) => {
    // Sprawdzamy czy plik istnieje na dysku
    const filePath = path.join(uploadDir, req.params.filename);
    
    if (fs.existsSync(filePath)) {
      // Plik istnieje na dysku, kontynuujemy do statycznego serwowania
      return next();
    }
    
    try {
      // Plik nie istnieje, próbujemy pobrać z bazy danych
      const [image] = await db.select().from(issueImages).where(eq(issueImages.fileName, req.params.filename));
      
      if (!image) {
        // Obraz nie znaleziony w bazie danych, przechodzimy dalej
        return next();
      }
      
      // Wyodrębniamy dane base64 bez nagłówka
      const base64Data = image.binaryData.replace(/^data:[^;]+;base64,/, '');
      
      // Konwertujemy base64 na buffer
      const imageBuffer = Buffer.from(base64Data, 'base64');
      
      // Zapisujemy plik na dysku dla przyszłych żądań
      fs.writeFileSync(filePath, imageBuffer);
      
      // Ustawiamy typ zawartości i zwracamy dane
      res.set('Content-Type', image.mimeType);
      res.send(imageBuffer);
    } catch (error: any) {
      console.error('Error recovering image from database:', error);
      captureException(error);
      // Kontynuujemy do statycznego serwowania w przypadku błędu
      next();
    }
  });
  
  // Statyczne serwowanie plików
  app.use('/uploads', express.static(uploadDir));
}