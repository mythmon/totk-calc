import { type ComponentWithChildren } from "@/components/component";
import "./globals.css";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import cx from "classnames";
import { Header } from "@/components/header";
import { StoreProvider } from "@/state/provider";
import { Modals } from "@/components/modals";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import { prepEnv } from "@/lib/server/config";

prepEnv();

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
    <UserProvider>
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
    </UserProvider>
  );
};

export default RootLayout;
