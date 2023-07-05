import { type ComponentWithChildren } from "@/components/component";
import "./globals.css";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import cx from "classnames";
import { SessionProvider } from "@/lib/next-auth";
import { Header } from "@/components/header";
import { QueryClientProvider } from "@/lib/react-query";
import { StoreProvider } from "@/state/provider";
import { Modals } from "@/components/modals";

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
        <StoreProvider>
          <html lang="en">
            <body className={cx(inter.variable, "font-sans")}>
              <Header />
              <div className="p-2 md:p-8">{children}</div>
              <Modals />
              <Analytics />
            </body>
          </html>
        </StoreProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
};

export default RootLayout;
