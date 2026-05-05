import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sentinel Intelligence - Strategic Monitoring',
  description: 'AI-powered strategic monitoring platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark">
      <body className={`${inter.className} min-h-screen bg-surface-950 text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
