import { ReactNode } from "react";
import Navigation from "./Navigation/Navigation";
import styles from "./layout.module.css";
import { useRouter } from "next/router";

interface Props {
  children?: ReactNode;
}

export default function Layout({ children }: Props) {
  const router = useRouter();

  // Hide Navigation on the SignIn page
  const hideNavigation = router.pathname === "/";

  return (
    <>
      {!hideNavigation && <Navigation />}
      <main className={!hideNavigation ? styles.main : ''}>{children}</main>
    </>
  );
}
