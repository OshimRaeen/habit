import './globals.css';

export const metadata = {
  title: 'Habit Tracker',
  description: 'Build discipline. Track habits.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#111111] text-zinc-200 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}