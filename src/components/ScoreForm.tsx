import { Input } from "@chakra-ui/react";
import { addDoc, collection } from "firebase/firestore";
import { database } from "firebaseConfig";
import { useState } from "react";
import styled from "styled-components";

//#region --- Page styles ---
const Contanier = styled.section`
  display: flex;
  flex-direction: column;
  margin-bottom: 30px;
`;

const Button = styled.button`
  color: var(--primaryGreen);
  font-weight: 700;
  text-align: left;
`;
//#endregion

interface ScoreFormProps {
  setUpdateTrigger: () => void;
}

const ScoreForm = (props: ScoreFormProps) => {
  const [holeScore, setHoleScore] = useState({
    holeNumber: "",
    holePar: "",
    holeScore: "",
  });

  // const currentRoundID: number = useAppSelector(
  //   (state) => state.updateRound.roundID
  // );

  const onSubmit = async () => {
    // TODO:
    /*
      1. We want to Get the currentRoundID and create a 'scores' subcollection in the over-arching round.
      2. After that is done, we create the first doc in the 'scores' collection with the information entered by the user.
      It would look something like this:

        // Gets the doc of the round the user just created.
        const currentRoundDocRef = doc(database, "rounds", newRoundDocRef.id);
        // NOTE: We may need to store the newRoundDocRef as a global variable such as currentRoundID...
        // Assigns a new subcollection called 'scores' to the round we just created.
        const roundScoreSubCollectionRef = collection(currentRoundDocRef, "scores");
        await addDoc(roundScoreSubCollectionRef, {
          holeNumber: "",
          scoreValue: "",
          putts: "",
          fairwayHit: true,
        });
    */
    // Resets the input fields
    setHoleScore({
      holeNumber: "",
      holePar: "",
      holeScore: "",
    });
    props.setUpdateTrigger();
  };

  return (
    <Contanier>
      <label id="holeNum">Hole Number</label>
      <Input
        mb={4}
        focusBorderColor="#4B9D6F"
        id="holeNum"
        type="number"
        placeholder="1"
        value={holeScore.holeNumber}
        onChange={(e) =>
          setHoleScore({ ...holeScore, holeNumber: e.target.value })
        }
      />
      <label id="holePar">Hole Par</label>
      <Input
        mb={4}
        focusBorderColor="#4B9D6F"
        id="holePar"
        type="number"
        placeholder="4"
        value={holeScore.holePar}
        onChange={(e) =>
          setHoleScore({ ...holeScore, holePar: e.target.value })
        }
      />
      <label id="yourScore">Your score</label>
      <Input
        mb={4}
        focusBorderColor="#4B9D6F"
        id="yourScore"
        type="number"
        placeholder="5"
        value={holeScore.holeScore}
        onChange={(e) =>
          setHoleScore({ ...holeScore, holeScore: e.target.value })
        }
      />
      <Button onClick={onSubmit}>Submit score</Button>
    </Contanier>
  );
};

export default ScoreForm;
