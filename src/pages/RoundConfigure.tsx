import { getAuth, User } from "firebase/auth";
import { Spinner, Input, Select } from "@chakra-ui/react";
import router from "next/router";
import Link from "next/link";
import { useAuthState } from "react-firebase-hooks/auth";
import styled from "styled-components";
import { initFirebase, database } from "firebaseConfig";
import {
  collection,
  getDocs,
  query,
  DocumentData,
  addDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { useEffect, useState, SetStateAction } from "react";
import moment from "moment";

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
`;

const SignoutDiv = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
`;

const Button = styled.button`
  color: var(--primaryGreen);
  font-weight: 700;
  text-align: left;
`;
//#endregion

const RoundConfigure = () => {
  const [courseNames, setCourseNames] = useState<DocumentData[]>([]);
  const [roundName, setRoundName] = useState("");
  const [courseID, setCourseID] = useState<String>("");
  const [roundDate, setRoundDate] = useState<String>("");

  initFirebase();
  const auth = getAuth();
  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    setRoundDate(moment().format("dddd, MMMM D, YYYY"));

    const getGolfCourses = async () => {
      const golfCourses = query(collection(database, "courses"));
      const snapShot = await getDocs(golfCourses);
      const data: SetStateAction<DocumentData[]> = [];
      snapShot.forEach((doc) => {
        data.push({ ...doc.data() });
      });
      setCourseNames(data);
    };

    getGolfCourses();
  }, []);

  if (loading) {
    return <Spinner color="blue.500" />;
  }

  if (!user) {
    // If there is no user, then we must have signed out, so redirect back home
    router.push("/");
    return (
      <SignoutDiv>
        <Spinner color="red.500" />
        <h2>Signing out</h2>
      </SignoutDiv>
    );
  }

  const onRoundConfigSubmit = async () => {
    const collectionRef = collection(database, "rounds");
    // Adds a doc to the rounds collection
    const newRoundDocRef = await addDoc(collectionRef, {
      roundName,
      courseID: courseID,
      roundDate: roundDate,
      userID: user.uid,
    });

    // Resets the input fields
    setRoundName("");
  };

  const signOut = async () => {
    return auth.signOut();
  };

  return (
    <>
      <Contanier>
        <h1>Round Details</h1>
        <InternalContent>
          <h4>Choose a course</h4>
          <Select
            placeholder="Select course"
            isRequired={true}
            onChange={(e) => setCourseID(e.target.value)}
          >
            {courseNames.map((course) => (
              <option value={course.courseID} key={course.courseID}>
                {course.courseName}
              </option>
            ))}
          </Select>

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
          </Contanier>

          <button onClick={onRoundConfigSubmit}>
            <Link href="/scorecard/Scorecard">Start</Link>
          </button>
          <button onClick={signOut}>Sign out</button>
        </InternalContent>
      </Contanier>
    </>
  );
};

export default RoundConfigure;
