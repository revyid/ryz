import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import FloatingNavbar from '@/components/NavBar';
import ClerkRemover from '@/components/ClerkRemover';
import { dark } from '@clerk/themes';
import './globals.css';
const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-inter',
});
const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
];
export const metadata: Metadata = {
    title: 'Ryz',
    description: '',
};
export default function RootLayout({ children, }: {
    children: React.ReactNode;
}) {
    return (<ClerkProvider appearance={{
            baseTheme: dark,
        }}>
      <html lang="en" className={inter.variable}>
        <body className="min-h-screen bg-slate-950 text-slate-50">
          
        <ClerkRemover config={{
            selectors: [
                '.cl-internal-1hp5nqm',
                '.cl-internal-piyvrh',
                '.cl-internal-df7v37',
                '.cl-internal-y44tp9',
                '.cl-internal-16mc20d',
                '.cl-internal-wf8x4b',
                '.cl-internal-1fcj7sw',
                '.cl-internal-5ghyhf',
                '.cl-internal-16vtwdp'
            ],
            debug: true,
        }}/>
          <FloatingNavbar navItems={navItems}/>
          
          
          <main className=" bg-slate-950 min-h-[calc(100vh-4rem)]">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>);
}
