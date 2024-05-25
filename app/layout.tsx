import NavbarLayout from '@/components/NavbarLayout';
import { Noise } from '@/components/ui/noise';
import { cn } from '@/utils/cn';
import type { Metadata } from 'next';
import { ThemeProvider } from "next-themes";
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  weight: '400',
  subsets: ['cyrillic', 'latin', 'latin-ext']
});


const description =
  'A Full stack web developer passionate about building web applications, working with data driven applications, getting useful insights, and communicating it to solve business problems.'
const name = 'Abhishek Kushwaha'


export const metadata: Metadata = {
  title: {
    default: name,
    absolute: `${name} | 💻`,
    template: `%s | ${name}`,
  },
  description,
  keywords: [
    'Abhishek Kushwaha',
    'Abhishek',
    'Kushwaha',
    'Abhishek Kushwaha Portfolio',
    'Abhishek Kushwaha Blog',
    'Abhishek Kushwaha Resume',
    'Abhishek Kushwaha Projects',
    'Abhishek Kushwaha Contact',
    'Abhishek Kushwaha About',
    'Abhishek Kushwaha Skills',
    'Abhishek Kushwaha Experience',
    'Abhishek Kushwaha Education',
    'Abhishek Kushwaha Work',
    'Abhishek Kushwaha',
    "full-stack developer portfolio",
    "web application developer portfolio",
    "front-end developer portfolio",
    "back-end developer portfolio",
    "javascript developer portfolio",
    "react developer portfolio",
    "node.js developer portfolio",
    "angular developer portfolio",
    "vue.js developer portfolio",
    "full-stack web development portfolio",
    "single-page application developer portfolio",
    "progressive web app developer portfolio",
    "responsive web design portfolio",
    "web application development portfolio",
    "web development case studies",
    "web developer projects showcase",
    "web developer skills and experience",
    "web developer about me",
    "web developer resume",
  ],
  applicationName: name,
  openGraph: {
    title: name,
    description,
    type: 'website',
    locale: 'en_US',
    emails: ['abhishekkushwaha1479@gmail.com'],
    url: 'https://abhishekkushwaha.me',
    images: [
      {
        url: 'https://abhishekkushwaha.me/thumbnail.jpg',
        width: 800,
        height: 600,
        alt: name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: name,
    description,
    creator: '@abbhishekstwt',
  },
  robots: {
    index: true,
    follow: true,
    noarchive: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true
    }
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(`relative overflow-hidden dark:bg-brand-dark`, inter.className)}>
        <ThemeProvider attribute="class">
          <Noise />
          <NavbarLayout>

            {children}
          </NavbarLayout>
        </ThemeProvider >
      </body>
    </html>
  );
}
