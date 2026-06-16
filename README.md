# Generative UI Chat

Next.js App Router chat app wired with [OpenUI Chat](https://www.openui.com/) and Gemini.

## Setup

Install dependencies:

```bash
pnpm install
```

Create `.env.local`:

```bash
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash
```

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). If port `3000` is already in use, Next.js will print the alternate local URL.

## Scripts

- `pnpm generate:prompt`: generate `src/generated/system-prompt.txt` from the OpenUI component library.
- `pnpm dev`: generate the OpenUI prompt, then start Next.js.
- `pnpm build`: generate the OpenUI prompt, then build Next.js.
- `pnpm lint`: run ESLint.
- `pnpm test`: run Vitest in watch mode.
- `pnpm test:run`: run Vitest once.
