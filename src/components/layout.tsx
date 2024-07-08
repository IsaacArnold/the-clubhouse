import { ReactNode } from "react";

interface Props {
    children?: ReactNode
}

export default function Layout({ children }: Props) {
    return (
      <>
        {/* Navbar here */}
        <main>{children}</main>
        {/* Footer here */}
      </>
    );
}