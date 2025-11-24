# Files to Delete - Voice AI Interview Integration

## Directories to Delete

1. **`app/api/archie/`** - Contains all Archie AI API endpoints
   - `app/api/archie/balance/`
   - `app/api/archie/scenarios/`
   - `app/api/archie/sessions/`

2. **`app/interview-scenarios/`** - Interview scenarios pages
   - `app/interview-scenarios/page.tsx`
   - `app/interview-scenarios/[scenarioId]/`

3. **`app/interview-practice/`** - Vapi voice interview pages (if exists)
   - `app/interview-practice/[scenarioId]/`

## Files to Delete

1. **`ARCHIE_INTEGRATION.md`** - Documentation for Archie AI integration
2. **`VAPI_INTEGRATION.md`** - Documentation for Vapi integration (if exists)

## Header.tsx Changes Needed

The `app/components/Header.tsx` file is currently corrupted and needs to be fixed.

**Remove these lines from the Placement Prep dropdown:**
```tsx
<DropdownItem
  href="/interview-scenarios"
  onClick={handlePlacementPrepClick}
  description="Practice with AI-powered interview scenarios"
>
  🎙️ Interview Scenarios
</DropdownItem>
```

**Remove from mobile navigation:**
```tsx
<MobileNavLink href="/interview-scenarios" onClick={handleMobileNavClick}>
  🎙️ Interview Scenarios
</MobileNavLink>
```

## Summary

All voice AI interview integration files (Archie AI and Vapi) should be removed to clean up the codebase. The Header component needs to be restored to its working state without the Interview Scenarios links.

## Manual Steps Required

1. Delete the directories listed above
2. Delete the documentation files
3. Fix or restore `app/components/Header.tsx` from git history
4. Remove any environment variables related to ARCHIE_API_KEY or VAPI from `.env.local`
