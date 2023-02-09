import { Input } from "@chakra-ui/react";
import { addDoc, collection } from "firebase/firestore";
import { database } from "firebaseConfig";
import { useState } from "react";

interface ScoreFormProps {
  setUpdateTrigger: () => void;
}

const ScoreForm = (props: ScoreFormProps) => {
  const [holeScore, setHoleScore] = useState({
    holeNumber: 0,
    holePar: 0,
    holeScore: 0,
  });

  const onSubmit = async () => {
    const collectionRef = collection(
      database,
      "golf_scores",
      "Wynnum",
      "holeScores"
    );
    const docRef = await addDoc(collectionRef, { ...holeScore });
    setHoleScore({
      holeNumber: 0,
      holePar: 0,
      holeScore: 0,
    });
    props.setUpdateTrigger();
    alert(`Golf score added successfully with this id: ${docRef.id}`);
  };

  return (
    <div>
      <Input
        type="number"
        placeholder="Hole number"
        value={holeScore.holeNumber}
        onChange={(e) =>
          setHoleScore({ ...holeScore, holeNumber: parseInt(e.target.value) })
        }
      />
      <Input
        type="number"
        placeholder="Hole par"
        value={holeScore.holePar}
        onChange={(e) =>
          setHoleScore({ ...holeScore, holePar: parseInt(e.target.value) })
        }
      />
      <Input
        type="number"
        placeholder="Your score"
        value={holeScore.holeScore}
        onChange={(e) =>
          setHoleScore({ ...holeScore, holeScore: parseInt(e.target.value) })
        }
      />
      <button onClick={onSubmit}>Submit score</button>
    </div>
  );
};

export default ScoreForm;
