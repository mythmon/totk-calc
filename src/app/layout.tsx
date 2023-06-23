import { type ComponentWithChildren } from "@/components/component";
import "./globals.css";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import cx from "classnames";

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
      <body className={cx(inter.variable, "font-sans")}>
        {children}
        <Analytics />
      </body>
    </html>
  );
};

export default RootLayout;
