# Contributing to CryptoTraderPro

First off, thank you for considering contributing to CryptoTraderPro! 🎉

## 🚀 Quick Start

### Prerequisites

- Node.js 18.17+
- Git
- Basic knowledge of React, Next.js, and TypeScript

### Development Setup

1. **Fork & Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/CryptoTraderPro.git
   cd CryptoTraderPro
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## 📋 Development Workflow

### Branch Naming Convention

- `feature/description` - New features
- `fix/description` - Bug fixes
- `chore/description` - Maintenance tasks
- `docs/description` - Documentation updates

### Commit Message Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

feat(dashboard): add real-time price updates
fix(charts): resolve TradingView chart rendering issue
chore(deps): update dependencies
docs(readme): add deployment instructions
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting, missing semi-colons, etc)
- `refactor`: Code refactoring
- `test`: Adding missing tests
- `chore`: Maintenance

### Pull Request Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/awesome-feature
   ```

2. **Make Your Changes**
   - Write clean, readable code
   - Follow existing code style
   - Add comments for complex logic
   - Update documentation if needed

3. **Test Your Changes**
   ```bash
   npm run lint
   npm run type-check
   npm run test
   npm run build
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat(charts): add volume indicators to TradingView charts"
   ```

5. **Push & Create PR**
   ```bash
   git push origin feature/awesome-feature
   ```

## 📝 Code Style Guidelines

### TypeScript

- Use **strict TypeScript** settings
- Prefer **interfaces** over types for object shapes
- Use **type** for unions, primitives, and computed types
- Add proper **JSDoc comments** for public APIs

### React Components

- Use **functional components** with hooks
- Prefer **named exports** over default exports
- Keep components **small and focused**
- Use **TypeScript interfaces** for props

```tsx
// ✅ Good
interface ButtonProps {
  variant?: 'primary' | 'secondary'
  onClick?: () => void
  children: React.ReactNode
}

export function Button({ variant = 'primary', onClick, children }: ButtonProps) {
  return (
    <button className={`btn-${variant}`} onClick={onClick}>
      {children}
    </button>
  )
}

// ❌ Bad
export default function Button(props: any) {
  return <button {...props} />
}
```

### Styling

- Use **Tailwind CSS** classes
- Follow **mobile-first** responsive design
- Use **semantic class names** for custom styles
- Prefer **CSS variables** for theme colors

### File Organization

```
src/
├── app/              # Next.js App Router pages
├── components/       # Reusable components
│   ├── ui/          # shadcn/ui components
│   ├── charts/      # Chart components
│   └── dashboard/   # Dashboard-specific components
├── hooks/           # Custom React hooks
├── lib/             # Utilities and API clients
├── store/           # State management
└── types/           # TypeScript definitions
```

## 🧪 Testing

### Writing Tests

- Write tests for **utility functions**
- Test **component behavior**, not implementation
- Use **descriptive test names**
- Mock **external dependencies**

```tsx
// Example test
import { render, screen } from '@testing-library/react'
import { formatCurrency } from '@/lib/utils'

describe('formatCurrency', () => {
  it('should format USD currency correctly', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56')
  })

  it('should handle small values with more decimals', () => {
    expect(formatCurrency(0.001234)).toBe('$0.001234')
  })
})
```

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🐛 Bug Reports

When filing a bug report, please include:

1. **Clear description** of the issue
2. **Steps to reproduce** the behavior
3. **Expected behavior**
4. **Screenshots** (if applicable)
5. **Environment details** (browser, OS, Node version)
6. **Console errors** (if any)

## ✨ Feature Requests

For feature requests, please provide:

1. **Clear description** of the feature
2. **Use case** and motivation
3. **Proposed implementation** (if you have ideas)
4. **Alternative solutions** you've considered

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TradingView Lightweight Charts](https://www.tradingview.com/lightweight-charts/)

## 🤝 Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

## 🏆 Recognition

Contributors will be recognized in our README and release notes. Thank you for making CryptoTraderPro better!

---

**Questions?** Feel free to ask in [GitHub Discussions](https://github.com/Gzeu/CryptoTraderPro/discussions) or [Discord](https://discord.gg/cryptotraderpro).