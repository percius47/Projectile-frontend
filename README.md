# Projectile Frontend

This is the Next.js frontend for the Projectile construction procurement platform.

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `src/app/` - Next.js app directory with pages and layouts
- `src/components/` - Reusable React components
- `src/contexts/` - React context providers
- `src/services/` - API service layer
- `src/lib/` - Utility functions and helpers

## Features Implemented

1. User Authentication (Login/Register)
2. Dashboard with project listing
3. Project creation

## Environment Variables

Create a `.env` file with the following:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
