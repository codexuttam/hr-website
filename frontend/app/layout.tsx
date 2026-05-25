import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { AuthProvider } from './contexts/AuthContext';
import { ResumeProvider, ThemeProvider } from './contexts';
import AuthErrorBoundary from './components/auth/AuthErrorBoundary';
import AuthGuard from './components/auth/AuthGuard';

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
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
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
