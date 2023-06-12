import ScoreForm from "@/components/ScoreForm";
import { useCurrentRoundStore } from "@/store/store";
import { Spinner } from "@chakra-ui/react";
import { getAuth } from "firebase/auth";
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
} from "firebase/firestore";
import { database, initFirebase } from "firebaseConfig";
import router from "next/router";
import { SetStateAction, useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

import styles from "./Scorecard.module.scss";

const Scorecard = () => {
  const [holeScores, setHoleScores] = useState<DocumentData[]>([]);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const currentRoundID = useCurrentRoundStore((state) => state.currentRoundID);

  useEffect(() => {
    console.log("currentRoundID updated:", currentRoundID);
  }, [currentRoundID]);

  useEffect(() => {
    const q = query(
      collection(database, "golf_scores", "Wynnum", "holeScores")
    );
    const getData = async () => {
      const querySnapshot = await getDocs(q);
      const data: SetStateAction<DocumentData[]> = [];
      querySnapshot.forEach((doc) => {
        // Adds the data for each hole to the array, plus adds the document ID
        data.push({ ...doc.data(), id: doc.id });
      });
      // Sorts the holeNumbers in ascending order
      data.sort((a, b) => a.holeNumber - b.holeNumber);
      setHoleScores(data);
    };
    getData();
  }, [updateTrigger]);

  const setUpdateTriggerCallback = () => setUpdateTrigger(updateTrigger + 1);

  // console.log(holeScores);

  return (
    <div className="container">
      <h1>Your Scorecard</h1>
      <div className="internalContent">
        <div className={styles.scoreDiv}>
          <ScoreForm setUpdateTrigger={setUpdateTriggerCallback} />
        </div>
        <div className={styles.resultsDiv}>
          <h3>Your Results</h3>
          {holeScores.map((score) => (
            <div className={styles.individualResult} key={score.id}>
              <p>Hole #: {score.holeNumber}</p>
              <p>Par: {score.holePar}</p>
              <p>Your score: {score.holeScore}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Scorecard;
