import "./globals.css";

export const metadata = {
  title: "Nightingale Care Note",
  description: "Longitudinal Shared Patient Record System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50">{children}</body>
    </html>
  );
}
