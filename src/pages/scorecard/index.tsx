import ScoreForm from "@/components/ScoreForm";
import { useCurrentRoundStore } from "@/store/store";
import { GolfRound } from "@/types/golfRoundTypes";
import {
  DocumentData,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { database } from "firebaseConfig";
import { useEffect, useState } from "react";

import styles from "./Scorecard.module.scss";

const Scorecard = () => {
  // TODO: There is a slight delay in UI update when you create a new round. The old round is still visible for a second then the new data loads in.
  const [currentRoundName, setCurrentRoundName] = useState<String>("");
  const [courseName, setCourseName] = useState<String>("");
  const [coursePar, setCoursePar] = useState<String>("");
  const [totalDistance, setTotalDistance] = useState<String>("");
  const [courseHoleDetails, setCourseHoleDetails] = useState<DocumentData[]>(
    []
  );
  const currentRoundID = useCurrentRoundStore((state) => state.currentRoundID);

  useEffect(() => {
    console.log("Scorecard > currentRoundID updated:", currentRoundID);
    getCurrentRoundDetails();
  }, [currentRoundID]);

  const getCurrentRoundDetails = async () => {
    const q = query(
      collection(database, "rounds"),
      where("roundID", "==", currentRoundID)
    );
    try {
      const querySnapshot = await getDocs(q);
      const newRoundDetails: GolfRound = querySnapshot.docs.reduce(
        (acc, doc) => {
          const docData = doc.data();
          return { ...acc, ...docData };
        },
        {} as GolfRound
      );
      setCurrentRoundName(newRoundDetails.roundName);
      setCourseName(newRoundDetails.courseName);
      console.log(newRoundDetails);
      getHoleDetails(newRoundDetails.courseID);
    } catch (error) {
      console.log("getCurrentRoundDetails error: ", error);
    }
  };

  const getHoleDetails = async (courseID: string) => {
    if (courseID) {
      console.log(courseID);
      const q = query(
        collection(database, "courses"),
        where("courseID", "==", courseID)
      );
      try {
        const querySnapshot = await getDocs(q);
        let newHoleDetails: DocumentData[] = [];
        querySnapshot.forEach((doc) => {
          newHoleDetails = newHoleDetails.concat(...doc.data().holeDetails);
          setCoursePar(doc.data().coursePar);
          setTotalDistance(doc.data().totalDistance);
        });
        setCourseHoleDetails(newHoleDetails);
        console.log(courseHoleDetails);
      } catch (error) {
        console.log("getHoleDetails error: ", error);
      }
    }
  };

  const displayHoleDetails = () => {
    return (
      <div className={styles.holeDetailsContainer}>
        {courseHoleDetails.map((item) => (
          <div key={item.holeNumber} className={styles.holeDetails}>
            <div className={styles.individualHoleDetails}>
              <p>
                <span className="emphP">Hole:</span> {item.holeNumber}
              </p>
              <p>
                <span className="emphP">Par:</span> {item.holePar}
              </p>
            </div>
            <div className={styles.internalGrid}>
              <div className={styles.secondaryHoleDetails}>
                <p>Distance: {item.holeDistance}m</p>
                <p>Stroke index: {item.strokeIndex}</p>
              </div>
              <div className={styles.individualScoreHoleDetails}>
                <label htmlFor="scoreInput">Your score:</label>
                <input type="number" id="scoreInput" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  useEffect(() => {
    console.log(courseHoleDetails);
  }, [courseHoleDetails]);

  return (
    <div className="container">
      <h1>Your Scorecard</h1>
      <div className="internalContent">
        <div>
          <h2>Round details:</h2>
          <p>Course: {courseName}</p>
          <p>Round name: {currentRoundName}</p>
          <p>Course par: {coursePar}</p>
          <p>Course distance: {totalDistance}m</p>
        </div>
        <div>
          <h2>Round scores:</h2>
          {displayHoleDetails()}
        </div>
      </div>
    </div>
  );
};

export default Scorecard;
