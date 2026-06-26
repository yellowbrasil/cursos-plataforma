import './globals.css';
import TopBar from '@/components/TopBar';

export const metadata = {
  title: 'AI PRO ACADEMY',
  description: 'AI PRO ACADEMY - Plataforma de Cursos Online',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <TopBar />
        <div style={{ paddingTop: '4px' }}>{children}</div>
      </body>
    </html>
  );
}
