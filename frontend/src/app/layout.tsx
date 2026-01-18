import './globals.css';
import { HeroUIProvider } from '@heroui/react';
import { Providers } from './providers';

export const metadata = {
  title: 'Codenames',
  description: 'The classic word game, now online',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-background-main text-text-main">
        <HeroUIProvider>
          <Providers>{children}</Providers>
        </HeroUIProvider>
      </body>
    </html>
  );
}
