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
import { Calendar, Flag, GlobeIcon as GolfBall } from "lucide-react";
import Head from "next/head";

const RoundConfigure = () => {
  initFirebase();
  const auth = getAuth();
  const [user, loading] = useAuthState(auth);

  const [courseNames, setCourseNames] = useState<DocumentData[]>([]);
  const [selectedCourseName, setSelectedCourseName] = useState<string>("");
  const [roundName, setRoundName] = useState("");
  const [courseID, setCourseID] = useState<string>("");
  const [roundDate, setRoundDate] = useState<string>("");
  const [dateInputValue, setDateInputValue] = useState<string>("");
  const [courseError, setCourseError] = useState<string>("");
  const [roundNameError, setRoundNameError] = useState<string>("");
  const [gameMode, setGameMode] = useState<string>("");
  const [teamName, setTeamName] = useState<string>("");
  const [teammates, setTeammates] = useState<{ userID: string; name: string }[]>([]);
  const [teamCount, setTeamCount] = useState<number>(1);
  const [searchResults, setSearchResults] = useState<{ userID: string; name: string }[]>([]);
  const { updateRoundID, updateRoundDocID, setCourseHoleDetails, setUserScores } =
    useCurrentRoundStore();
  const { updateSelectedCourseID } = useSelectedCourseIDStore();

  const router = useRouter();

  useEffect(() => {
    // Set default date to today
    const today = moment();
    setRoundDate(today.format("DD/MM/YYYY"));
    setDateInputValue(today.format("YYYY-MM-DD")); // Format for HTML date input

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

  const handleGameModeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setGameMode(e.target.value);
  };

  const handleTeamCountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const count = Math.min(3, Math.max(1, parseInt(e.target.value, 10)));
    setTeamCount(count);
    setTeammates(teammates.slice(0, count)); // Adjust teammates array
  };

  const handleSearchUsers = async (searchTerm: string) => {
    const usersRef = collection(database, "users");
    const q = query(
      usersRef,
      where("displayName", ">=", searchTerm),
      where("displayName", "<=", searchTerm + "\uf8ff")
    );
    const querySnapshot = await getDocs(q);
    setSearchResults(
      querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return { userID: data.id, name: data.displayName };
      })
    );
  };

  const handleAddTeammate = (index: number, user: { userID: string; name: string }) => {
    const updatedTeammates = [...teammates];
    updatedTeammates[index] = user;
    setTeammates(updatedTeammates);
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
    // Create teammateIDs array from teammates
    const teammateIDs = teammates.map((tm) => tm.userID);
    const newRoundDocRef = await addDoc(collectionRef, {
      roundName,
      courseID,
      courseName: selectedCourseName,
      roundDate,
      userID: user.uid,
      roundID: uuidv4(),
      gameMode,
      teamName,
      teammates,
      teammateIDs, // <-- Add this field
      teamCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
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

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const htmlDate = e.target.value; // Format: YYYY-MM-DD
    setDateInputValue(htmlDate);

    // Convert to the app's date format (DD/MM/YYYY) for storage
    if (htmlDate) {
      const formattedDate = moment(htmlDate).format("DD/MM/YYYY");
      setRoundDate(formattedDate);
    }
  };

  return (
    <>
      <Head>
        <title>Configure Round</title>
        <meta name='description' content='Set up your round - Gimme back my son!' />
        <link rel='icon' href='/golf-cart-icon_96.png' />
      </Head>

      <div className={styles.configureContainer}>
        <main className={`container ${styles.mainContent}`}>
          <div className={styles.configureCard}>
            <h2 className={styles.cardTitle}>Start a New Round</h2>
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
                <label htmlFor='gameMode' className={styles.formLabel}>
                  Game Mode
                </label>
                <select
                  id='gameMode'
                  className={styles.formSelect}
                  value={gameMode}
                  onChange={handleGameModeChange}
                >
                  <option value=''>Select a game mode</option>
                  <option value='Ambrose'>Ambrose</option>
                  {/* Add more game modes here */}
                </select>
              </div>

              {gameMode === "Ambrose" && (
                <>
                  <div className={styles.formGroup}>
                    <label htmlFor='teamCount' className={styles.formLabel}>
                      Number of Teammates
                    </label>
                    <input
                      id='teamCount'
                      type='number'
                      min='1'
                      max='3'
                      value={teamCount}
                      onChange={handleTeamCountChange}
                      className={styles.formInput}
                    />
                  </div>

                  {Array.from({ length: teamCount }).map((_, index) => (
                    <div key={index} className={styles.formGroup}>
                      <label htmlFor={`teammate-${index}`} className={styles.formLabel}>
                        Teammate {index + 1}
                      </label>
                      <input
                        id={`teammate-${index}`}
                        type='text'
                        className={styles.formInput}
                        placeholder='Search for a user'
                        onChange={(e) => handleSearchUsers(e.target.value)}
                      />
                      <ul className={styles.searchResults}>
                        {searchResults.map((user) => (
                          <li
                            key={user.userID}
                            onClick={() => handleAddTeammate(index, user)}
                            className={styles.searchResultItem}
                          >
                            {user.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}

                  <div className={styles.formGroup}>
                    <label htmlFor='teamName' className={styles.formLabel}>
                      Team Name
                    </label>
                    <input
                      id='teamName'
                      type='text'
                      className={styles.formInput}
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                    />
                  </div>
                </>
              )}

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
                <label htmlFor='roundDate' className={styles.formLabel}>
                  Date
                </label>
                <div className={styles.dateInputWrapper}>
                  <input
                    id='roundDate'
                    type='date'
                    className={styles.formInput}
                    value={dateInputValue}
                    onChange={handleDateChange}
                  />
                </div>
                <div className={styles.dateDisplay}>Selected: {roundDate}</div>
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
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default RoundConfigure;
