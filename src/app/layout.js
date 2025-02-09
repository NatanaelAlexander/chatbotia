import "./globals.css";

export const metadata = {
  title: "Natanael Bot",
  description: "Natanael Bot chat ia",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white">
        {children}
      </body>
    </html>
  );
}
