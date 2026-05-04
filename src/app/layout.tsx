import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MyApp — Auth",
  description: "Auth demo (signup, login, password reset).",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="topbar">
          <a href="/" className="brand">MyApp</a>
        </header>
        <main className="page">{children}</main>
        <footer className="footer">
          <span>© MyApp</span>
        </footer>
      </body>
    </html>
  );
}
