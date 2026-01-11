# AI Coding Agent Instructions

## Project Overview

This is a **Thai Interest Calculator** single-page application built with React, TypeScript, Vite, and shadcn/ui. Originally created via Lovable.dev, it calculates interest using tiered rates with high precision (Decimal.js).

**Core Purpose:** Calculate simple/compound interest with support for multiple interest rate tiers, historical tracking, preset management, and data export (PDF/Excel).

## Architecture & Structure

### Component Organization
- **Monolithic Calculator:** Main logic lives in [`src/components/InterestCalculator/index.tsx`](../src/components/InterestCalculator/index.tsx) (~350 lines) managing all form state, validation, calculation, and history
- **Feature Components:** Broken into focused sub-components under `src/components/InterestCalculator/`:
  - `DepositForm.tsx` - Form inputs with live validation
  - `TierEditor.tsx` - Dynamic tier management (add/remove/edit interest rate tiers)
  - `ResultsDisplay.tsx` - Results with tier breakdown, charts, daily breakdown tables
  - `PresetManager.tsx` - Save/load calculation presets (localStorage)
  - `CalculationHistory.tsx` - Calculation history with restore functionality (localStorage)
  - `ComparisonMode.tsx` - Side-by-side comparison of calculation scenarios
  - `ExportButtons.tsx` - PDF/Excel export using jsPDF and xlsx
- **shadcn/ui Components:** All UI primitives in `src/components/ui/` (buttons, tables, tabs, dialogs, etc.)
- **Routing:** Simple React Router setup in [`src/App.tsx`](../src/App.tsx) - main route (`/`) renders `Index` page which renders `InterestCalculator`

### Core Business Logic
- **[`src/lib/interest-calculator.ts`](../src/lib/interest-calculator.ts):** Pure calculation functions using Decimal.js for precision
  - `calculateInterest()` - Main calculation engine supporting simple/compound interest with daily/monthly/biannual/annual application
  - `splitAmountByTiers()` - Distributes deposit amount across tiered interest rates
  - Leap year aware date calculations with `calculateDays()`
  - All monetary values use `Decimal` type internally, strings externally
  
### Data Flow Pattern
1. User input → form state (strings for amounts to preserve formatting)
2. On calculate → validate → parse strings → Decimal calculations → Result object
3. Result → localStorage history + display in UI
4. Export → serialize to PDF/Excel with formatted data

## Development Workflow

### Build & Dev Commands
```bash
bun run dev        # Start dev server on http://[::]:8080
bun run build      # Production build
bun run preview    # Preview production build
bun run lint       # ESLint check
```

### Key Configuration Files
- **Vite:** [`vite.config.ts`](../vite.config.ts) - React SWC plugin, path alias `@` → `src/`, lovable-tagger in dev mode
- **Tailwind:** [`tailwind.config.ts`](../tailwind.config.ts) - CSS variables for theming, custom color palette (success/warning/etc)
- **shadcn/ui:** [`components.json`](../components.json) - Component generation config, path aliases match Vite

### Installing New shadcn/ui Components
```bash
npx shadcn@latest add [component-name]
```
Components auto-install to `src/components/ui/` with proper path aliases.

## Project-Specific Conventions

### 1. Thai Language UI
- All user-facing text is in Thai (ภาษาไทย)
- When adding features, maintain Thai language for labels, messages, validation errors
- Use `toast` from `sonner` for success/error messages in Thai

### 2. Number Formatting & Precision
- **Always use Decimal.js** for monetary calculations (configured for 50-digit precision, ROUND_HALF_UP)
- Store amounts as **strings** (not numbers) to preserve precision between components
- Use `formatNumber()` for display (comma separators), `parseInputValue()` to strip commas
- Interest values display with 10 decimals: `formatNumber(value, 10)`
- Currency displays with 2 decimals: `formatNumber(value, 2)` or `formatTHB(value)`

Example:
```typescript
// ✓ Correct
const amount = parseInputValue(depositAmount); // "100000.00"
const result = new Decimal(amount).times(rate);

// ✗ Wrong - loses precision
const amount = parseFloat(depositAmount);
```

### 3. State Management Pattern
- **No global state library** - useState/useEffect in main component
- **localStorage** for persistence (history, presets) via custom hooks
- **Form validation** done inline with `errors` record, not react-hook-form
- **Keyboard shortcuts:** Ctrl/Cmd+Enter to calculate, Escape to reset (see `handleKeyDown` in index.tsx)

### 4. Date Handling
- Dates stored as ISO string format (`YYYY-MM-DD`)
- Default: today → 1 year later
- Calculations are **inclusive** of both start and end dates
- Leap year aware via `isLeapYear()` helper

### 5. Tier System
- Tiers define interest rate ranges: `{ min: string, max: string, rate: string }`
- Empty `max` means "and above" (e.g., `2,000,000.01+`)
- Always sort tiers by min ascending before calculation
- User can add/remove/edit tiers dynamically in UI

### 6. Component Styling
- **Tailwind utility classes** with `cn()` helper for conditional classes
- **CSS variables** for theming (defined in `src/index.css`): `--primary`, `--background`, etc.
- **shadcn/ui variants:** Use `buttonVariants`, `cardVariants`, etc. from ui components
- Custom animations in `tailwind.config.ts`: `animate-slide-up`, `animate-fade-in`

### 7. Export Feature
- **PDF:** Uses `html2canvas` + `jsPDF` - captures results div as image
- **Excel:** Uses `xlsx` library - serializes breakdown data to workbook
- Exports include all calculation metadata (dates, tiers, amounts, results)

## Common Tasks

### Adding a New Calculation Mode
1. Add state in `InterestCalculator/index.tsx`
2. Update `calculateInterest()` in `interest-calculator.ts` to handle new mode
3. Add UI controls in `DepositForm.tsx` or create new sub-component
4. Update `ResultsDisplay.tsx` if results display changes

### Adding New Validation Rules
1. Update `validate()` function in `InterestCalculator/index.tsx`
2. Add error messages to `errors` state
3. For live validation, add to `liveValidation` state in `DepositForm.tsx`

### Adding New Export Format
1. Add button to `ExportButtons.tsx`
2. Implement export logic using appropriate library (reference existing PDF/Excel patterns)
3. Ensure all calculation metadata is included in export

### Modifying Interest Calculation Logic
1. **Always test with edge cases:** leap years, end-of-month dates, very large numbers
2. Update `interest-calculator.ts` functions
3. Verify Decimal.js precision is maintained
4. Update types if calculation result structure changes
5. Test exports still work correctly

## External Dependencies

### Critical Libraries
- **Decimal.js** - High-precision arithmetic (DO NOT use native JS math for money)
- **date-fns** - Date utilities (though most date logic is custom)
- **@tanstack/react-query** - Query client provider (currently unused but configured)
- **lucide-react** - Icon library (use for all icons)

### shadcn/ui Ecosystem
- **Radix UI** - Headless components (@radix-ui/react-*)
- **class-variance-authority** - Variant management for components
- **tailwind-merge** + **clsx** - Utility class merging (via `cn()`)

## Integration Points

### localStorage API
- **Presets:** `interest-calculator-presets` key
- **History:** `interest-calculator-history` key  
- **Schema:** Arrays of JSON objects, max 50 entries for history
- **No API calls** - entirely client-side application

### Lovable.dev Integration
- `lovable-tagger` plugin in dev mode tags components for Lovable editor
- Project editable via Lovable web UI (see README)
- Changes sync bidirectionally between local and Lovable

## Testing & Debugging

### No Test Suite
- Project has no tests configured (no Jest/Vitest/etc)
- Manual testing workflow: run dev server, test calculations with various inputs

### Debugging Calculations
1. Add `console.log(result)` after `calculateInterest()` call
2. Check `result.tierResults` to verify tier splitting
3. Inspect `result.breakdown` for monthly accrual details
4. Use browser DevTools → Application → Local Storage to inspect saved data

### Common Issues
- **Precision loss:** Ensure all calculations use Decimal, not native numbers
- **Date range errors:** Verify end date > start date, handle leap years
- **Tier overlap:** Ensure tiers don't overlap and cover full range
- **Export fails:** Check browser console for canvas/PDF errors, verify result data structure

## Reference Examples

### Adding a New Form Field
```typescript
// 1. Add state in InterestCalculator/index.tsx
const [newField, setNewField] = useState<string>("");

// 2. Add to DepositForm.tsx
<Input
  value={newField}
  onChange={(e) => setNewField(e.target.value)}
  placeholder="กรอกข้อมูล"
/>

// 3. Add validation in validate()
if (!newField) {
  newErrors.newField = 'กรุณากรอกข้อมูล';
}
```

### Using Decimal.js Correctly
```typescript
import Decimal from 'decimal.js';

// ✓ Correct
const rate = new Decimal('2.5').div(100);  // 0.025
const interest = principal.times(rate);

// ✗ Wrong
const rate = 2.5 / 100;  // loses precision
```

---

**Last Updated:** 2026-01-11  
**Project Type:** React SPA (Single Page Application)  
**Primary Language:** Thai (UI), English (code/comments)
