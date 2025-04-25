# Link in Bio Application

## Description
A dynamic "link in bio" platform that offers comprehensive social link and technology management with enhanced user customization and interactive profile experience. Similar to Linktree, but with more features, customization, and a clean, modern design.

## Key Features
- User profile management with customizable appearance
- Social media links organized by categories (social networks, knowledge platforms)
- Featured content with image thumbnails
- GitHub statistics integration
- TryHackMe badge display
- Technical skills showcase with categories and proficiency levels
- Fully responsive design
- Dark/light theme support
- Internationalization (language switching)
- Admin panel for content management

## Technologies
- **Frontend**: React.js with TypeScript, TailwindCSS, shadcn/ui components
- **Backend**: Node.js/Express
- **Database**: PostgreSQL with Drizzle ORM
- **State Management**: TanStack Query (React Query)
- **Authentication**: JWT with bcrypt password hashing
- **Error Monitoring**: Sentry
- **Animation**: Framer Motion
- **Internationalization**: i18next

## Getting Started

### Prerequisites
- Node.js (v16+)
- PostgreSQL database

### Installation
1. Clone the repository:
```bash
git clone <repository-url>
cd link-in-bio
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env` file in the root directory and add:
```
DATABASE_URL=postgres://<username>:<password>@<host>:<port>/<database>
VITE_SENTRY_DSN=<your-sentry-dsn> # Optional
```

4. Push the database schema:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

### Usage
- Access the public profile at the root URL: `http://localhost:5000/`
- Access the admin panel at: `http://localhost:5000/login`
  - Demo credentials: Username: `demo`, Password: `demo123`

## Project Structure
- `/client` - Frontend React application
- `/server` - Express backend server
- `/shared` - Shared TypeScript types and schemas

## License
This project is licensed under the MIT License - see the LICENSE file for details.