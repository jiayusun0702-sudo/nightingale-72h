import "./globals.css";

export const metadata = {
  title: "Nightingale Care Note",
  description: "Longitudinal Shared Patient Record",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-100 min-h-screen font-sans antialiased text-slate-800">
        {children}
      </body>
    </html>
  );
}
