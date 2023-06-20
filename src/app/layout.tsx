import { type ComponentWithChildren } from "@/components/component";
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata = {
  title: "TOTK Calc",
  description: "What do I need to do?",
};

const RootLayout: ComponentWithChildren = ({ children }) => {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <div className="font-sans">{children}</div>
      </body>
    </html>
  );
};

export default RootLayout;
