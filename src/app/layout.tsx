import { type ComponentWithChildren } from "@/components/component";
import "./globals.css";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import cx from "classnames";
import { SessionProvider } from "@/lib/next-auth";
import { Header } from "@/components/header";
import { QueryClientProvider } from "@/lib/react-query";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "TOTK Calc",
  description: "What do I need to do?",
};

const RootLayout: ComponentWithChildren = ({ children }) => {
  return (
    <SessionProvider>
      <QueryClientProvider>
        <html lang="en">
          <body className={cx(inter.variable, "font-sans")}>
            <Header />
            <div className="p-2 md:p-8">
              {children}
            </div>
            <Analytics />
          </body>
        </html>
      </QueryClientProvider>
    </SessionProvider>
  );
};

export default RootLayout;
