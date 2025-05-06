"use client";

import type React from "react";

import { getAuth } from "firebase/auth";
import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { database, initFirebase } from "firebaseConfig";
import { ArrowLeft, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import styles from "./Profile.module.css";

const ProfilePage = () => {
  initFirebase();
  const auth = getAuth();
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [userDocId, setUserDocId] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        const usersRef = collection(database, "users");
        const q = query(usersRef, where("id", "==", user.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          setDisplayName(userData.name || "");
          setOriginalName(userData.name || "");
          setUserDocId(querySnapshot.docs[0].id);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [user]);

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
        <p className={styles.loadingText}>Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    router.push("/");
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
        <p className={styles.loadingText}>Redirecting to login...</p>
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (displayName.trim() === "") {
      setUpdateError("Name cannot be empty");
      return;
    }

    if (displayName === originalName) {
      // No changes made
      router.push("/dashboard");
      return;
    }

    setIsUpdating(true);
    setUpdateError("");
    setUpdateSuccess(false);

    try {
      // Update the user document in Firestore
      const userDocRef = doc(database, "users", userDocId);
      await updateDoc(userDocRef, {
        name: displayName,
        lastUpdated: new Date(),
      });

      // Update successful
      setUpdateSuccess(true);
      setOriginalName(displayName);

      // Redirect after a short delay to show success message
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Error updating profile:", error);
      setUpdateError("Failed to update profile. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={styles.profileContainer}>
      <main className='container py-4'>
        <div className={styles.profileCard}>
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>
              <User size={40} />
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className={styles.profileForm}>
            <div className={styles.formGroup}>
              <label htmlFor='displayName' className={styles.formLabel}>
                Display Name
              </label>
              <input
                id='displayName'
                type='text'
                className={styles.formInput}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder='Your name'
              />
            </div>

            {updateError && <p className={styles.errorText}>{updateError}</p>}
            {updateSuccess && <p className={styles.successText}>Profile updated successfully!</p>}

            <div className={styles.buttonGroup}>
              <button type='submit' className={styles.primaryButton} disabled={isUpdating}>
                {isUpdating ? "Updating..." : "Save Changes"}
              </button>
              <Link href='/dashboard' className={styles.secondaryButton}>
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
