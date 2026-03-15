import './globals.css';

export const metadata = {
  title: 'Aircraft Engine Explorer',
  description: 'Interactive aircraft engine types with specs and simulation',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
