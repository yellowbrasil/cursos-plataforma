import './globals.css';

export const metadata = {
  title: 'Plataforma de Cursos',
  description: 'Plataforma de cursos online',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
