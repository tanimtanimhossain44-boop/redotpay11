import "./globals.css";

export const metadata = {
  title: "RedotPay Mail",
  description: "Private RedotPay email dashboard"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}