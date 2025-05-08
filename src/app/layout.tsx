
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import AppHeader from '@/components/layout/AppHeader';
import AppFooter from '@/components/layout/AppFooter'; 
import { Toaster } from "@/components/ui/toaster";
import { ScoreProvider } from '@/contexts/ScoreContext';
import { UserProvider } from '@/contexts/UserContext';
import { SpacedRepetitionProvider } from '@/contexts/SpacedRepetitionContext';
import SiteMascot from '@/components/mascot/SiteMascot';
import { ThemeProvider } from '@/contexts/ThemeContext'; 
import { SavedQuotesProvider } from '@/contexts/SavedQuotesContext'; // Import SavedQuotesProvider

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'DayWise - Plan Your Day',
  description: 'Intelligently schedule your tasks and plan your day with DayWise.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground flex flex-col min-h-screen`}>
        <ThemeProvider>
          <ScoreProvider>
            <UserProvider>
              <SpacedRepetitionProvider>
                <SavedQuotesProvider> {/* Add SavedQuotesProvider here */}
                  <AppHeader />
                  <main className="flex-grow container mx-auto px-4 py-8">
                    {children}
                  </main>
                  <Toaster />
                  <SiteMascot />
                  <AppFooter />
                </SavedQuotesProvider>
              </SpacedRepetitionProvider>
            </UserProvider>
          </ScoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
