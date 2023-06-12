import { getAuth } from "firebase/auth";
import {
  DocumentData,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { database, initFirebase } from "firebaseConfig";
import { SetStateAction, useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

import styles from "./MyRounds.module.scss";

const MyRounds = () => {
  initFirebase();
  const auth = getAuth();
  const [user] = useAuthState(auth);

  const [myRounds, setMyRounds] = useState<DocumentData[]>([]);

  const userID = user?.uid;

  const getUserRounds = async () => {
    if (userID) {
      const q = query(
        collection(database, "rounds"),
        where("userID", "==", userID)
      );
      const querySnapshot = await getDocs(q);
      const myRoundsData: SetStateAction<DocumentData[]> = [];
      querySnapshot.forEach((doc) => {
        myRoundsData.push({ ...doc.data() });
      });
      setMyRounds(myRoundsData);
    }
  };

  useEffect(() => {
    getUserRounds();
  }, [userID]);

  return (
    <div className="container">
      <h1>My Rounds</h1>
      <div className="internalContent">
        {myRounds.map((round) => (
          <div key={round.roundID} className={styles.roundContainer}>
            <div className={styles.roundDetailsTop}>
              <p>{round.roundName}</p>
              <p>{round.roundDate}</p>
            </div>
            <i className={styles.roundDetailsBottom}>{round.courseName}</i>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyRounds;
