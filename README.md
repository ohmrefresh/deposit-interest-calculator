# 💰 Deposit Interest Calculator

A modern, feature-rich Thai deposit interest calculator built with React, TypeScript, and Tailwind CSS. Calculate tiered interest rates with daily, monthly, or annual compounding, complete with detailed breakdowns and beautiful visualizations.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Bun](https://img.shields.io/badge/bun-1.2.22-f472b6.svg)

## ✨ Features

### 🧮 **Advanced Interest Calculation**
- **Tiered Interest Rates**: Support for multiple interest rate tiers based on deposit amounts
- **Flexible Compounding**: Simple or compound interest with daily, monthly, biannual, or annual periods
- **Precise Calculations**: Accurate to 10 decimal places using Decimal.js
- **Date Range Support**: Calculate interest for any time period

### 📊 **Rich Visualizations**
- **Interactive Charts**: Beautiful line charts showing interest growth over time (powered by Recharts)
- **Animated Counters**: Smooth number animations for engaging data presentation
- **Summary Dashboard**: At-a-glance metrics with color-coded cards
- **Progress Indicators**: Visual return on investment tracking

### 🔧 **User-Friendly Tools**
- **Comparison Mode**: Compare different interest scenarios side-by-side
- **Preset Manager**: Save and load your favorite calculation configurations
- **Calculation History**: Access and restore previous calculations
- **Export Options**: Download results as PDF or Excel spreadsheet

### 💅 **Modern UI/UX**
- **Vibrant Design**: Beautiful purple-to-pink gradient theme with smooth animations
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **Keyboard Shortcuts**: 
  - `Ctrl+Enter` / `Cmd+Enter` - Calculate
  - `Esc` - Reset form

### 📈 **Detailed Breakdowns**
- Monthly interest breakdown with running totals
- Daily interest calculations per tier
- Tier-by-tier interest distribution
- Comprehensive PDF and Excel exports

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh) 1.2.22 or higher
- Node.js 18+ (for compatibility)

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd deposit-interest-calculator

# Install dependencies with Bun (fast! ⚡)
bun install

# Start development server
bun dev
```

The app will be available at `http://localhost:8080`

## 📦 Available Scripts

```bash
# Development
bun dev              # Start dev server with hot reload
bun run build        # Build for production
bun run build:dev    # Build in development mode
bun run preview      # Preview production build
bun run lint         # Run ESLint
```

## 🛠️ Tech Stack

### Core Technologies
- **[Bun](https://bun.sh)** - Lightning-fast JavaScript runtime & package manager
- **[Vite](https://vitejs.dev/)** - Next-generation frontend tooling
- **[React 18](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework

### UI Components & Libraries
- **[shadcn/ui](https://ui.shadcn.com/)** - Re-usable component library
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives (alert-dialog, dialog, dropdown-menu, label, scroll-area, select, tabs, toast, tooltip)
- **[Lucide React](https://lucide.dev/)** - Beautiful icon set
- **[Recharts](https://recharts.org/)** - Composable charting library

### State Management
- **[TanStack Query](https://tanstack.com/query)** - Powerful data synchronization
- **localStorage** - Client-side persistence for presets & history

### Utilities
- **[Decimal.js](https://mikemcl.github.io/decimal.js/)** - Arbitrary-precision decimal math
- **[html2canvas](https://html2canvas.hertzen.com/)** - HTML to canvas rendering
- **[jsPDF](https://github.com/parallax/jsPDF)** - PDF generation
- **[SheetJS](https://sheetjs.com/)** - Excel spreadsheet handling
- **[Sonner](https://sonner.emilkowal.ski/)** - Toast notifications

## 📁 Project Structure

```
deposit-interest-calculator/
├── src/
│   ├── components/
│   │   ├── InterestCalculator/     # Main calculator components
│   │   │   ├── index.tsx           # Main calculator container
│   │   │   ├── Header.tsx          # App header
│   │   │   ├── DepositForm.tsx     # Input form
│   │   │   ├── TierEditor.tsx      # Interest tier configuration
│   │   │   ├── ResultsDisplay.tsx  # Results container
│   │   │   ├── SummaryDashboard.tsx # Summary metrics
│   │   │   ├── InterestChart.tsx   # Chart visualization
│   │   │   ├── DailyBreakdownTable.tsx # Detailed breakdown
│   │   │   ├── ComparisonMode.tsx  # Comparison tool
│   │   │   ├── PresetManager.tsx   # Preset management
│   │   │   ├── CalculationHistory.tsx # History tracking
│   │   │   ├── ExportButtons.tsx   # Export functionality
│   │   │   └── AnimatedCounter.tsx # Number animations
│   │   └── ui/                     # shadcn/ui components
│   ├── lib/
│   │   ├── interest-calculator.ts  # Core calculation logic
│   │   └── utils.ts                # Utility functions
│   ├── pages/
│   │   ├── Index.tsx               # Home page
│   │   └── NotFound.tsx            # 404 page
│   ├── App.tsx                     # App container
│   ├── main.tsx                    # Entry point
│   └── index.css                   # Global styles & theme
├── public/                         # Static assets
├── package.json                    # Dependencies & scripts
├── bun.lockb                       # Bun lockfile
├── tsconfig.json                   # TypeScript config
├── vite.config.ts                  # Vite config
├── tailwind.config.ts              # Tailwind config
└── components.json                 # shadcn/ui config
```

## 🎨 Design System

### Color Palette
- **Primary**: Purple gradient (#667eea → #764ba2)
- **Secondary**: Cyan gradient (#4facfe → #00f2fe)
- **Accent**: Pink/Yellow gradient (#fa709a → #fee140)

### Key Features
- Custom gradient backgrounds
- Smooth animations and transitions
- Glassmorphism effects
- Responsive typography
- Accessible color contrast

## 🧪 Core Calculation Logic

The calculator uses precise decimal arithmetic to handle:
- Tiered interest rate application
- Simple vs compound interest
- Multiple compounding periods (daily, monthly, biannual, annual)
- Leap year calculations
- Day count conventions

Example tier structure:
```typescript
[
  { min: '1.00', max: '1000000.00', rate: '2.00' },
  { min: '1000000.01', max: '2000000.00', rate: '1.50' },
  { min: '2000000.01', max: '', rate: '0.50' }
]
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- **Live Demo**: [Coming Soon]
- **Issues**: [GitHub Issues](https://github.com/ohmrefresh/deposit-interest-calculator/issues)

## 📞 Support

For questions or support, please open an issue on GitHub.

---

Built with ❤️ using Bun, React, and TypeScript
