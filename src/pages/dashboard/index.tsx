"use client";

import { getAuth } from "firebase/auth";
import { database, initFirebase } from "firebaseConfig";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import styles from "./Dashboard.module.css";
import { ClipboardList, Flag, LogOut } from "lucide-react";
import Head from "next/head";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useState, useEffect } from "react";
import Image from "next/image";

const Dashboard = () => {
  initFirebase();
  const auth = getAuth();
  const router = useRouter();
  const [user, loading] = useAuthState(auth);
  const [userName, setUserName] = useState("");
  const [userPhoto, setUserPhoto] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        const usersRef = collection(database, "users");
        const q = query(usersRef, where("id", "==", user.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          setUserName(userData.name || user.displayName?.split(" ")[0] || "");
          setUserPhoto(userData.photoURL || null);
        } else {
          // Fallback to Firebase Auth display name
          setUserName(user.displayName?.split(" ")[0] || "");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        // Fallback to Firebase Auth display name
        setUserName(user.displayName?.split(" ")[0] || "");
      }
    };

    fetchUserData();
  }, [user]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.actionIcon}>
          <svg
            className='animate-spin h-5 w-5'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
          >
            <circle
              className='opacity-25'
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              strokeWidth='4'
            ></circle>
            <path
              className='opacity-75'
              fill='currentColor'
              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
            ></path>
          </svg>
        </div>
        <p className={styles.loadingText}>Loading...</p>
      </div>
    );
  }

  if (!user) {
    // If there is no user, then we must have signed out, so redirect back home
    router.push("/");
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.actionIcon}>
          <svg
            className='animate-spin h-5 w-5'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
          >
            <circle
              className='opacity-25'
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              strokeWidth='4'
            ></circle>
            <path
              className='opacity-75'
              fill='currentColor'
              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
            ></path>
          </svg>
        </div>
        <p className={styles.loadingText}>Signing out...</p>
      </div>
    );
  }

  const signOut = async () => {
    return auth.signOut();
  };

  return (
    <>
      <Head>
        <title>Dashboard</title>
        <meta name='description' content='View your golf stats and start tracking your rounds' />
        <link rel='icon' href='/golf-cart-icon_96.png' />
      </Head>

      <div className={styles.dashboardContainer}>
        <main className={`container ${styles.mainContent}`}>
          <div className={styles.welcomeCard}>
            <div className={styles.welcomeContent}>
              {userPhoto && (
                <div className={styles.welcomePhoto}>
                  <Image
                    src={userPhoto}
                    alt='Profile'
                    width={60}
                    height={60}
                    className={styles.welcomePhotoImg}
                  />
                </div>
              )}
              <h2 className={styles.greeting}>Welcome back, {userName}</h2>

              <div className={styles.actionsGrid}>
                <div className={styles.actionCard}>
                  <Link href='/myRounds' className={styles.actionLink}>
                    <div className={styles.actionIcon}>
                      <ClipboardList size={20} />
                    </div>
                    <h3 className={styles.actionTitle}>View My Rounds</h3>
                    <p className={styles.actionDescription}>
                      See your past rounds and track your progress
                    </p>
                  </Link>
                </div>

                <div className={styles.actionCard}>
                  <Link href='/configureRound' className={styles.actionLink}>
                    <div className={styles.actionIcon}>
                      <Flag size={20} />
                    </div>
                    <h3 className={styles.actionTitle}>Start a Round</h3>
                    <p className={styles.actionDescription}>
                      Begin a new round and track your scores
                    </p>
                  </Link>
                </div>
              </div>

              <button onClick={signOut} className={styles.signOutButton}>
                <div className='flex items-center justify-center gap-1'>
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </div>
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Dashboard;
