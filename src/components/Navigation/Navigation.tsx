"use client";

import { Menu, ArrowLeft, Home, ClipboardList, Flag, LogOut } from "lucide-react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./Navigation.module.css";
import { getAuth } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";

interface NavigationProps {
  pageTitle?: string;
  pageSubtitle?: string;
  showBackButton?: boolean;
}

const Navigation = ({ pageTitle, pageSubtitle, showBackButton = true }: NavigationProps) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const auth = getAuth();
  const [user] = useAuthState(auth);

  const handleBack = () => {
    router.back();
  };

  const signOut = async () => {
    await auth.signOut();
    router.push("/");
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMenuOpen && !target.closest(`.${styles.menuContainer}`)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <nav className={styles.nav}>
        <div className={styles.navBackground}>
          {/* Golf course image in the background */}
          <Image
            src='/images/bunker.png' // Adjust path as needed
            alt=''
            fill
            className={styles.navImage}
            priority
          />
          <div className={styles.navOverlay}></div>
        </div>
        <div className={styles.container}>
          {showBackButton ? (
            <button onClick={handleBack} className={styles.button}>
              <ArrowLeft size={20} />
            </button>
          ) : (
            <div className={styles.logoContainer}>
              <span className={styles.logo}>Clubhouse</span>
            </div>
          )}

          <div className={styles.menuContainer}>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={styles.menuButton}>
              <Menu size={20} />
            </button>

            {isMenuOpen && (
              <div className={styles.menuDropdown}>
                <Link
                  href='/dashboard'
                  className={styles.menuLink}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Home size={16} className={styles.menuIcon} />
                  Dashboard
                </Link>
                <Link
                  href='/myRounds'
                  className={styles.menuLink}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ClipboardList size={16} className={styles.menuIcon} />
                  My Rounds
                </Link>
                <Link
                  href='/configureRound'
                  className={styles.menuLink}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Flag size={16} className={styles.menuIcon} />
                  Start a Round
                </Link>
                {user && (
                  <button onClick={signOut} className={styles.menuLink}>
                    <LogOut size={16} className={styles.menuIcon} />
                    Sign Out
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {pageTitle && (
        <header className={styles.pageHeader}>
          <div className={styles.pageHeaderContainer}>
            <h1 className={styles.pageTitle}>{pageTitle}</h1>
            {pageSubtitle && <p className={styles.pageSubtitle}>{pageSubtitle}</p>}
          </div>
        </header>
      )}

      {/* Add this to pages that don't have a pageTitle prop */}
      {!pageTitle && <div className={styles.contentSpacer}></div>}
    </>
  );
};

export default Navigation;
