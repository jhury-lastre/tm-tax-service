# shadcn/ui Configuration for TurboRepo

This document explains how shadcn/ui has been configured in this turborepo with custom theming.

## 🎨 Custom Theme

This setup uses a custom color palette:

### Primary Colors (Green Vogue)
- **Primary**: `green-vogue` color palette (blue-green tones)
- **Range**: 50-950 with various shades
- **Usage**: Main interactive elements, buttons, links

### Accent Colors (Guardsman Red)
- **Accent**: `guardsman-red` color palette (bright red tones)
- **Range**: 50-950 with various shades
- **Usage**: Destructive actions, alerts, error states

## 📁 Project Structure

```
apps/web/
├── src/
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── label.tsx
│   │   └── demo-shadcn.tsx     # Demo component
│   └── lib/
│       └── utils.ts            # Utility functions
├── app/
│   ├── globals.css             # Global styles + shadcn variables
│   └── page.tsx                # Main page with demo
├── components.json             # shadcn/ui configuration
└── tsconfig.json               # TypeScript config with path aliases
```

## 🛠️ Configuration Files

### `components.json`
- **Style**: new-york
- **TypeScript**: enabled
- **Tailwind CSS**: v4 support
- **CSS Variables**: enabled
- **Path Aliases**: configured for `@/components`, `@/lib`, etc.

### `tsconfig.json`
Path aliases configured for shadcn/ui:
- `@/*` → `./src/*`
- `@/components/*` → `./src/components/*`
- `@/lib/*` → `./src/lib/*`
- `@/app/*` → `./app/*`

### `globals.css`
Custom CSS variables for theming:
- shadcn/ui semantic color variables
- Custom green-vogue and guardsman-red color definitions
- Light mode only (dark mode removed)

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

### 3. View the Demo
Open [http://localhost:3001](http://localhost:3001) to see the shadcn/ui demo with custom theming.

## 📦 Adding New Components

To add new shadcn/ui components:

```bash
# Navigate to the web app directory
cd apps/web

# Add components (e.g., dialog, dropdown-menu, etc.)
npx shadcn@latest add dialog dropdown-menu

# Or add multiple components at once
npx shadcn@latest add dialog dropdown-menu accordion alert
```

## 🎯 Usage Examples

### Basic Button
```tsx
import { Button } from "@/components/ui/button"

export function MyComponent() {
  return (
    <Button variant="default">
      Click me
    </Button>
  )
}
```

### Card with Form
```tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" />
        </div>
        <Button className="w-full">Sign In</Button>
      </CardContent>
    </Card>
  )
}
```

### Using Custom Colors
```tsx
// Using CSS variables in components
<div className="bg-[rgb(var(--primary-500))] text-white p-4">
  Primary colored background
</div>

<div className="bg-[rgb(var(--accent-600))] text-white p-4">
  Accent colored background
</div>
```

## 🌈 Color Reference

### Primary (Green Vogue)
- `--primary-50`: #edfaff (Very light blue)
- `--primary-500`: #1faaff (Medium blue)
- `--primary-600`: #088cff (Primary blue - main brand color)
- `--primary-900`: #0e509a (Dark blue)

### Accent (Guardsman Red)
- `--accent-50`: #ffefef (Very light red)
- `--accent-500`: #ff1f1f (Medium red)
- `--accent-600`: #ff0000 (Pure red - destructive actions)
- `--accent-900`: #940808 (Dark red)

### shadcn/ui Semantic Colors
- `--primary`: Main brand color (green-vogue-600)
- `--destructive`: Error/delete actions (guardsman-red-600)
- `--secondary`: Secondary backgrounds (green-vogue-50)
- `--muted`: Subtle backgrounds and text

## 📚 Resources

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Next.js Documentation](https://nextjs.org/docs)

## 🔧 Troubleshooting

### Path Alias Issues
If you get import errors, ensure:
1. `tsconfig.json` has correct path aliases
2. `components.json` has correct alias mappings
3. Restart your TypeScript server

### Styling Issues
If components don't appear styled correctly:
1. Check that `globals.css` is imported in your app
2. Verify Tailwind CSS is configured properly
3. Ensure CSS variables are defined in `:root`

### Component Not Found
If shadcn/ui components are not found:
1. Check that the component was added correctly
2. Verify the import path matches your alias configuration
3. Ensure the component file exists in `src/components/ui/` 