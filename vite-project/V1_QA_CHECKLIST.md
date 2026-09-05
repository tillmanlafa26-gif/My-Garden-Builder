# My Garden Builder — V1 QA Checklist

## Fresh start
- [ ] App loads without console-breaking errors
- [ ] Onboarding appears on a fresh browser profile
- [ ] Onboarding Skip works
- [ ] Onboarding Next/Back works
- [ ] Keyboard focus remains inside onboarding
- [ ] Settings → How to Use reopens onboarding

## Garden Builder
- [ ] Step 1 saves space type, dimensions, units, and surface
- [ ] Step 2 saves system, sunlight, zone, location, and frost dates
- [ ] Location denied shows a recoverable message
- [ ] Step 3 saves garden features
- [ ] Step 4 crop search and categories work
- [ ] Step 5 generates layout and seasonal planting plan
- [ ] Step 6 generates materials and build instructions
- [ ] Editing upstream steps invalidates stale generated results
- [ ] Regenerating an active design returns it to plan-ready state

## Garden activation
- [ ] Completed plan can be activated
- [ ] Active state persists after reload
- [ ] Rebuilt design requires reactivation

## Plants
- [ ] Perenual results load online
- [ ] Cached plant results appear when offline after prior use
- [ ] Add plant works
- [ ] Remove plant works
- [ ] Plant start method/date saves
- [ ] Growth-stage automatic estimate works
- [ ] Manual growth-stage override persists
- [ ] Returning to Automatic works

## Calendar / planting
- [ ] Seasonal planting events appear once, with no duplicates
- [ ] Start Indoors / Direct Sow / Transplant actions create or update one tracked crop
- [ ] Completed planting action remains tracked after reload
- [ ] Automatic watering events appear
- [ ] Harvest events appear

## Harvests / Journal
- [ ] Harvest can be recorded
- [ ] Repeat harvest works
- [ ] Final harvest changes plant to Harvested
- [ ] Final harvest stops future watering reminders
- [ ] Harvest creates Journal history
- [ ] Journal manual entry works
- [ ] Journal deletion works

## Weather / local climate
- [ ] Weather loads with permission
- [ ] Refresh works
- [ ] Cached weather displays offline after a successful online load
- [ ] Climate zone/frost data persists
- [ ] Manual zone/frost editing works

## Settings
- [ ] Settings button opens panel
- [ ] Supplies button remains positioned below Settings
- [ ] Dark Mode works
- [ ] Dark Mode persists after reload
- [ ] Settings traps keyboard focus
- [ ] Escape closes Settings
- [ ] Focus returns to Settings button after close
- [ ] Privacy opens
- [ ] Terms opens
- [ ] Reset requires confirmation
- [ ] Reset clears garden data

## PWA
- [ ] `npm run build` succeeds
- [ ] `npm run preview` loads
- [ ] Manifest detected by browser dev tools
- [ ] Service worker active in production preview
- [ ] Install App works where browser prompt is supported
- [ ] iPhone instructions are shown where automatic prompt is unavailable
- [ ] Installed app launches in standalone mode
- [ ] After one successful online load, app launches/reloads offline

## Responsive / device
- [ ] 320px width
- [ ] 375–430px phone width
- [ ] tablet width
- [ ] desktop width
- [ ] portrait
- [ ] landscape
- [ ] touch controls are comfortable
- [ ] no horizontal page overflow
- [ ] iPhone form controls do not trigger unwanted browser zoom

## Accessibility
- [ ] Tab through primary interactive controls
- [ ] Skip to main content works
- [ ] Focus ring is visible
- [ ] Icon-only buttons have accessible names
- [ ] Reduced Motion disables nonessential animation
- [ ] Light-mode contrast is readable
- [ ] Dark-mode contrast is readable

## Production
- [ ] Deep-link reload works on every route
- [ ] Perenual environment variable configured on host
- [ ] No secret `.env` committed
- [ ] HTTPS active
- [ ] Privacy and Terms reviewed for the intended public release
