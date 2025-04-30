"use client";

import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { database, initFirebase } from "firebaseConfig";
import Image from "next/image";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import styles from "./SignIn.module.css";
import bunkerImg from "../../images/bunker.jpg";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { useEffect } from "react";

const SignIn = () => {
  initFirebase();
  const provider = new GoogleAuthProvider();
  const auth = getAuth();
  // Tracks the auth state of the use. Only triggered when user signs in or out
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  // Add user to database when they sign in
  useEffect(() => {
    if (user) {
      generateNewUserOnDB();
    }
  }, [user]);

  const generateNewUserOnDB = async () => {
    const collectionRef = collection(database, "users");

    const q = query(collectionRef, where("id", "==", user?.uid));
    const snapshot = await getDocs(q);
    let golfUser = null;

    if (snapshot.empty) {
      console.log("Doc doesn't exist, so we are going to create one");
      golfUser = {
        id: user?.uid,
        name: user?.displayName,
        email: user?.email,
        createdAt: new Date(),
        lastLogin: new Date(),
      };
      // Document doesn't exist, so we are going to add it
      await addDoc(collectionRef, golfUser);
    } else {
      console.log("Doc does exist");
      // Optionally update the lastLogin time
      // const docRef = doc(database, "users", snapshot.docs[0].id);
      // await updateDoc(docRef, { lastLogin: new Date() });
      golfUser = snapshot.docs[0].data();
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingIcon}>
          <svg
            className='animate-spin h-8 w-8'
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

  if (user) {
    // Redirects user to this component
    router.push("/dashboard");
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingIcon}>
          <svg
            className='animate-spin h-8 w-8'
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
        <p className={styles.loadingText}>Redirecting to dashboard...</p>
      </div>
    );
  }

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  const registerWithGoogle = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error registering with Google:", error);
    }
  };

  return (
    <div className={styles.signInContainer}>
      <div className={styles.imageContainer}>
        <Image
          src={bunkerImg}
          alt='Golf course with bunker'
          className={styles.heroImage}
          priority
        />
        <div className={styles.overlay}>
          <h1 className={styles.appTitle}>The Clubhouse</h1>
          <p className={styles.appTagline}>Light the candle!</p>
        </div>
      </div>

      <div className={styles.contentCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Welcome to The Clubhouse</h2>
          <p className={styles.cardSubtitle}>
            Sign in to track your golf scores and improve your game
          </p>
        </div>

        <button className={styles.googleButton} onClick={signInWithGoogle}>
          <svg
            className={styles.googleIcon}
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 48 48'
            width='24px'
            height='24px'
          >
            <path
              fill='#FFC107'
              d='M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z'
            />
            <path
              fill='#FF3D00'
              d='M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z'
            />
            <path
              fill='#4CAF50'
              d='M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z'
            />
            <path
              fill='#1976D2'
              d='M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z'
            />
          </svg>
          Sign in with Google
        </button>

        <div className={styles.divider}>or</div>

        <div className={styles.registerSection}>
          <p className={styles.registerText}>New to The Clubhouse?</p>
          <button className={styles.registerButton} onClick={registerWithGoogle}>
            Register with Google
          </button>
        </div>

        <p className={styles.footer}>
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default SignIn;
