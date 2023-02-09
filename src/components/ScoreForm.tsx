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

  const onSubmit = async () => {
    const collectionRef = collection(
      database,
      "golf_scores",
      "Wynnum",
      "holeScores"
    );
    const docRef = await addDoc(collectionRef, { ...holeScore });
    // Resets the input fields
    setHoleScore({
      holeNumber: "",
      holePar: "",
      holeScore: "",
    });
    props.setUpdateTrigger();
    alert(`Golf score added successfully with this id: ${docRef.id}`);
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
