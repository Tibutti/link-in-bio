# LinkFolio - Advanced Link in Bio Platform

## Description
LinkFolio is a comprehensive personal branding platform that empowers professionals to create dynamic, interactive digital profiles with advanced collaboration tools. Similar to Linktree but with significantly enhanced features, customization options, and a polished, modern interface designed for professionals and content creators.

## Key Features
- **Profile Management**: Custom profile picture upload and background gradient customization
- **Social Links**: Organized by categories (social networks, knowledge platforms) with drag-and-drop reordering
- **Featured Content**: Showcase your best work with image thumbnails and custom ordering
- **Technology Showcase**: Display your technical skills organized by categories with proficiency levels
- **GitHub Integration**: Show off your contribution statistics with visual calendar display
- **TryHackMe Integration**: Display your security badges and achievements
- **Virtual Business Card Holder**: Scan QR codes to save contact information of other users in a digital address book
- **Issue Tracking**: Built-in system for reporting and managing issues
- **AI-Powered Analysis**: AI assistance for analyzing issues and suggesting solutions using Perplexity API
- **Responsive Design**: Fully mobile-friendly with optimized layouts for all devices
- **Theming**: Dark/light/system theme support with custom UI components
- **Internationalization**: Multi-language support with easy language switching
- **Admin Panel**: Comprehensive control panel for managing all aspects of your profile

## Frontend Technologies
- **Framework**: React.js 18 with TypeScript
- **Styling**: TailwindCSS with custom theming
- **UI Components**: shadcn/ui component library
- **State Management**: TanStack Query (React Query v5)
- **Routing**: Wouter for lightweight routing
- **Forms**: React Hook Form with Zod validation
- **Animations**: Framer Motion for smooth transitions
- **Drag & Drop**: @dnd-kit for sortable interfaces
- **Internationalization**: i18next with language detection
- **HTTP Client**: Custom fetch wrapper with typed responses
- **SVG Icons**: Lucide React and React Icons
- **QR Code**: QRCode.react for QR code generation
- **Data Visualization**: Recharts for GitHub statistics
- **Build Tool**: Vite for fast development and bundling

## Backend Technologies
- **Server**: Node.js with Express
- **Database**: PostgreSQL with connection pooling
- **ORM**: Drizzle ORM with TypeScript integration
- **Schema Validation**: Zod for runtime type checking
- **Authentication**: JWT (jsonwebtoken) with session management
- **Password Security**: bcrypt for secure password hashing
- **File Uploads**: Multer middleware for handling multipart/form-data
- **AI Integration**: Perplexity API for intelligent issue analysis
- **Error Monitoring**: Sentry for error tracking and performance
- **External API Integration**: GitHub contributions API
- **Type Safety**: Shared TypeScript types between frontend and backend

## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL database
- (Optional) Perplexity API key for AI analysis features

### Installation
1. Clone the repository:
```bash
git clone <repository-url>
cd linkfolio
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env` file in the root directory and add:
```
# Database Connection
DATABASE_URL=postgres://<username>:<password>@<host>:<port>/<database>

# Optional integrations
PERPLEXITY_API_KEY=<your-perplexity-api-key> # For AI issue analysis
VITE_SENTRY_DSN=<your-sentry-dsn> # For error monitoring

# File uploads - configure where uploads are stored
UPLOAD_DIR=./uploads
```

4. Create uploads directory:
```bash
mkdir -p uploads/images
```

5. Push the database schema:
```bash
npm run db:push
```

6. Start the development server:
```bash
npm run dev
```

### Usage
- Access the public profile at the root URL: `http://localhost:5000/`
- Access the admin panel at: `http://localhost:5000/login`
  - Demo credentials: Username: `demo`, Password: `demo123`

### Key Admin Features
- **Profile Management**: Edit your basic information and customize your appearance
- **Background Settings**: Choose from preset gradients or create your own custom background
- **Theme Control**: Toggle between light, dark, and system theme modes
- **Content Organization**: Drag and drop to rearrange social links, technologies, and featured content
- **Virtual Contacts**: Manage contacts you've saved through the QR code scanner
- **Issue Management**: Track, analyze and resolve reported issues with AI assistance

## Project Structure
- `/client` - Frontend React application
  - `/src/components` - Reusable UI components
  - `/src/pages` - Page components and routes
  - `/src/hooks` - Custom React hooks
  - `/src/lib` - Utility functions and configurations
  - `/src/components/admin` - Admin panel components
- `/server` - Express backend server
  - API routes for profile, social links, technologies, etc.
  - Authentication middleware and JWT handling
  - File upload processing
  - AI integration with Perplexity
- `/shared` - Shared TypeScript types and database schemas
- `/uploads` - User uploaded files (images, etc.)

## Recent Features and Enhancements
- **Background Gradient Customization**: Choose from presets or create your own custom gradients
- **Theme System Integration**: Dark/light/system theme toggling throughout the application
- **Image Upload System**: Custom profile picture upload and management
- **Virtual Business Card Scanner**: QR code scanning and contact management
- **AI-Powered Issue Analysis**: Integration with Perplexity API for intelligent issue resolution

## Future Development Roadmap
- Enhanced analytics dashboard
- More integration options with third-party platforms
- Advanced customization of profile appearance
- Mobile application companion

## License
This project is licensed under the MIT License - see the LICENSE file for details.