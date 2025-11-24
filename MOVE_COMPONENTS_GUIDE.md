# Moving Components Outside App Directory

## Steps to Move Components

### Option 1: Run the PowerShell Script (Recommended)

1. Open PowerShell in the project root directory
2. Run the script:
   ```powershell
   .\move-components.ps1
   ```

### Option 2: Manual Move

1. Create a `components` folder at the project root (same level as `app`)
2. Move everything from `app/components` to `components`
3. Delete the empty `app/components` folder

## After Moving - Update Import Paths

You'll need to update all import statements across your project:

### Files that will need import updates:

**In app directory:**
- `app/page.tsx`
- `app/layout.tsx`
- `app/dashboard/page.tsx`
- `app/resume-builder/page.tsx`
- `app/my-resumes/page.tsx`
- `app/ats-tools/page.tsx`
- `app/interview-prep/**/*.tsx`
- `app/code-playground/page.tsx`
- `app/quiz/**/*.tsx`
- `app/admin/**/*.tsx`
- `app/auth/page.tsx`
- All other pages that import components

### Import Path Changes:

**Before:**
```tsx
import Header from './components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
```

**After:**
```tsx
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
```

## Search and Replace

Use your IDE's search and replace feature:

1. **Find:** `from './components/`  
   **Replace:** `from '@/components/`

2. **Find:** `from '../components/`  
   **Replace:** `from '@/components/`

3. **Find:** `from '../../components/`  
   **Replace:** `from '@/components/`

4. **Find:** `from '@/app/components/`  
   **Replace:** `from '@/components/`

## Verify tsconfig.json

Make sure your `tsconfig.json` has the correct path mapping:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

## Benefits of Moving Components Outside App

1. ✅ Cleaner separation of concerns
2. ✅ Components are not part of the routing structure
3. ✅ Easier to import with `@/components` path
4. ✅ Standard Next.js 13+ project structure
5. ✅ Better organization for larger projects

## After Moving

Run the development server to check for any import errors:
```bash
npm run dev
```

Fix any remaining import path issues that the script might have missed.
