import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DROITFIN',
  description: 'Fondation pour la promotion des droits humains',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>
        <header className="bg-white shadow-md py-4">
          <div className="container mx-auto px-4">
            <a href="/" className="text-xl font-bold">DROITFIN</a>
          </div>
        </header>
        {children}
        <footer className="bg-gray-800 text-white py-4">
          <div className="container mx-auto px-4 text-center">
            <p>&copy; {new Date().getFullYear()} DROITFIN</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
