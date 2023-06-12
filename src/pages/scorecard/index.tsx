import { Spinner } from "@chakra-ui/react";
import { getAuth } from "firebase/auth";
import { database, initFirebase } from "firebaseConfig";
import router from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import styled from "styled-components";

import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  DocumentData,
} from "firebase/firestore";
import ScoreForm from "@/components/ScoreForm";
import { SetStateAction, useEffect, useState } from "react";
import { useCurrentRoundStore } from "@/store/store";

//#region --- Page styles ---
const Contanier = styled.section`
  display: flex;
  flex-direction: column;
  margin-top: 50px;
  .mainImg {
    border-radius: 25px;
    width: 100%;
    height: 200px;
  }
  h1 {
    margin-bottom: 30px;
  }
  h2 {
    margin-top: 30px;
  }
`;

const InternalContent = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 10px;
`;

const ScoreDiv = styled.div`
  display: flex;
`;

const ResultsDiv = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  h3 {
    margin-top: 20px;
  }
`;

const IndividualResult = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  background-color: var(--primaryGray);
  padding: 10px 20px;
  border-radius: 25px;
`;
//#endregion

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
    <Contanier>
      <h1>Your Scorecard</h1>
      <InternalContent>
        <ScoreDiv>
          <ScoreForm setUpdateTrigger={setUpdateTriggerCallback} />
        </ScoreDiv>
        <ResultsDiv>
          <h3>Your Results</h3>
          {holeScores.map((score) => (
            <IndividualResult key={score.id}>
              <p>Hole #: {score.holeNumber}</p>
              <p>Par: {score.holePar}</p>
              <p>Your score: {score.holeScore}</p>
            </IndividualResult>
          ))}
        </ResultsDiv>
      </InternalContent>
    </Contanier>
  );
};

export default Scorecard;
