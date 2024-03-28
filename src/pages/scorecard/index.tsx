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
  updateDoc,
} from "firebase/firestore";
import { database } from "firebaseConfig";
import { useEffect, useState } from "react";

import styles from "./Scorecard.module.scss";
import { UserScore } from "@/types/userScore";

const Scorecard = () => {
  // TODO: There is a slight delay in UI update when you create a new round. The old round is still visible for a second then the new data loads in.
  const [currentRoundName, setCurrentRoundName] = useState<String>("");
  const [courseName, setCourseName] = useState<String>("");
  const [coursePar, setCoursePar] = useState<String>("");
  const [totalDistance, setTotalDistance] = useState<String>("");
  const [courseHoleDetails, setCourseHoleDetails] = useState<DocumentData[]>(
    []
  );
  const [userScores, setUserScores] = useState<UserScore[]>([]);
  const currentRoundID = useCurrentRoundStore((state) => state.currentRoundID);
  const roundDocumentID = useCurrentRoundStore(
    (state) => state.roundDocumentID
  );

  useEffect(() => {
    getCurrentRoundDetails();
  }, [currentRoundID]);

  const updateScoreFieldInDoc = async () => {
    try {
      const docRef = doc(database, "/rounds/", `${roundDocumentID}`);
      await updateDoc(docRef, {
        scores: userScores,
      });
    } catch (error) {
      console.log("Error updating score field in document: Caught: ", error);
    }
  };

  const getCurrentRoundDetails = async () => {
    // currentRoundID comes from the store and is updated on the RoundConfigure screen.
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
      getHoleDetails(newRoundDetails.courseID);
    } catch (error) {
      console.log("getCurrentRoundDetails error: ", error);
    }
  };

  const getHoleDetails = async (courseID: string) => {
    if (courseID) {
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
      } catch (error) {
        console.log("getHoleDetails error: ", error);
      }
    }
  };

  const handleSubmit = () => {
    updateScoreFieldInDoc();
    console.log("userScores", userScores);
  };

  const handleScoreChange = (holeNumber: number, score: number) => {
    // Check if an object with the specified holeNumber already exists in userScores
    const existingIndex = userScores.findIndex(
      (hole) => hole.holeNumber === holeNumber
    );

    if (existingIndex !== -1) {
      // Case 1: If an object with the holeNumber exists, update its score
      setUserScores((prevScores) => {
        const updatedScores = [...prevScores];
        updatedScores[existingIndex] = {
          ...updatedScores[existingIndex],
          score,
        };
        return updatedScores;
      });
    } else {
      // Case 2: If no object with the holeNumber exists, create a new object and add it to userScores
      setUserScores((prevScores) => [
        ...prevScores,
        {
          holeNumber,
          holePar:
            courseHoleDetails.find((item) => item.holeNumber === holeNumber)
              ?.holePar || 0,
          score,
        },
      ]);
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
                <label htmlFor={`scoreInput-${item.holeNumber}`}>
                  Your score:
                </label>
                <input
                  type="number"
                  id={`scoreInput-${item.holeNumber}`}
                  onChange={(e) =>
                    handleScoreChange(
                      item.holeNumber,
                      parseInt(e.target.value, 10)
                    )
                  }
                />
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
          <button onClick={handleSubmit}>Submit</button>
        </div>
      </div>
    </div>
  );
};

export default Scorecard;
