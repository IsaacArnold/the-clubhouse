import { ReactNode } from "react";
import Navigation from "./Navigation/Navigation";
import styles from "./layout.module.css";

interface Props {
    children?: ReactNode
}

export default function Layout({ children }: Props) {
    return (
      <>
        <Navigation />
        <main className={styles.main}>{children}</main>
      </>
    );
}