# Oncotrition Project Structure Documentation

## Overview
Oncotrition is a comprehensive nutrition website built with Next.js 14, featuring a public-facing site and a complete admin dashboard for content management. The project uses Supabase for backend services and implements modern web development practices.

## Tech Stack

### Core Technologies
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Payment**: M-Pesa Integration

### Key Dependencies
- **UI Components**: Radix UI, Headless UI, Lucide React
- **Form Handling**: React Hook Form
- **State Management**: React Context
- **Drag & Drop**: @hello-pangea/dnd
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns

## Project Structure

```
oncotrition/
├── app/                          # Next.js App Router
│   ├── (site)/                   # Public website routes
│   │   ├── about/
│   │   ├── contact/
│   │   ├── features/
│   │   ├── login/
│   │   ├── mentorship/
│   │   ├── smartspoon/
│   │   ├── layout.tsx            # Site layout wrapper
│   │   └── page.tsx              # Homepage
│   ├── admin/                    # Admin dashboard
│   │   ├── pages/                # Admin page routes
│   │   │   ├── about/
│   │   │   ├── contact/
│   │   │   ├── documents/
│   │   │   ├── features/
│   │   │   ├── footer/
│   │   │   ├── home/
│   │   │   ├── mentorship/
│   │   │   ├── navbar/
│   │   │   └── smartspoon/
│   │   ├── login/
│   │   ├── settings/
│   │   ├── layout.tsx            # Admin layout with auth
│   │   └── page.tsx              # Admin dashboard
│   ├── api/                      # API routes
│   │   ├── admin/
│   │   ├── mentorship/
│   │   ├── mpesa/
│   │   └── callback/
│   ├── auth/                     # Authentication pages
│   ├── terms/                    # Terms and conditions
│   ├── globals.css
│   └── layout.tsx                # Root layout
├── components/                   # React components
│   ├── admin/                    # Admin-specific components (57 files)
│   │   ├── about/
│   │   ├── contact/
│   │   ├── features/
│   │   ├── footer/
│   │   ├── home/
│   │   ├── mentorship/
│   │   ├── pricing/
│   │   ├── smartspoon/
│   │   ├── Dashboard.tsx
│   │   ├── Sidebar.tsx
│   │   └── AdminWrapper.tsx
│   ├── about/                    # About page components
│   ├── contact/                  # Contact page components
│   ├── features/                 # Features page components
│   ├── mentorship/               # Mentorship components
│   ├── smartspoon/               # SmartSpoon components
│   ├── navigation/               # Navigation components
│   ├── ui/                       # Reusable UI components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Features.tsx
│   └── HeroSlider.tsx
├── supabase/                     # Supabase configuration
│   ├── migrations/               # Database migrations (72 files)
│   └── config.toml
├── lib/                          # Utility libraries
├── hooks/                        # Custom React hooks
├── types/                        # TypeScript type definitions
├── utils/                        # Utility functions
├── contexts/                     # React contexts
├── providers/                    # React providers
└── public/                       # Static assets
```

## Main Site Architecture

### Public Routes (`app/(site)/`)

#### Homepage (`/`)
- Hero slider with dynamic content
- Features showcase
- Statistics display
- Testimonials section
- Brand slider
- Call-to-action sections

#### About Page (`/about`)
- Mission statement
- Company values
- Vision sections
- Team information
- Modular component architecture

#### Features Page (`/features`)
- Product feature highlights
- Interactive demonstrations
- Benefit explanations

#### Contact Page (`/contact`)
- Contact forms
- Location information
- Communication channels

#### Mentorship Page (`/mentorship`)
- Program details
- Mentor profiles
- Application process
- Success stories

#### SmartSpoon Page (`/smartspoon`)
- Product specifications
- Usage instructions
- Benefits overview
- Purchase options

#### Authentication (`/login`)
- User login interface
- Registration forms
- Password recovery

#### Terms & Conditions (`/terms`)
- Legal documentation
- Privacy policy
- User agreements
- Content fetched from database

## Admin Dashboard Architecture

### Admin Layout
- **Authentication**: Protected routes with Supabase auth
- **Sidebar Navigation**: Organized by content type
- **Responsive Design**: Works across all device sizes
- **Real-time Updates**: Live content synchronization

### Content Management Pages

#### Home Management (`/admin/pages/home`)
- Hero slider content editing
- Homepage sections management
- Call-to-action customization
- Statistics updates

#### About Management (`/admin/pages/about`)
- Mission statement editing
- Values management
- Vision content updates
- Team member administration

#### Features Management (`/admin/pages/features`)
- Feature content editing
- Image management
- Benefit descriptions
- Interactive element controls

#### Contact Management (`/admin/pages/contact`)
- Contact information updates
- Form configuration
- Location details management

#### Mentorship Management (`/admin/pages/mentorship`)
- Program content editing
- Mentor profile management
- Application form configuration

#### SmartSpoon Management (`/admin/pages/smartspoon`)
- Product information editing
- Specification updates
- Image gallery management

#### Documents Management (`/admin/pages/documents`)
- Terms and conditions editing
- Text formatting capabilities
- HTML content support
- Preview functionality

#### Footer Management (`/admin/pages/footer`)
- Footer content editing
- Link management
- Social media integration

#### Navbar Management (`/admin/pages/navbar`)
- Navigation menu configuration
- Link management
- Dropdown menu setup

### Admin Components (57 total)

#### Core Admin Components
- `Sidebar.tsx` - Navigation sidebar
- `Dashboard.tsx` - Main dashboard overview
- `AdminWrapper.tsx` - Layout wrapper
- `AdminPageHeader.tsx` - Page headers
- `LoadingSpinner.tsx` - Loading states
- `SignOutButton.tsx` - Authentication controls

#### Content Management Components
- Feature-specific editors for each content type
- Image upload components
- Form builders
- Content preview systems
- Drag-and-drop interfaces

## Database Architecture

### Supabase Integration
- **72 Database Migrations**: Comprehensive schema management
- **Storage Buckets**: Image and file storage
- **Row Level Security**: Data protection
- **Real-time Subscriptions**: Live updates

### Key Tables
- `site_settings` - Global site configuration
- `documents` - Terms and conditions content
- `features` - Feature information
- `testimonials` - User testimonials
- `statistics` - Site statistics
- `mentorship` - Program information
- `contact` - Contact details

## API Architecture

### API Routes (`app/api/`)

#### Admin APIs (`/api/admin/`)
- Content CRUD operations
- Image upload handling
- Settings management

#### Mentorship APIs (`/api/mentorship/`)
- Program management
- Application processing
- Mentor administration

#### M-Pesa Integration (`/api/mpesa/`)
- Payment processing
- Transaction verification
- Callback handling

#### Authentication (`/api/callback/`)
- Auth callback processing
- Session management

## Key Features

### Content Management System
- **Full CRUD Operations**: Create, read, update, delete all content
- **Image Management**: Upload and organize media files
- **Real-time Preview**: See changes instantly
- **Version Control**: Track content changes

### Terms & Conditions System
- **Text Editor**: Rich text editing capabilities
- **HTML Support**: Basic HTML formatting
- **Preview Mode**: See formatted output
- **Database Storage**: Content stored in database

### Navigation System
- **Responsive Design**: Works on all screen sizes
- **Mega Menu**: Advanced dropdown navigation
- **Smart Positioning**: Intelligent menu placement
- **Mobile Optimization**: Touch-friendly interface

### Authentication & Security
- **Protected Routes**: Admin area security
- **Session Management**: Secure user sessions
- **Role-based Access**: Different permission levels
- **Data Validation**: Input sanitization

### Performance Optimizations
- **Next.js App Router**: Modern routing system
- **Image Optimization**: Automatic image processing
- **Code Splitting**: Efficient bundle loading
- **Caching**: Strategic content caching

## Development Workflow

### Local Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Database Management
- Supabase migrations for schema changes
- Local development with Supabase CLI
- Production deployment automation

### Content Updates
- Admin dashboard for content management
- Real-time preview capabilities
- Version control for content changes

## Deployment Architecture

### Frontend Deployment
- Next.js application deployment
- Static asset optimization
- CDN integration

### Backend Services
- Supabase hosted database
- Authentication services
- File storage management

### Payment Integration
- M-Pesa API integration
- Transaction processing
- Callback handling

## Security Considerations

### Authentication
- Supabase Auth integration
- Protected admin routes
- Session management

### Data Protection
- Row Level Security (RLS)
- Input validation
- SQL injection prevention

### File Security
- Secure file uploads
- Image optimization
- Storage bucket policies

## Maintenance & Updates

### Regular Tasks
- Database migration management
- Content backup procedures
- Security updates
- Performance monitoring

### Monitoring
- Error tracking
- Performance metrics
- User analytics
- Content usage statistics

## Future Enhancements

### Planned Features
- Advanced analytics dashboard
- Multi-language support
- Enhanced payment options
- Mobile application

### Scalability Considerations
- Database optimization
- CDN implementation
- Caching strategies
- Performance improvements

---

*Last Updated: July 27, 2025*
*Project Version: 0.1.0*
