import { useCurrentRoundStore } from "@/store/store";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { database } from "firebaseConfig";
import { useEffect, useState } from "react";
import styles from "./Scorecard.module.scss";
import { UserScore } from "@/types/userScore";

const Scorecard = () => {
  const [currentRoundName, setCurrentRoundName] = useState<string>("");
  const [courseName, setCourseName] = useState<string>("");
  const [coursePar, setCoursePar] = useState<number>(0);
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const [userScores, setUserScores] = useState<UserScore[]>([]);

  const roundDocumentID = useCurrentRoundStore((state) => state.roundDocumentID);
  const courseHoleDetails = useCurrentRoundStore((state) => state.courseHoleDetails);

  useEffect(() => {
    const fetchRoundDetails = async () => {
      if (!roundDocumentID) return;

      try {
        // Fetch the round document from Firestore
        const docRef = doc(database, "rounds", roundDocumentID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const roundData = docSnap.data();
          setCurrentRoundName(roundData.roundName);
          setCourseName(roundData.courseName);

          // Calculate coursePar and totalDistance from courseHoleDetails
          const par = courseHoleDetails.reduce((sum, hole) => sum + hole.holePar, 0);
          const distance = courseHoleDetails.reduce((sum, hole) => sum + hole.holeDistance, 0);

          setCoursePar(par);
          setTotalDistance(distance);

          // Populate userScores from Zustand store
          setUserScores(useCurrentRoundStore.getState().userScores);
        } else {
          console.error("No such round document!");
        }
      } catch (error) {
        console.error("Error fetching round details:", error);
      }
    };

    fetchRoundDetails();
  }, [roundDocumentID, courseHoleDetails]);

  const handleScoreChange = (holeNumber: number, score: number) => {
    // Update the score for the specific hole
    setUserScores((prevScores) =>
      prevScores.map((hole) =>
        hole.holeNumber === holeNumber ? { ...hole, score } : hole
      )
    );
  };

  const handleSubmitFinalScores = async () => {
    try {
      const docRef = doc(database, "rounds", roundDocumentID);
      await updateDoc(docRef, {
        scores: userScores,
      });
      alert("Final scores submitted successfully!");
    } catch (error) {
      console.error("Error submitting final scores: ", error);
    }
  };

  const displayHoleDetails = () => {
    return (
      <div className={styles.holeDetailsContainer}>
        {courseHoleDetails.map((hole) => {
          const userScore = userScores.find(
            (score) => score.holeNumber === hole.holeNumber
          );

          return (
            <div key={hole.holeNumber} className={styles.holeDetails}>
              <div className={styles.individualHoleDetails}>
                <p>
                  <span className="emphP">Hole:</span> {hole.holeNumber}
                </p>
                <p>
                  <span className="emphP">Par:</span> {hole.holePar}
                </p>
                <p>
                  <span className="emphP">Distance:</span> {hole.holeDistance}m
                </p>
                <p>
                  <span className="emphP">Stroke Index:</span>{" "}
                  {hole.strokeIndex}
                </p>
              </div>
              <div className={styles.individualScoreHoleDetails}>
                <label htmlFor={`scoreInput-${hole.holeNumber}`}>
                  Your score:
                </label>
                <input
                  type="number"
                  id={`scoreInput-${hole.holeNumber}`}
                  value={userScore?.score || ""}
                  onChange={(e) =>
                    handleScoreChange(
                      hole.holeNumber,
                      parseInt(e.target.value, 10)
                    )
                  }
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container">
      <h1>Review Your Scorecard</h1>
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
          <button onClick={handleSubmitFinalScores}>Submit Final Scores</button>
        </div>
      </div>
    </div>
  );
};

export default Scorecard;
