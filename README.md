# AI Startup Orchestration Platform

A modern, production-grade web platform for AI-powered startup orchestration. Built with Next.js, TypeScript, Tailwind CSS, and Framer Motion.

## 🚀 Features

- **Landing Page** with scroll-driven storytelling and 3D integration placeholder
- **AI Analysis Dashboard** with comprehensive startup insights
- **Project Management** with animated cards and status tracking
- **Detailed Project Views** with 6 sections:
  - Idea Input
  - AI Analysis (SWOT, scores, recommendations)
  - Market Intelligence
  - AI-Generated Team
  - Generated Documents
  - Automation Activity Logs
- **Smooth Animations** using Framer Motion
- **Responsive Design** optimized for all devices

## 📦 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **3D Integration**: Spline (placeholder ready)

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
├── app/                      # Next.js app directory
│   ├── auth/                # Authentication pages
│   ├── dashboard/           # Dashboard and project pages
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing page
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── auth/                # Auth components
│   ├── dashboard/           # Dashboard components
│   ├── landing/             # Landing page sections
│   ├── layout/              # Layout components (Navbar, Sidebar, Footer)
│   ├── project/             # Project detail sections
│   ├── providers/           # Context providers
│   └── ui/                  # Reusable UI components
├── animations/              # Framer Motion animations
│   ├── variants.ts          # Animation variants
│   └── scroll-animations.tsx # Scroll-based animations
├── hooks/                   # Custom React hooks
├── lib/                     # Utilities and mock data
├── types/                   # TypeScript type definitions
└── public/                  # Static assets
```

## 🎨 Key Components

### Landing Page
- Hero section with Spline 3D placeholder
- Features grid with hover animations
- How It Works timeline
- Scroll progress indicator

### Dashboard
- Project cards with status badges
- Animated hover states
- Empty state handling

### Project Detail Page (Flagship)
- Sticky progress tracker
- 6 scrollable sections with animations
- Expandable accordions for long content
- Timeline view for automation logs

## 🔧 Customization

### Adding Spline 3D Scene

1. Create your 3D scene at [spline.design](https://spline.design)
2. Export and get the scene URL
3. Replace the placeholder in `components/landing/hero-section.tsx`:

```tsx
// Uncomment and add your Spline scene URL
<Spline scene="https://prod.spline.design/YOUR-SCENE-ID/scene.splinecode" />
```

### Modifying Mock Data

Edit `lib/mock-data.ts` to customize:
- Project examples
- AI analysis content
- Team members
- Market insights
- Documents
- Automation logs

### Theme Customization

Modify `tailwind.config.ts` to adjust:
- Color palette
- Typography
- Spacing
- Animations

## 📝 Notes

- This is a **frontend-only** showcase with mock data
- No backend or real AI integration
- Authentication is simulated (redirects to dashboard)
- All API calls are mocked

## 🎯 Portfolio Use

This project demonstrates:
- Modern React patterns with Next.js App Router
- TypeScript for type safety
- Advanced animations with Framer Motion
- Responsive design principles
- Component architecture and reusability
- Clean code organization

## 📄 License

This project is created for portfolio purposes.

---

Built with ❤️ using Next.js, TypeScript, and Framer Motion
