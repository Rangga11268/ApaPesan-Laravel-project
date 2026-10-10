# E2E Test Infra: ApaPesan Redesign

## Test Philosophy
- Opaque-box, requirement-driven testing derived from `ORIGINAL_REQUEST.md` and `PROJECT.md`.
- Zero tolerance for AI-slop violations or visual contrast breakage.
- Methodology: Category-Partition + Boundary Value Analysis + Pairwise Combinations + Real-World Application Workloads.

## Feature Inventory Coverage Matrix
| # | Feature | Requirement | Tier 1 (Coverage) | Tier 2 (Boundary) | Tier 3 (Pairwise) | Tier 4 (Workload) |
|---|---------|-------------|:-----------------:|:-----------------:|:-----------------:|:-----------------:|
| F01 | Dual-Theme Token System | R1, PROJECT.md | 5 | 5 | ✓ | ✓ |
| F02 | Geometric SVG Brand Logo | R1, PROJECT.md | 5 | 5 | ✓ | ✓ |
| F03 | Auth Screens Contrast | R1, PROJECT.md | 5 | 5 | ✓ | ✓ |
| F04 | Dead File & Orphan Pruning | R2, PROJECT.md | 5 | 5 | ✓ | ✓ |
| F05 | Controller & Route Hygiene | R2, PROJECT.md | 5 | 5 | ✓ | ✓ |
| F06 | Database & Inertia Optimization | R2, PROJECT.md | 5 | 5 | ✓ | ✓ |
| F07 | Comment Slop Removal | R2, PROJECT.md | 5 | 5 | ✓ | ✓ |
| F08 | MedTrackr Navigation Rail | R1, PROJECT.md | 5 | 5 | ✓ | ✓ |
| F09 | Conversation List Pane | R1, PROJECT.md | 5 | 5 | ✓ | ✓ |
| F10 | Message Thread Pane | R1, PROJECT.md | 5 | 5 | ✓ | ✓ |
| F11 | Unified Message Input Bar | R1, PROJECT.md | 5 | 5 | ✓ | ✓ |
| F12 | Modal Wiring & Bug Fixes | R1, R2, PROJECT.md | 5 | 5 | ✓ | ✓ |
| F13 | Responsive & Mobile View | R1, PROJECT.md | 5 | 5 | ✓ | ✓ |
| F14 | Comprehensive UI States | R1, PROJECT.md | 5 | 5 | ✓ | ✓ |

## Test Architecture
- **E2E Test Runner**: Dedicated Node.js & PHP test harnesses executing automated assertions against components, routes, markup, and database states.
- **Static & Contrast Verifier**: Automated contrast ratio calculation script verifying WCAG AA >= 4.5:1 text and >= 3:1 UI borders across theme tokens.
- **Antislop Gate Verifier**: Regex & AST scanner verifying zero em-dashes in UI strings, zero dead button handlers, zero orphaned files, and zero AI-slop comments.

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Full Auth, Theme Switching & Token Persistence | F01, F02, F03 | High |
| 2 | Navigation Rail Toggle, Search & Group Creation Flow | F08, F09, F12, F14 | High |
| 3 | Message Composition, Attachment & Emoji Threading | F10, F11, F06 | High |
| 4 | Mobile View Transition & Responsive Tap Targets | F08, F11, F13 | High |
| 5 | Codebase Hygiene, Dead File Cleanliness & Build Check | F04, F05, F07 | Medium |

## Coverage Thresholds
- Tier 1: ≥5 per feature (70+ test cases across 14 features)
- Tier 2: ≥5 per feature (70+ boundary cases)
- Tier 3: Pairwise coverage across major feature interactions (15+ cases)
- Tier 4: ≥5 realistic end-to-end workload scenarios
- **Total Minimum Target: ~160 test assertions**
