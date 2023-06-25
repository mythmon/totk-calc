import { AuthInfo } from "@/components/authInfo";
import type { Component } from "@/components/component";

export const Header: Component = () => {
  return (
    <header className="flex p-3 bg-gray-800 text-white">
      <div className="grow">
        <div>TOTK Calc</div>
      </div>
      <AuthInfo />
    </header>
  );
};
