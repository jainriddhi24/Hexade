# Hexade Wireframes and Design Specifications

## Design System

### Color Palette
- **Primary Blue**: #1e3a8a (Deep blue for primary actions)
- **Light Blue**: #3b82f6 (Secondary blue for accents)
- **Accent Amber**: #f59e0b (Call-to-action buttons)
- **Neutral Gray**: #6b7280 (Text and borders)
- **Light Gray**: #f3f4f6 (Backgrounds)

### Typography
- **Primary Font**: Inter (Google Fonts)
- **Headings**: 600-700 weight
- **Body Text**: 400 weight
- **Small Text**: 300 weight

### Spacing
- **Base Unit**: 4px
- **Common Spacing**: 8px, 16px, 24px, 32px, 48px, 64px

## Page Wireframes

### 1. Home Page

```
┌─────────────────────────────────────────────────────────────┐
│ [Logo] Hexade                    [Features] [Lawyers] [Blog] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🏛️ Modern Legal Technology                                │
│  Streamline Your Legal Practice                            │
│  Comprehensive case management with WebRTC hearings        │
│                                                             │
│  [Book a Hearing] [See Demo]                               │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Features Grid (3x2)                                       │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                      │
│  │ 🎥 Video│ │ 💬 Chat │ │ 📅 Sched│                      │
│  │ Hearings│ │ Messages│ │ Calendar│                      │
│  └─────────┘ └─────────┘ └─────────┘                      │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                      │
│  │ 📄 Docs │ │ 🧠 AI   │ │ 🌍 Multi│                      │
│  │ Mgmt    │ │ Summary │ │ Language│                      │
│  └─────────┘ └─────────┘ └─────────┘                      │
├─────────────────────────────────────────────────────────────┤
│  Stats: 500+ Lawyers | 2,500+ Cases | 10,000+ Hearings    │
├─────────────────────────────────────────────────────────────┤
│  How It Works (4 steps)                                    │
│  [1] File → [2] Match → [3] Schedule → [4] Conduct         │
├─────────────────────────────────────────────────────────────┤
│  Testimonials (3 cards)                                    │
├─────────────────────────────────────────────────────────────┤
│  CTA: Ready to Transform Your Practice?                    │
│  [Get Started] [Contact Sales]                             │
├─────────────────────────────────────────────────────────────┤
│  Footer: Links | Contact | Social                          │
└─────────────────────────────────────────────────────────────┘
```

### 2. Lawyer Directory

```
┌─────────────────────────────────────────────────────────────┐
│ [Logo] Hexade                    [Features] [Lawyers] [Blog] │
├─────────────────────────────────────────────────────────────┤
│  Find the Right Lawyer for Your Case                       │
│                                                             │
│  [Search] [Practice Area ▼] [District ▼] [Verified ✓]     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Lawyer Cards (3 per row)                                  │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │ [Photo]         │ │ [Photo]         │ │ [Photo]         ││
│  │ John Smith      │ │ Jane Doe        │ │ Mike Johnson    ││
│  │ Corporate Law   │ │ Criminal Law    │ │ Family Law      ││
│  │ ⭐ 4.8 (120)    │ │ ⭐ 4.9 (95)     │ │ ⭐ 4.7 (87)     ││
│  │ 8 years exp     │ │ 12 years exp    │ │ 6 years exp     ││
│  │ [View Profile]  │ │ [View Profile]  │ │ [View Profile]  ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘│
│                                                             │
│  [Load More]                                               │
└─────────────────────────────────────────────────────────────┘
```

### 3. Dashboard (Judge)

```
┌─────────────────────────────────────────────────────────────┐
│ [Logo] Hexade    [Search] [🔔] [👤 Judge Johnson ▼]        │
├─────────────────────────────────────────────────────────────┤
│ Sidebar │ Main Content                                      │
│ ┌─────┐ │ ┌─────────────────────────────────────────────┐   │
│ │📊   │ │ │ Good morning, Judge Johnson!                │   │
│ │📅   │ │ │                                             │   │
│ │📁   │ │ │ Stats Cards (4 columns)                    │   │
│ │👥   │ │ │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────┐│   │
│ │💬   │ │ │ │12       │ │25       │ │3        │ │5    ││   │
│ │📈   │ │ │ │Hearings │ │Cases    │ │Today    │ │Pending││   │
│ │     │ │ │ └─────────┘ └─────────┘ └─────────┘ └─────┘│   │
│ │     │ │ │                                             │   │
│ │     │ │ │ Today's Hearings                           │   │
│ │     │ │ │ ┌─────────────────────────────────────────┐ │   │
│ │     │ │ │ │ 10:00 AM - Contract Dispute            │ │   │
│ │     │ │ │ │ Case #CASE-2024-001                    │ │   │
│ │     │ │ │ │ [Join Hearing]                         │ │   │
│ │     │ │ │ └─────────────────────────────────────────┘ │   │
│ │     │ │ │                                             │   │
│ │     │ │ │ Recent Activity                            │   │
│ │     │ │ │ • Civil Case Hearing completed            │   │
│ │     │ │ │ • New case filed                          │   │
│ │     │ │ │ • Document signed                         │   │
│ └─────┘ │ └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 4. Dashboard (Lawyer)

```
┌─────────────────────────────────────────────────────────────┐
│ [Logo] Hexade    [Search] [🔔] [👤 Michael Chen ▼]         │
├─────────────────────────────────────────────────────────────┤
│ Sidebar │ Main Content                                      │
│ ┌─────┐ │ ┌─────────────────────────────────────────────┐   │
│ │📊   │ │ │ Welcome back, Michael!                      │   │
│ │📁   │ │ │                                             │   │
│ │👥   │ │ │ Stats Cards (4 columns)                    │   │
│ │📅   │ │ │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────┐│   │
│ │💬   │ │ │ │8        │ │15       │ │4        │ │7    ││   │
│ │📈   │ │ │ │Cases    │ │Clients  │ │Hearings │ │Docs  ││   │
│ │     │ │ │ └─────────┘ └─────────┘ └─────────┘ └─────┘│   │
│ │     │ │ │                                             │   │
│ │     │ │ │ Quick Actions                               │   │
│ │     │ │ │ [Create Case] [Schedule Hearing] [Messages] │   │
│ │     │ │ │                                             │   │
│ │     │ │ │ Active Cases                                │   │
│ │     │ │ │ ┌─────────────────────────────────────────┐ │   │
│ │     │ │ │ │ Contract Dispute - High Priority        │ │   │
│ │     │ │ │ │ Client: Emily Rodriguez                 │ │   │
│ │     │ │ │ │ Next Hearing: Tomorrow 10:00 AM        │ │   │
│ │     │ │ │ │ [View Case] [Join Hearing]              │ │   │
│ │     │ │ │ └─────────────────────────────────────────┘ │   │
│ └─────┘ │ └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 5. Dashboard (Client)

```
┌─────────────────────────────────────────────────────────────┐
│ [Logo] Hexade    [Search] [🔔] [👤 Emily Rodriguez ▼]      │
├─────────────────────────────────────────────────────────────┤
│ Sidebar │ Main Content                                      │
│ ┌─────┐ │ ┌─────────────────────────────────────────────┐   │
│ │📊   │ │ │ Hello, Emily!                               │   │
│ │📁   │ │ │                                             │   │
│ │📅   │ │ │ Stats Cards (4 columns)                    │   │
│ │👥   │ │ │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────┐│   │
│ │💬   │ │ │ │3        │ │2        │ │5        │ │12   ││   │
│ │     │ │ │ │Cases    │ │Hearings │ │Messages │ │Docs  ││   │
│ │     │ │ │ └─────────┘ └─────────┘ └─────────┘ └─────┘│   │
│ │     │ │ │                                             │   │
│ │     │ │ │ Quick Actions                               │   │
│ │     │ │ │ [Find Lawyer] [File New Case] [Messages]    │   │
│ │     │ │ │                                             │   │
│ │     │ │ │ My Cases                                    │   │
│ │     │ │ │ ┌─────────────────────────────────────────┐ │   │
│ │     │ │ │ │ Contract Dispute - In Progress          │ │   │
│ │     │ │ │ │ Lawyer: Michael Chen                    │ │   │
│ │     │ │ │ │ Next Hearing: Tomorrow 10:00 AM        │ │   │
│ │     │ │ │ │ [View Case] [Join Hearing]              │ │   │
│ │     │ │ │ └─────────────────────────────────────────┘ │   │
│ └─────┘ │ └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 6. Live Hearing Room

```
┌─────────────────────────────────────────────────────────────┐
│ Hearing Room - Contract Dispute | 3 participants • Live    │
│ [📞 Leave] [⚙️ Settings] [📤 Share]                        │
├─────────────────────────────────────────────────────────────┤
│ Video Grid (2x2)                    │ Chat Sidebar          │
│ ┌─────────────────┐ ┌─────────────┐ │ ┌─────────────────┐   │
│ │                 │ │             │ │ │ 💬 Chat         │   │
│ │   You (Local)   │ │ Judge Sarah │ │ ├─────────────────┤   │
│ │                 │ │             │ │ │ System: Welcome │   │
│ └─────────────────┘ └─────────────┘ │ │ Judge: Ready?   │   │
│ ┌─────────────────┐ ┌─────────────┐ │ │ Lawyer: Yes     │   │
│ │                 │ │             │ │ │ Client: Ready   │   │
│ │ Lawyer Michael  │ │ Client Emily│ │ │                 │   │
│ │                 │ │             │ │ │                 │   │
│ └─────────────────┘ └─────────────┘ │ │                 │   │
│                                     │ │                 │   │
│ Controls: [🎤] [📹] [📤] [⚙️]      │ │ [Type message]  │   │
│                                     │ │ [Send]          │   │
│                                     │ └─────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 7. Case Detail Page

```
┌─────────────────────────────────────────────────────────────┐
│ [Logo] Hexade    [Search] [🔔] [👤 User ▼]                 │
├─────────────────────────────────────────────────────────────┤
│ Sidebar │ Main Content                                      │
│ ┌─────┐ │ ┌─────────────────────────────────────────────┐   │
│ │📊   │ │ │ Contract Dispute Resolution                 │   │
│ │📁   │ │ │ Case #CASE-2024-001                        │   │
│ │👥   │ │ │ Status: In Progress | Priority: High       │   │
│ │📅   │ │ │                                             │   │
│ │💬   │ │ │ Tabs: [Overview] [Documents] [Hearings]    │   │
│ │📈   │ │ │      [Messages] [Timeline]                 │   │
│ │     │ │ │                                             │   │
│ │     │ │ │ Overview Tab                                │   │
│ │     │ │ │ ┌─────────────────────────────────────────┐ │   │
│ │     │ │ │ │ Case Details                             │ │   │
│ │     │ │ │ │ • Type: Civil                           │ │   │
│ │     │ │ │ │ • Filed: Jan 15, 2024                   │ │   │
│ │     │ │ │ │ • Court: Superior Court of California   │ │   │
│ │     │ │ │ │ • Jurisdiction: Los Angeles County      │ │   │
│ │     │ │ │ │                                         │ │   │
│ │     │ │ │ │ Parties                                 │ │   │
│ │     │ │ │ │ • Client: Emily Rodriguez               │ │   │
│ │     │ │ │ │ • Lawyer: Michael Chen                  │ │   │
│ │     │ │ │ │ • Judge: Sarah Johnson                  │ │   │
│ │     │ │ │ └─────────────────────────────────────────┘ │   │
│ └─────┘ │ └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Mobile Responsive Design

### Mobile Navigation
```
┌─────────────────────────────────────┐
│ [☰] Hexade              [🔔] [👤]   │
├─────────────────────────────────────┤
│ Mobile Menu (when opened)           │
│ • Home                              │
│ • Features                          │
│ • How it Works                      │
│ • Lawyers                           │
│ • Blog                              │
│ • FAQ                               │
│ • Sign In                           │
│ • Get Started                       │
└─────────────────────────────────────┘
```

### Mobile Dashboard
```
┌─────────────────────────────────────┐
│ [☰] Hexade              [🔔] [👤]   │
├─────────────────────────────────────┤
│ Welcome back, Michael!              │
│                                     │
│ Stats (2x2 grid)                    │
│ ┌─────────┐ ┌─────────┐             │
│ │8 Cases  │ │15 Clients│             │
│ └─────────┘ └─────────┘             │
│ ┌─────────┐ ┌─────────┐             │
│ │4 Hearings│ │7 Docs   │             │
│ └─────────┘ └─────────┘             │
│                                     │
│ Quick Actions                       │
│ [Create Case]                       │
│ [Schedule Hearing]                  │
│ [Messages]                          │
│                                     │
│ Active Cases                        │
│ ┌─────────────────────────────────┐ │
│ │ Contract Dispute                │ │
│ │ Client: Emily Rodriguez         │ │
│ │ Next: Tomorrow 10:00 AM         │ │
│ │ [View] [Join]                   │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## Component Specifications

### Buttons
- **Primary**: Blue background, white text, 8px border radius
- **Secondary**: White background, blue border, blue text
- **Accent**: Amber background, white text
- **Ghost**: Transparent background, blue text
- **Sizes**: Small (32px), Medium (40px), Large (48px)

### Cards
- **Background**: White
- **Border**: 1px solid #e5e7eb
- **Border Radius**: 8px
- **Shadow**: 0 1px 3px rgba(0, 0, 0, 0.1)
- **Padding**: 24px

### Forms
- **Input Height**: 40px
- **Border**: 1px solid #d1d5db
- **Border Radius**: 6px
- **Focus**: Blue border, blue shadow
- **Error**: Red border, red text

### Typography Scale
- **H1**: 48px, 600 weight
- **H2**: 36px, 600 weight
- **H3**: 24px, 600 weight
- **H4**: 20px, 600 weight
- **Body**: 16px, 400 weight
- **Small**: 14px, 400 weight
- **Caption**: 12px, 400 weight

## Accessibility Considerations

### Color Contrast
- **Text on White**: Minimum 4.5:1 ratio
- **Text on Blue**: Minimum 4.5:1 ratio
- **Interactive Elements**: Minimum 3:1 ratio

### Focus States
- **Visible Focus**: 2px blue outline
- **Focus Offset**: 2px from element
- **Focus Color**: #3b82f6

### Touch Targets
- **Minimum Size**: 44px x 44px
- **Spacing**: 8px between targets
- **Mobile Optimization**: Larger targets on mobile

### Screen Reader Support
- **Alt Text**: All images have descriptive alt text
- **ARIA Labels**: Interactive elements have proper labels
- **Semantic HTML**: Proper heading hierarchy and landmarks
- **Skip Links**: Navigation skip links for keyboard users
