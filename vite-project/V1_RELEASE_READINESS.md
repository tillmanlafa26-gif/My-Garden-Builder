# My Garden Builder — V1 Release Readiness

## Completed in this release candidate

### PWA / installable app
- Web app manifest
- 192px, 512px, and Apple touch icons
- Root-scoped service worker
- App-shell and same-origin asset caching
- Browser install prompt support
- iPhone/iPad Add to Home Screen guidance
- Standalone display mode
- SPA redirects for static hosting

### Cross-platform hardening
- `viewport-fit=cover`
- safe-area compatible layout already retained
- dynamic viewport height fallback (`100vh` + `100dvh`)
- iOS text-size adjustment protection
- 16px mobile form controls to avoid Safari input zoom
- touch-friendly minimum control sizes retained
- reduced-motion support retained

### Accessibility
- Skip-to-content link
- Route-change focus management
- Route-specific document titles
- Settings dialog focus trap and Escape behavior
- Settings focus returns to the launcher button
- Onboarding focus containment
- Existing focus-visible styles retained
- Existing semantic labels and icon-button labels retained

### Final cleanup / stability
- Error boundary retained
- safe browser storage layer retained
- offline/network banner retained
- no old ThemeToggle component
- no old budget/cost UI components
- no TODO/FIXME markers found
- no `console.log` statements found
- legacy `"budget" -> "basic"` soil alias intentionally retained only to keep older saved gardens compatible

### Performance
- Plant images now use lazy loading and async decoding
- API origins are preconnected in `index.html`
- Service worker reuses cached app assets
- Current single-bundle route structure is intentionally retained so all core route code is available after the first successful app load, which improves offline reliability

### Privacy / release information
- `/privacy` page
- `/terms` page
- Settings links to both pages
- Local-storage behavior documented
- Location / Open-Meteo / Perenual behavior documented
- Current no-account / no-cloud-sync limitation documented

## Automated source validation
- JavaScript / JSX files parsed: 58
- JavaScript / JSX parse errors: 0
- Missing relative imports: 0
- CSS parse errors: 0
- Service worker syntax check: passed
- Manifest JSON check: passed
- Vercel JSON check: passed
- Buttons missing explicit `type`: 0

## Manual validation still required before public release
Automated source checks cannot replace real-device browser testing. Run the release candidate on:

- Windows Chrome
- Windows Edge
- iPhone Safari
- Android Chrome
- macOS Safari if available
- narrow phone viewport
- tablet viewport
- desktop viewport
- light mode
- dark mode
- offline after one successful production load
- installed PWA mode

## Recommended release status
This package is suitable as a **V1 release candidate** after the manual QA checklist passes and a production build succeeds in the user's Vite project.
