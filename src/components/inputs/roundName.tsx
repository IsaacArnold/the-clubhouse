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

const RoundName = () => {
  const [roundName, setRoundName] = useState("");

  const onSubmit = async () => {
    const collectionRef = collection(database, "rounds");
    const docRef = await addDoc(collectionRef, { roundName });
    // Resets the input fields
    setRoundName("");
    alert(`Golf round added successfully with this id: ${docRef.id}`);
  };

  return (
    <Contanier>
      <label id="roundName">Round name</label>
      <Input
        mb={4}
        focusBorderColor="#4B9D6F"
        id="roundName"
        type="text"
        placeholder="wynnum0502"
        value={roundName}
        onChange={(e) => setRoundName(e.target.value)}
      />
      <Button onClick={onSubmit}>Submit name</Button>
    </Contanier>
  );
};

export default RoundName;
