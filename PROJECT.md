# Project: ApaPesan Chat Application Redesign & Refactoring

## Architecture
ApaPesan is a real-time web chat application built on Laravel 11, Inertia.js, React 18, and Tailwind CSS.
- **Backend**: Laravel controllers (`app/Http/Controllers/`), Eloquent models (`app/Models/`), policies, observers, and broadcasting (`routes/channels.php` via Laravel Echo).
- **Frontend**: Inertia.js pages (`resources/js/Pages/`), shared layouts (`resources/js/Layouts/`), reusable components (`resources/js/Components/`), and styling (`resources/css/app.css`, `tailwind.config.js`).
- **Data Flow**: Inertia handles SSR-to-client prop hydration; Laravel Echo presences and listens to real-time events (`Socket.io`/Pusher/Reverb); Local state manages active thread, draft messages, audio recording, and theme persistence.
- **Visual Design Standard**: MedTrackr-inspired high-clarity SaaS interface. Grounded neutral surfaces, structured collapsible navigation rail, dedicated conversation pane, clean readable message thread, unified bottom input bar. Dual theme (Light and Dark) governed by semantic CSS tokens with WCAG AA compliance (text >= 4.5:1, UI boundaries >= 3:1).

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F01 | Dual-Theme Token System | CSS variables + Tailwind semantic tokens (`background`, `surface`, `border`, `text-main`, `text-muted`) supporting Light & Dark mode with `localStorage` persistence | M1 | Survey Spec Miner / FE Explorer |
| F02 | Geometric SVG Brand Logo | Authentic geometric interlocking 'A'+'P' monogram SVG for Header/Navbar (`ApplicationLogo.jsx`), Favicon (`favicon.svg`), and Auth screens (`GuestLayout.jsx`) | M1 | Survey Spec Miner / User Request |
| F03 | Auth Screens Visual & Contrast Fix | Remove violet glowing blobs and fix severe contrast breakage in `GuestLayout.jsx` and `TextInput.jsx` for all auth pages | M1 | Survey FE Explorer |
| F04 | Dead File & Orphan Pruning | Delete `MessagaAttachments.jsx` (typo duplicate), `Welcome.jsx` (unrouted), `NavLink.jsx`, `ResponsiveNavLink.jsx` | M2 | Survey BE Explorer |
| F05 | Controller & Route Hygiene | Remove unused resource stubs in `HomeController.php`, deduplicate file deletions between `MessageController.php` and `MessageObserver.php` | M2 | Survey BE Explorer |
| F06 | Database & Inertia Optimization | Fix redundant sidebar query in `HomeController.php`, fix N+1 in `Group::getGroupsForUsers`, and eager-load relations in `MessageController.php` | M2 | Survey BE Explorer |
| F07 | Comment Slop Removal | Remove all ~80 workflow narration, step-by-step comments, and ASCII/empty labels across PHP and JSX files | M2 | Survey BE Explorer / User Request |
| F08 | MedTrackr Navigation Rail | Collapsible sidebar/navigation rail (expanded 260px / collapsed 72px rail on desktop, slide-over drawer on mobile) | M3 | Survey Spec Miner / User Request |
| F09 | Conversation List Pane | Clean 320-360px list pane with search bar, filter tabs, active conversation high-contrast indicator, and wired "Grup Baru" button | M3 | Survey Spec Miner / FE Explorer |
| F10 | Message Thread Pane | Clean, legible chat thread with date dividers, grounded message bubbles (no purple neon gradients), and clear timestamps | M3 | Survey Spec Miner / User Request |
| F11 | Unified Message Input Bar | Bottom container with min 44px tap targets, auto-expanding textarea, attachment previews, and dynamic theme-aware emoji picker | M3 | Survey Spec Miner / FE Explorer |
| F12 | Modal Wiring & Bug Fixes | Wire up `CreateGroupModal.jsx`, `SearchModal.jsx` (fix `auth?.user?.id` ReferenceError), and `ExportModal.jsx` | M3 | Survey BE Explorer / FE Explorer |
| F13 | Responsive & Mobile Breakpoints | Single-pane mobile view (< 680px) with smooth back navigation, min 44px touch targets, and zero horizontal scroll | M3 | Survey Spec Miner / FE Explorer |
| F14 | Comprehensive UI States | Grounded empty states (no chat selected, no search results, no messages), loading skeletons, and error toasts | M3 | Survey Spec Miner / User Request |
| F15 | E2E Test Suite Infrastructure | Comprehensive test harness executing Tiers 1-4 tests covering all 14 features | E2E Track | Project Pattern / Spec Miner |
| F16 | Final Verification & Audit Gate | 100% E2E test suite pass, Tier 5 adversarial hardening, Antislop Delivery Gate 0 FAIL items, and clean Forensic Audit | M4 | Project Pattern / Acceptance Criteria |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| E2E | E2E Test Track | Design test runner, test harness, and Tiers 1-4 test cases; publish TEST_READY.md | none | DONE |
| M1 | Brand Logo & Design System Foundation | Implement Dual-Theme tokens, Tailwind config, CSS variables, authentic SVG monogram logo, favicon, and Auth pages styling | none | DONE |
| M2 | Codebase Hygiene & Query Optimization | Delete dead files, strip controller stubs, remove comment slop, optimize sidebar & message pagination queries | none | DONE |
| M3 | Frontend Chat Redesign & Modal Integration | Build MedTrackr layout, 3-pane structure, conversation list, message thread, unified input, modal wiring & mobile responsiveness | M1, M2 | IN_PROGRESS |
| M4 | Final E2E Pass, Hardening & Audit Gate | Run 100% E2E test suite, Tier 5 adversarial tests, Antislop Gate verification, and Forensic Integrity Audit | M3, E2E | PLANNED |

---

## Interface Contracts

### Theme & Design Tokens Contract
- Root class: `html.dark` or `html.light` toggled via `ThemeContext` / `localStorage.theme`.
- CSS custom properties:
  - `--bg-app`: `#F8FAFC` (light) / `#0B0F17` (dark)
  - `--bg-surface`: `#FFFFFF` (light) / `#111827` (dark)
  - `--bg-surface-elevated`: `#F1F5F9` (light) / `#1F2937` (dark)
  - `--border-subtle`: `#E2E8F0` (light) / `#374151` (dark)
  - `--border-active`: `#64748B` (light) / `#6B7280` (dark) (guarantees >= 3:1 contrast against surface)
  - `--text-primary`: `#0F172A` (light) / `#F9FAFB` (dark) (guarantees >= 16:1 contrast)
  - `--text-muted`: `#475569` (light) / `#9CA3AF` (dark) (guarantees >= 6.9:1 contrast)
  - `--accent-primary`: `#2563EB` (light) / `#3B82F6` (dark)

### Modal Component Contracts
- `CreateGroupModal.jsx`: `isOpen: boolean`, `onClose: () => void`, `users: Array<User>`
- `SearchModal.jsx`: `isOpen: boolean`, `onClose: () => void`, `conversation: Object`, `currentUser: Object` (must safely access `currentUser?.id`)
- `ExportModal.jsx`: `isOpen: boolean`, `onClose: () => void`, `conversation: Object`

### Query Optimization Contract
- `MessageController::byUser` & `byGroup` eager loads:
  `with(['sender', 'attachments', 'replyTo.sender', 'replyTo.attachments', 'reactions.user', 'starredBy'])`
- `Group::getGroupsForUsers` eager loads: `->with('users')`
- `HomeController::home` reuses Inertia shared props without duplicate querying.

---

## Code Layout
- `resources/js/Components/ApplicationLogo.jsx`: ApaPesan geometric monogram SVG
- `public/favicon.svg`: Matching 32x32 SVG favicon
- `resources/js/Layouts/AuthenticatedLayout.jsx`: Master layout providing dual-theme context and navigation rail
- `resources/js/Layouts/ChatLayout.jsx`: MedTrackr 3-pane layout coordinator
- `resources/js/Layouts/GuestLayout.jsx`: High-clarity Auth layout with authentic logo and WCAG-compliant inputs
- `resources/js/Components/App/`:
  - `ConversationHeader.jsx`: Thread header with status indicator, search, export triggers
  - `ConversationItem.jsx`: Individual chat card with avatar, unread badge, and snippet
  - `MessageItem.jsx`: Message bubble with reactions, status ticks, and metadata
  - `MessageInput.jsx`: Unified auto-expanding input bar with min 44px tap targets
  - `CreateGroupModal.jsx`, `SearchModal.jsx`, `ExportModal.jsx`: Wired modals
- `resources/css/app.css` & `tailwind.config.js`: Semantic theme variables and tokens
