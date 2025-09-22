# Hexade - Case Management Portal

A modern, comprehensive case management and hearing platform for legal professionals built with Next.js, TypeScript, and WebRTC.

## 🚀 Features

- **WebRTC Video Hearings**: High-quality video conferencing with adaptive bitrate
- **Real-time Chat**: Secure messaging during hearings with message persistence
- **Document Management**: Secure document storage with e-signing capabilities
- **AI Summarization**: Automated document and case summaries using AI
- **Role-based Access**: Support for Clients, Lawyers, Judges, and Admins
- **Multi-language Support**: English and Hindi with extensible i18n
- **Responsive Design**: Desktop-first with mobile fallback
- **Accessibility**: WCAG AA compliant with screen reader support

## 🛠 Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: JWT with secure HTTP-only cookies
- **File Storage**: AWS S3
- **Real-time**: WebRTC, WebSockets
- **AI**: OpenAI GPT (with mock fallback)
- **Email**: SendGrid
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 15+
- Redis (optional, for background jobs)
- AWS S3 bucket (for document storage)
- SendGrid account (for email notifications)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd hexade-portal
npm install
```

### 2. Environment Setup

Copy the environment template and configure your variables:

```bash
cp env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/hexade_portal?schema=public"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# AWS S3 Configuration
S3_BUCKET="hexade-documents"
S3_REGION="us-east-1"
S3_ACCESS_KEY_ID="your-aws-access-key"
S3_SECRET_ACCESS_KEY="your-aws-secret-key"

# Email Configuration
SENDGRID_API_KEY="your-sendgrid-api-key"
EMAIL_FROM="noreply@hexade.com"

# Application URLs
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# AI Provider (optional)
AI_PROVIDER="mock" # or "openai"
OPENAI_API_KEY="your-openai-api-key"

# Feature Flags
ENABLE_ADMIN="false"
```

### 3. Database Setup

Start PostgreSQL and Redis using Docker Compose:

```bash
docker-compose up -d
```

Run database migrations and seed data:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 👥 Demo Accounts

The seed script creates demo accounts for testing:

- **Judge**: `judge@hexade.com` / `demo123`
- **Lawyer**: `lawyer@hexade.com` / `demo123`  
- **Client**: `client@hexade.com` / `demo123`
- **Admin**: `admin@hexade.com` / `demo123` (if ENABLE_ADMIN=true)

## 📁 Project Structure

```
hexade-portal/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Protected dashboard pages
│   ├── hearing/           # WebRTC hearing rooms
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── lib/                  # Utility libraries
│   ├── auth.ts           # Authentication utilities
│   ├── db.ts             # Database connection
│   └── utils.ts          # General utilities
├── prisma/               # Database schema and migrations
│   ├── schema.prisma     # Prisma schema
│   └── seed.ts           # Seed script
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
└── design/               # Wireframes and design assets
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema changes
npm run db:migrate       # Run migrations
npm run db:deploy        # Deploy migrations (production)
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio

# Testing
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
```

## 🌐 API Documentation

The API is documented using OpenAPI 3.0. View the complete specification at `/openapi.yaml`.

### Key Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `GET /api/lawyers` - Lawyer directory
- `GET /api/cases` - Case management
- `POST /api/signaling` - WebRTC signaling
- `POST /api/documents` - Document upload
- `POST /api/summarize` - AI summarization

## 🚀 Deployment

### Vercel Deployment

1. **Connect Repository**: Link your GitHub repository to Vercel

2. **Environment Variables**: Set all required environment variables in Vercel dashboard:
   - `DATABASE_URL` (use Vercel Postgres or external provider)
   - `JWT_SECRET`
   - `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`
   - `SENDGRID_API_KEY`
   - `NEXT_PUBLIC_APP_URL` (your Vercel domain)

3. **Database Setup**: 
   - Use Vercel Postgres or connect external PostgreSQL
   - Run migrations: `npm run db:deploy`
   - Seed data: `npm run db:seed`

4. **Deploy**: Vercel will automatically deploy on push to main branch

### Production Checklist

- [ ] Set strong `JWT_SECRET`
- [ ] Configure production database
- [ ] Set up S3 bucket with proper permissions
- [ ] Configure SendGrid for email notifications
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS (automatic with Vercel)
- [ ] Configure domain and SSL certificates
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Test all functionality in production environment

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Granular permissions by user role
- **Secure Cookies**: HTTP-only, secure, same-site cookies
- **Input Validation**: Zod schema validation on all inputs
- **SQL Injection Protection**: Prisma ORM with parameterized queries
- **XSS Protection**: React's built-in XSS protection
- **CSRF Protection**: Same-site cookie policy
- **Rate Limiting**: API rate limiting (configurable)
- **File Upload Security**: Type and size validation

## ♿ Accessibility

- **WCAG AA Compliance**: Meets accessibility standards
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **High Contrast Mode**: Support for high contrast displays
- **Focus Management**: Visible focus indicators
- **Color Contrast**: Meets contrast ratio requirements

## 🌍 Internationalization

- **Multi-language Support**: English and Hindi
- **Extensible**: Easy to add more languages
- **RTL Support**: Ready for right-to-left languages
- **Date/Time Localization**: Proper timezone handling

## 📊 Monitoring and Analytics

- **Error Tracking**: Built-in error logging
- **Performance Monitoring**: Core Web Vitals tracking
- **User Analytics**: Optional Google Analytics integration
- **Database Monitoring**: Prisma query logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and `/openapi.yaml`
- **Issues**: Report bugs via GitHub Issues
- **Email**: contact@hexade.com
- **Discord**: [Join our community](https://discord.gg/hexade)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Prisma](https://prisma.io/) - Database ORM
- [WebRTC](https://webrtc.org/) - Real-time communication
- [OpenAI](https://openai.com/) - AI summarization

---

**Built with ❤️ by the Hexade Team**
