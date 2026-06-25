import './globals.css';
import TopBar from '@/components/TopBar';

export const metadata = {
  title: 'Plataforma de Cursos',
  description: 'Plataforma de cursos online',
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
