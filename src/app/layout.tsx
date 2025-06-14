import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { ReactQueryProvider } from '@/providers/ReactQueryProvider';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: '빌릴게 - 복지물품 대여 시스템',
  description: '국민대학교 소프트웨어융합대학 복지물품 대여 시스템',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Toaster position="top-center" reverseOrder={false} />
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  );
}
