import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'SpeakList - Class Speech Topic Registration',
  description: 'One Class. One Topic. No Confusion. Class speech topic registration with duplicate prevention and Excel export.',
  openGraph: {
    title: 'SpeakList - Class Speech Topic Registration',
    description: 'One Class. One Topic. No Confusion. Class speech topic registration with duplicate prevention and Excel export.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SpeakList - Class Speech Topic Registration',
    description: 'One Class. One Topic. No Confusion. Class speech topic registration with duplicate prevention and Excel export.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
