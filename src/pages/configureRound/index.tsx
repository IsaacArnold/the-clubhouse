"use client";

import { useCurrentRoundStore, useSelectedCourseIDStore } from "@/store/store";
import { getAuth } from "firebase/auth";
import {
  type DocumentData,
  addDoc,
  collection,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { database, initFirebase } from "firebaseConfig";
import moment from "moment";
import Link from "next/link";
import { useRouter } from "next/router";
import { type ChangeEvent, type SetStateAction, useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { v4 as uuidv4 } from "uuid";
import styles from "./ConfigureRound.module.css";
import { ArrowLeft, Flag, GlobeIcon as GolfBall } from "lucide-react";

const RoundConfigure = () => {
  const [courseNames, setCourseNames] = useState<DocumentData[]>([]);
  const [selectedCourseName, setSelectedCourseName] = useState<string>("");
  const [roundName, setRoundName] = useState("");
  const [courseID, setCourseID] = useState<string>("");
  const [roundDate, setRoundDate] = useState<string>("");
  const [courseError, setCourseError] = useState<string>("");
  const [roundNameError, setRoundNameError] = useState<string>("");
  const { updateRoundID, updateRoundDocID, setCourseHoleDetails, setUserScores } =
    useCurrentRoundStore();
  const { updateSelectedCourseID } = useSelectedCourseIDStore();

  const router = useRouter();

  initFirebase();
  const auth = getAuth();
  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    setRoundDate(moment().format("DD/MM/YYYY"));

    const getGolfCourses = async () => {
      const golfCourses = query(collection(database, "courses"));
      const snapShot = await getDocs(golfCourses);
      const data: SetStateAction<DocumentData[]> = [];
      snapShot.forEach((doc) => {
        data.push({ ...doc.data() });
      });
      setCourseNames(data);
    };

    getGolfCourses();
  }, []);

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
        <p className={styles.loadingText}>Loading courses...</p>
      </div>
    );
  }

  if (!user) {
    // If there is no user, then we must have signed out, so redirect back home
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
        <p className={styles.loadingText}>Signing out...</p>
      </div>
    );
  }

  const onRoundConfigSubmit = async () => {
    let hasError = false;

    if (!courseID) {
      setCourseError("Please select a course");
      hasError = true;
    }

    if (!roundName) {
      setRoundNameError("Please enter a round name");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    const collectionRef = collection(database, "rounds");
    const newRoundDocRef = await addDoc(collectionRef, {
      roundName,
      courseID: courseID,
      courseName: selectedCourseName,
      roundDate: roundDate,
      userID: user.uid,
      roundID: uuidv4(),
      scores: [],
    });

    const currentRoundDocRef = getDoc(newRoundDocRef);
    const currentRoundDetails: any = await currentRoundDocRef;

    if (currentRoundDetails.data().courseID === undefined) {
      console.error("You need to provide a courseID - add it in the Firestore Database.");
    }

    // Reset the Zustand store state for the new round
    setUserScores([]); // Clear previous user scores
    setCourseHoleDetails([]); // Clear previous course hole details

    // Adds the roundID to the store so we can write scores to a specific round
    updateRoundID(currentRoundDetails.data().roundID);
    // Sending the Firestore documentId for this round to the store, so we can access it later to write data to.
    updateRoundDocID(newRoundDocRef.id);

    // Fetch course hole details and set them in the store
    const courseQuery = query(collection(database, "courses"), where("courseID", "==", courseID));
    const courseSnapshot = await getDocs(courseQuery);
    const courseData = courseSnapshot.docs[0]?.data();
    setCourseHoleDetails(courseData.holeDetails);

    setRoundName("");
    router.push(`/hole/1`);
  };

  const signOut = async () => {
    return auth.signOut();
  };

  const getAndSetSelectedCourseNameAndID = (element: ChangeEvent<HTMLSelectElement>) => {
    // Clear the error when user selects a course
    setCourseError("");

    // Sets the courseID so we can add it to the round document in DB.
    setCourseID(element.target.value);

    /*  
      Finds the repsective courseName based off the selected option and stores it in localState which then adds it to the round document. This is so we can read it in the My Rounds component.
    */
    const selectedCourse = courseNames.find((course) => course.courseID === element.target.value);

    // Set the courseID in the global store so that we can access it from the individual hole scoring page at: /hole/[holeNumber]
    const selectedCourseID = selectedCourse?.courseID;
    updateSelectedCourseID(selectedCourseID);

    const selectedCourseName = selectedCourse?.courseName;
    setSelectedCourseName(selectedCourseName);
  };

  const handleRoundNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Clear the error when user types
    setRoundNameError("");
    setRoundName(e.target.value);
  };

  // Get first name only for greeting
  const firstName = user?.displayName?.split(" ")[0] || "";

  return (
    <div className={styles.configureContainer}>
      <header className={styles.header}>
        <div className='container'>
          <div className={styles.headerContent}>
            <Link href='/dashboard' className={styles.backLink}>
              <ArrowLeft size={18} />
              <span>Dashboard</span>
            </Link>
            <h1 className={styles.headerTitle}>Clubhouse</h1>
            <div style={{ width: "24px" }}></div> {/* Spacer for alignment */}
          </div>
        </div>
      </header>

      <main className={`container ${styles.mainContent}`}>
        <div className={styles.configureCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Start a New Round</h2>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.formGroup}>
              <label htmlFor='courseSelect' className={styles.formLabel}>
                Select a Course
              </label>
              <select
                id='courseSelect'
                className={`${styles.formSelect} ${courseError ? styles.formSelectError : ""}`}
                onChange={(e) => {
                  getAndSetSelectedCourseNameAndID(e);
                }}
                value={courseID.toString()}
              >
                <option value='' disabled selected>
                  Choose a golf course
                </option>
                {courseNames.map((course) => (
                  <option value={course.courseID} key={course.courseID}>
                    {course.courseName}
                  </option>
                ))}
              </select>
              {courseError && <p className={styles.errorText}>{courseError}</p>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor='roundName' className={styles.formLabel}>
                Round Name
              </label>
              <input
                id='roundName'
                type='text'
                className={`${styles.formInput} ${roundNameError ? styles.formInputError : ""}`}
                placeholder='e.g., Morning round with friends'
                value={roundName}
                onChange={handleRoundNameChange}
              />
              {roundNameError && <p className={styles.errorText}>{roundNameError}</p>}
            </div>

            <div className={styles.formGroup}>
              <div className={styles.formLabel}>Date</div>
              <div className={styles.dateDisplay}>{roundDate}</div>
            </div>

            <div className={styles.buttonGroup}>
              <button className={styles.primaryButton} onClick={onRoundConfigSubmit}>
                <GolfBall size={16} className='inline-block mr-2' />
                Start Round
              </button>
              <Link href='/myRounds' className={styles.secondaryButton}>
                <Flag size={16} className='inline-block mr-2' />
                View My Rounds
              </Link>
            </div>

            <button
              onClick={signOut}
              className={styles.tertiaryButton}
              style={{ marginTop: "1rem" }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RoundConfigure;
