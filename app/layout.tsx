import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from './contexts/AuthContext';
import { ResumeProvider, ThemeProvider } from './contexts';
import AuthErrorBoundary from './components/auth/AuthErrorBoundary';
import AuthGuard from './components/auth/AuthGuard';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
  fallback: ['system-ui', 'arial'],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
  fallback: ['monospace'],
});

export const metadata: Metadata = {
  title: "EduAI - Resume Builder & Career Tools",
  description: "Professional resume builder, ATS tools, and career development platform",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <AuthErrorBoundary>
            <AuthProvider>
              <ResumeProvider>
                <AuthGuard>
                  {children}
                </AuthGuard>
              </ResumeProvider>
            </AuthProvider>
          </AuthErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
