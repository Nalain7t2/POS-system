// src/app/layout.js
import "./globals.css";

export const metadata = {
  title: "POS System",
  description: "Point of Sale - Meri Dukaan",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}