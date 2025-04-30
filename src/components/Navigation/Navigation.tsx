"use client";

import { Menu, Home, ClipboardList, Flag, LogOut } from "lucide-react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./Navigation.module.css";
import { getAuth } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { initFirebase } from "firebaseConfig";

const Navigation = () => {
  initFirebase();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const auth = getAuth();
  const [user] = useAuthState(auth);

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

  return (
    <>
      <nav className={styles.nav}>
        <div className={styles.navBackground}>
          {/* Try multiple possible image paths */}
          {!imageError && (
            <Image
              src='/images/bunker.jpg'
              alt=''
              fill
              className={styles.navImage}
              priority
              onError={() => setImageError(true)}
            />
          )}
          {imageError && (
            <Image
              src='/bunker.jpg'
              alt=''
              fill
              className={styles.navImage}
              priority
              onError={() => console.log("Both image paths failed")}
            />
          )}
          <div className={styles.navOverlay}></div>
        </div>
        <div className={styles.container}>
          <div className={styles.logoContainer}>
            <Link href='/dashboard'>
              <span className={styles.logo}>Clubhouse</span>
            </Link>
          </div>

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
                  Home
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
    </>
  );
};

export default Navigation;
