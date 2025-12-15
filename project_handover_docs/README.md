# HostelPulse - Hostel Management System

A minimal, stable Next.js 15 foundation (clean slate). Core hostel features will be added back incrementally.

## Features

- **Real-time Room Management** - View all rooms with current occupation status at a glance
- **Booking Management** - Create, view, and cancel bookings with automatic validation
- **Mobile-First Design** - Touch-optimized interface for tablets and phones
- **Automatic Occupation Calculation** - Real-time bed availability based on active bookings
- **Browser-Based** - No app installation required, works in any modern browser

## Tech Stack

- **Frontend**: Next.js 15 (App Router)
- **Backend**: Next.js API Routes (minimal stub)
- **Database**: Prisma (not wired yet)
- **Styling**: Global CSS (no Tailwind/Daisy)
- **Deployment**: Vercel/Docker (standard Next.js 15)

## Getting Started

### Prerequisites

- Node.js 20 LTS (`mise install` will set Node 20.18.1 / pnpm 10.23.0)
- npm or pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hostelpulse-clean
mise install # ensures Node 20.18.1 and pnpm 10.23.0 if you use mise
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your database URL:
```
DATABASE_URL="postgresql://username:password@localhost:5432/hostelpulse"
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Deployment & Demo Setup

### Deploying to Vercel for Prospects

This guide shows how to create preview links for potential hostel owner customers.

#### 1. Initial Vercel Setup

1. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with GitHub
   - Import your repository
   - Vercel will auto-detect Next.js settings

2. **Configure Environment Variables**:
   - In Vercel dashboard → Project Settings → Environment Variables
   - Add `DATABASE_URL` with your production PostgreSQL connection string
   - For demos, you can use a free PostgreSQL service like:
     - [Supabase](https://supabase.com) (free tier)
     - [Railway](https://railway.app) (free tier)
     - [Neon](https://neon.tech) (free tier)

3. **Deploy**:
   - Push to main branch triggers automatic deployment
   - Get your production URL: `https://your-project.vercel.app`

#### 2. Creating Demo Environments for Prospects

**Option A: Branch-based Previews (Recommended)**

1. **Create demo branches**:
```bash
# Create a demo branch for each prospect
git checkout -b demo/prospect-hotel-name
git push origin demo/prospect-hotel-name
```

2. **Customize for prospect**:
   - Update hotel name in `app/(dashboard)/layout.tsx`
   - Add sample data relevant to their property size
   - Customize branding colors if needed

3. **Vercel automatically creates preview URLs**:
   - Each branch gets: `https://hostelpulse-clean-git-demo-prospect-hotel-name-yourusername.vercel.app`
   - Share this URL directly with prospects

**Option B: Multiple Vercel Projects**

1. **Create separate Vercel projects**:
   - Fork repository for each major prospect
   - Deploy each fork as separate Vercel project
   - Customize each deployment independently

#### 3. Demo Data Setup

Create realistic demo data for prospects:

```bash
# Add to your database seed script
npx prisma db seed
```

**Sample data should include**:
- 5-10 rooms of different types (dorms, private rooms)
- Current bookings showing realistic occupation
- Upcoming check-ins/check-outs
- Mix of booking statuses (confirmed, pending, checked-in)

#### 4. Prospect Demo Workflow

**Before the Demo**:
1. Create prospect-specific branch
2. Customize with their hotel name
3. Add realistic room/booking data for their property size
4. Test the preview URL thoroughly

**During the Demo**:
1. Share the preview URL: `https://your-demo-url.vercel.app`
2. Walk through key features:
   - Dashboard overview
   - Room management
   - Booking creation/management
   - Mobile responsiveness (test on phone/tablet)

**Demo Script Example**:
```
"Here's a live demo customized for [Hotel Name]. 
You can access this anytime at [preview-url].

Let me show you how you'd manage your [X] rooms and current bookings..."
```

#### 5. Production Deployment Checklist

Before going live with a customer:

- [ ] Set up production database with backups
- [ ] Configure custom domain (optional)
- [ ] Set up monitoring (Vercel Analytics)
- [ ] Enable authentication/user management
- [ ] Configure email notifications (if needed)
- [ ] Set up SSL certificate (automatic with Vercel)
- [ ] Test on multiple devices/browsers

#### 6. Maintenance & Updates

**For ongoing demos**:
- Keep demo branches updated with latest features
- Refresh demo data monthly
- Monitor Vercel usage limits
- Archive old prospect demos

**For production customers**:
- Use Vercel's production branch protection
- Set up staging environment for testing updates
- Monitor performance and usage

### Environment Variables Reference

```bash
# Required
DATABASE_URL="postgresql://..."

# Optional (for production)
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-secret-key"
```

### Database Schema

The application uses Prisma with PostgreSQL. Key models:
- `Property` - Hostel/hotel information
- `Room` - Individual rooms with bed counts
- `Booking` - Guest reservations
- `BookingBed` - Bed assignments within rooms
- `Guest` - Guest information

## Development

### Project Structure

```
app/
├── (dashboard)/          # Dashboard pages
│   ├── rooms/           # Room management
│   ├── bookings/        # Booking management
│   └── page.tsx         # Dashboard home
├── actions/             # Server actions
├── components/          # Reusable UI components
└── lib/                 # Utilities and database
```

### Key Features Implementation Status

- ✅ Database schema and models
- ✅ Basic UI components and layout
- ✅ Dashboard with key metrics
- 🚧 Room and booking CRUD operations (in progress)
- 🚧 Real-time occupation calculation (in progress)
- ⏳ Authentication and multi-tenancy
- ⏳ Advanced reporting and analytics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary software. All rights reserved.

## Support

For technical support or sales inquiries:
- Email: support@hostelpulse.com
- Demo requests: demo@hostelpulse.com
