"use client";

import type React from "react";

import { getAuth } from "firebase/auth";
import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes, deleteObject } from "firebase/storage";
import { database, storage, initFirebase } from "firebaseConfig";
import { Camera, Trash2, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import styles from "./Profile.module.css";

const ProfilePage = () => {
  initFirebase();
  const auth = getAuth();
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [userDocId, setUserDocId] = useState("");
  const [isUploading, setIsUploading] = useState(false);

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
          setPhotoURL(userData.photoURL || "");
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUpdateError("Image size must be less than 5MB");
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      setUpdateError("File must be an image");
      return;
    }

    setPhotoFile(file);

    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);

    // If we're removing an existing photo (not just a preview)
    if (photoURL && !photoPreview) {
      setIsUploading(true);

      // Delete the photo from storage
      const deletePhotoFromStorage = async () => {
        try {
          // Extract the file name from the URL
          const fileName = photoURL.split("/").pop()?.split("?")[0];
          if (fileName) {
            const photoRef = ref(storage, `profile-photos/${user.uid}/${fileName}`);
            await deleteObject(photoRef);
          }

          // Update the user document
          const userDocRef = doc(database, "users", userDocId);
          await updateDoc(userDocRef, {
            photoURL: "",
            lastUpdated: new Date(),
          });

          setPhotoURL("");
          setUpdateSuccess(true);
          setTimeout(() => setUpdateSuccess(false), 3000);
        } catch (error) {
          console.error("Error removing photo:", error);
          setUpdateError("Failed to remove photo. Please try again.");
        } finally {
          setIsUploading(false);
        }
      };

      deletePhotoFromStorage();
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const uploadPhoto = async (): Promise<string> => {
    if (!photoFile || !user) return photoURL;

    setIsUploading(true);
    try {
      // Create a reference to the file in Firebase Storage
      const fileExtension = photoFile.name.split(".").pop();
      const fileName = `profile-${Date.now()}.${fileExtension}`;
      const storageRef = ref(storage, `profile-photos/${user.uid}/${fileName}`); // Specify a non-root path

      // Upload the file
      await uploadBytes(storageRef, photoFile);

      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      console.log("downloadURL", downloadURL);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading photo:", error);
      throw new Error("Failed to upload photo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (displayName.trim() === "") {
      setUpdateError("Name cannot be empty");
      return;
    }

    const hasNameChanged = displayName !== originalName;
    const hasPhotoChanged = photoFile !== null;

    if (!hasNameChanged && !hasPhotoChanged && !photoPreview) {
      // No changes made
      router.push("/dashboard");
      return;
    }

    setIsUpdating(true);
    setUpdateError("");
    setUpdateSuccess(false);

    try {
      // Upload photo if changed
      let updatedPhotoURL = photoURL;
      if (hasPhotoChanged) {
        updatedPhotoURL = await uploadPhoto();
      }

      // Update the user document in Firestore
      const userDocRef = doc(database, "users", userDocId);
      await updateDoc(userDocRef, {
        name: displayName,
        photoURL: updatedPhotoURL,
        lastUpdated: new Date(),
      });

      // Update successful
      setUpdateSuccess(true);
      setOriginalName(displayName);
      setPhotoURL(updatedPhotoURL);
      setPhotoFile(null);
      setPhotoPreview(null);

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
      <main>
        <div className={styles.profileCard}>
          <div className={styles.avatarSection}>
            <div className={styles.avatarContainer}>
              <div className={styles.avatar}>
                {photoPreview ? (
                  <Image
                    src={photoPreview}
                    alt='Profile preview'
                    width={100}
                    height={100}
                    className={styles.avatarImage}
                  />
                ) : photoURL ? (
                  <Image
                    src={photoURL}
                    alt='Profile'
                    width={100}
                    height={100}
                    className={styles.avatarImage}
                  />
                ) : (
                  <User size={40} />
                )}
              </div>
              <div className={styles.avatarActions}>
                <button
                  type='button'
                  onClick={triggerFileInput}
                  className={styles.avatarButton}
                  disabled={isUploading}
                >
                  <Camera size={16} />
                  <span>{photoURL || photoPreview ? "Change" : "Upload"}</span>
                </button>
                {/* TODO: Remove button doesn't work */}
                {/* {(photoURL || photoPreview) && (
                  <button
                    type='button'
                    onClick={handleRemovePhoto}
                    className={`${styles.avatarButton} ${styles.removeButton}`}
                    disabled={isUploading}
                  >
                    <Trash2 size={16} />
                    <span>Remove</span>
                  </button>
                )} */}
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='image/*'
                  onChange={handleFileChange}
                  className={styles.fileInput}
                />
              </div>
              {isUploading && <p className={styles.uploadingText}>Uploading image...</p>}
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
              <button
                type='submit'
                className={styles.primaryButton}
                disabled={isUpdating || isUploading}
              >
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
