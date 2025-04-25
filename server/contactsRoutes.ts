import { Request, Response } from 'express';
import { Express } from 'express';
import { storage } from './storage';
import { insertContactSchema } from '@shared/schema';
import { authenticateToken } from './auth';

export function registerContactsRoutes(app: Express) {
  // Pobierz wszystkie kontakty użytkownika
  app.get('/api/contacts', authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const contacts = await storage.getUserContacts(userId);
      res.json(contacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      res.status(500).json({ error: "Nie udało się pobrać kontaktów" });
    }
  });

  // Dodaj nowy kontakt do wizytownika
  app.post('/api/contacts', authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const data = insertContactSchema.parse({ ...req.body, userId });
      const contact = await storage.addContact(data);
      res.status(201).json(contact);
    } catch (error) {
      console.error('Error adding contact:', error);
      res.status(400).json({ error: "Nie udało się dodać kontaktu" });
    }
  });

  // Pobierz szczegóły kontaktu
  app.get('/api/contacts/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
      const contactId = parseInt(req.params.id);
      const contact = await storage.getContact(contactId);
      
      if (!contact) {
        return res.status(404).json({ error: "Kontakt nie istnieje" });
      }
      
      if (contact.userId !== req.user?.userId) {
        return res.status(403).json({ error: "Brak dostępu do tego kontaktu" });
      }
      
      res.json(contact);
    } catch (error) {
      console.error('Error fetching contact:', error);
      res.status(500).json({ error: "Nie udało się pobrać kontaktu" });
    }
  });

  // Zaktualizuj kontakt
  app.patch('/api/contacts/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
      const contactId = parseInt(req.params.id);
      const contact = await storage.getContact(contactId);
      
      if (!contact) {
        return res.status(404).json({ error: "Kontakt nie istnieje" });
      }
      
      if (contact.userId !== req.user?.userId) {
        return res.status(403).json({ error: "Brak dostępu do tego kontaktu" });
      }
      
      const updatedContact = await storage.updateContact(contactId, req.body);
      res.json(updatedContact);
    } catch (error) {
      console.error('Error updating contact:', error);
      res.status(500).json({ error: "Nie udało się zaktualizować kontaktu" });
    }
  });

  // Usuń kontakt
  app.delete('/api/contacts/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
      const contactId = parseInt(req.params.id);
      const contact = await storage.getContact(contactId);
      
      if (!contact) {
        return res.status(404).json({ error: "Kontakt nie istnieje" });
      }
      
      if (contact.userId !== req.user?.userId) {
        return res.status(403).json({ error: "Brak dostępu do tego kontaktu" });
      }
      
      await storage.deleteContact(contactId);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting contact:', error);
      res.status(500).json({ error: "Nie udało się usunąć kontaktu" });
    }
  });
}