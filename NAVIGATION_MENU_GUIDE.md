# Navigation Menu System - Technical Guide

## Overview
This document describes the new home page navigation menu system implementing the "时间缝隙中的航标" (Beacon in the Cracks of Time) aesthetic.

## Architecture

### File Structure
```
src/
├── app/
│   ├── page.tsx              # Home page with navigation menu
│   ├── layout.tsx            # Root layout with global components
│   ├── intro/
│   │   └── page.tsx         # Introduction page (启)
│   ├── crew/
│   │   └── page.tsx         # The Crew page (众)
│   └── vault/
│       └── page.tsx         # The Vault page (境)
├── components/
│   └── ui/
│       ├── ParticleBackground.tsx  # R3F particle system
│       ├── Navigation.tsx          # Header navigation component
│       ├── PageTransition.tsx      # Page transition wrapper
│       ├── MusicPlayer.tsx         # Background music player
│       └── CustomCursor.tsx        # Custom cursor
```

## Key Features

### 1. Particle Background (ParticleBackground.tsx)
- **Technology**: React Three Fiber (R3F)
- **Particles**: 2000 particles with organic movement
- **Effects**: 
  - Mouse-following subtle magnetic effect
  - Continuous drift animation
  - Fog and vignette for depth
  - Boundary wrapping for infinite feel

**Key Implementation:**
```typescript
// Particles respond to mouse with subtle pull
const dx = mouseRef.current.x - positions[i]
const dy = mouseRef.current.y - positions[i + 1]
if (distance < 10) {
  positions[i] += dx * 0.001  // Gentle pull
  positions[i + 1] += dy * 0.001
}
```

### 2. Magnetic Text Effect (GSAP)
- **Technology**: GSAP (GreenSock Animation Platform)
- **Effect**: Menu items follow mouse movement with elastic return

**Key Implementation:**
```typescript
// Magnetic pull based on mouse position relative to element
const x = e.clientX - rect.left - rect.width / 2
const y = e.clientY - rect.top - rect.height / 2

gsap.to(element, {
  x: x * 0.3,  // 30% of actual distance
  y: y * 0.3,
  duration: 0.6,
  ease: 'power2.out',
})
```

### 3. Real-time Preview
- **Effect**: Circular image preview appears at center on hover
- **Animation**: Scale + blur transition with colored glow
- **Images**: Representative photos for each section

**Key Implementation:**
```typescript
gsap.fromTo(previewRef.current, {
  scale: 0.8,
  opacity: 0,
  filter: 'blur(20px)',
}, {
  scale: 1,
  opacity: 1,
  filter: 'blur(0px)',
  duration: 0.8,
  ease: 'power3.out',
})
```

### 4. Page Transitions
- **Technology**: Framer Motion + GSAP
- **Effect**: Expanding colored circle transition
- **Color**: Each menu item has unique color that fills screen

**Key Implementation:**
```typescript
// Create expanding circle overlay
const circle = document.createElement('div')
gsap.to(circle, {
  opacity: 1,
  scale: 3,
  duration: 0.8,
  ease: 'power2.inOut',
  onComplete: () => router.push(item.route)
})
```

## Menu Items

### Configuration (menuItems array)
Each menu item contains:
- `id`: Unique identifier
- `title`: English title
- `chinese`: Chinese character (大字号显示)
- `subtitle`: Poetic description
- `route`: Next.js route path
- `previewImage`: Preview image path (optional)
- `color`: Theme color for transitions and effects

### Current Menu Items
1. **启 (Introduction)** 
   - Route: `/intro`
   - Color: Purple (#8B5CF6)
   - Description: "时间之锚，故事之始"

2. **众 (The Crew)**
   - Route: `/crew`
   - Color: Pink (#EC4899)
   - Description: "群星汇聚，温暖如初"

3. **境 (The Vault)**
   - Route: `/vault`
   - Color: Cyan (#06B6D4)
   - Description: "未来的回音，此刻的期许"

4. **迹 (Footprints)**
   - Route: `#` (Coming Soon)
   - Color: Amber (#F59E0B)
   - Description: "即将到来的记忆碎片"

## Visual Design

### Typography
- **Chinese Characters**: 7xl-9xl font size (极大字号)
- **Letter Spacing**: Wide tracking (tracking-wider)
- **Font Weight**: Light (font-light) for elegance
- **English Title**: Monospace, uppercase, wide tracking
- **Subtitle**: Small, subtle, transitions on hover

### Layout
- **Asymmetric**: Alternating left/right alignment
- **Spacing**: Large vertical gaps (space-y-8 to space-y-12)
- **Responsive**: Adjusts padding and font sizes on mobile

### Color System
- **Background**: Pure black (#000000)
- **Text**: White with opacity variations (90%, 50%, 30%, 20%)
- **Accents**: Per-item colors for glows and transitions
- **Effects**: Radial gradients, text shadows, box shadows

### Hover Effects
1. **Text Color**: Transitions from 90% to 100% white
2. **Glow**: Colored text shadow appears
3. **Background**: Radial gradient circle appears behind character
4. **Preview**: Circular image with colored ring animates in
5. **Magnetic**: Text follows mouse with elastic movement

## Performance Optimizations

### 1. Dynamic Imports
The vault page uses dynamic imports to reduce initial bundle:
```typescript
const FutureLetter = dynamic(() => import('@/components/future/FutureLetter'), {
  loading: () => <LoadingSpinner />,
  ssr: false,
})
```

### 2. ScrollTrigger Cleanup
Each page cleans up GSAP ScrollTrigger instances on unmount:
```typescript
useEffect(() => {
  return () => {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill())
  }
}, [])
```

### 3. First Visit Detection
Home page detects first visit and redirects to intro:
```typescript
const hasVisitedIntro = localStorage.getItem('hasVisitedIntro')
if (!hasVisitedIntro) {
  router.push('/intro')
}
```

## Navigation Component

### Header Navigation (Navigation.tsx)
- Appears on all pages except home (`/`) and intro (`/intro`)
- Fixed position (top-left)
- Returns to home page
- Glassmorphism design matching music player

### Music Player Integration
- Shared via AppProvider context
- Auto-starts on home page after 1 second
- Persists across page navigation
- Accessible via `useApp()` hook

## Browser Compatibility

### Supported Features
- CSS backdrop-blur (glassmorphism)
- CSS radial-gradient
- WebGL (for R3F particle system)
- Web Audio API (for music player)

### Fallbacks
- Particles gracefully degrade without WebGL
- Music player handles autoplay restrictions
- Touch devices: custom cursor disabled automatically

## User Flow

1. **First Visit**
   - → Redirect to `/intro` page
   - → Introduction experience plays
   - → User clicks "Begin Journey"
   - → Redirects to `/` (home with navigation menu)

2. **Subsequent Visits**
   - → Lands on `/` (home page)
   - → Music auto-starts
   - → User hovers/clicks menu items
   - → Smooth transition to selected page
   - → "返回导航" button to return home

## Customization Guide

### Adding New Menu Items
1. Add entry to `menuItems` array in `page.tsx`
2. Create new route folder in `src/app/`
3. Add `page.tsx` with component
4. Add preview image to `public/images/`
5. Choose theme color

### Modifying Animations
- **Magnetic strength**: Adjust multiplier in GSAP animation (currently 0.3)
- **Transition speed**: Change duration in gsap.to() calls
- **Particle count**: Modify count in ParticleField component
- **Preview size**: Adjust w-/h- classes in preview div

### Styling Changes
- Colors defined in menuItems array
- Typography in Tailwind classes
- Spacing via space-y-* utilities
- Custom gradients in globals.css

## Dependencies

### Required Packages
```json
{
  "@react-three/fiber": "^9.5.0",
  "@react-three/drei": "^10.7.7",
  "gsap": "^3.14.2",
  "framer-motion": "^12.26.2",
  "three": "^0.182.0",
  "next": "16.1.2"
}
```

### Import Patterns
```typescript
// R3F
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Animation
import gsap from 'gsap'
import { motion, AnimatePresence } from 'framer-motion'

// Next.js
import { useRouter, usePathname } from 'next/navigation'
```

## Troubleshooting

### Common Issues

**Particles not showing:**
- Check if WebGL is supported
- Verify R3F Canvas is rendered
- Check z-index of particle container

**Magnetic effect not working:**
- Ensure GSAP is installed
- Verify refs are properly attached
- Check event listeners are added

**Preview images not loading:**
- Verify image paths in public folder
- Check previewImage property in menuItems
- Ensure Next.js Image optimization settings

**Transitions stuttering:**
- Reduce particle count
- Optimize GSAP animation durations
- Check for memory leaks (ScrollTrigger cleanup)

## Future Enhancements

### Planned Features
1. **迹 (Footprints)** page implementation
2. Enhanced preview effects (fragment shader transitions)
3. Sound effects for menu interactions
4. Keyboard navigation support
5. Accessibility improvements (screen reader support)

### Possible Improvements
- Add custom loading animations per page
- Implement breadcrumb navigation for sub-pages
- Add search functionality
- Create admin panel for content management
- Add analytics tracking for user journeys

## Credits

**Design Concept**: "时间缝隙中的航标" (Beacons in the Cracks of Time)
**Technologies**: Next.js 16, React 19, R3F, GSAP, Framer Motion
**Architecture**: App Router with route groups
