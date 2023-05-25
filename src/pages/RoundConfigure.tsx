import {
  useCurrentRoundStore,
  useSelectedCourseNameStore,
} from "@/store/store";
import { Input, Select, Spinner } from "@chakra-ui/react";
import { User, getAuth } from "firebase/auth";
import {
  DocumentData,
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
} from "firebase/firestore";
import { database, initFirebase } from "firebaseConfig";
import moment from "moment";
import Link from "next/link";
import router from "next/router";
import { ChangeEvent, SetStateAction, useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid";

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
  const [selectedCourseName, setSelectedCourseName] = useState<String>("");
  const [roundName, setRoundName] = useState("");
  const [courseID, setCourseID] = useState<String>("");
  const [roundDate, setRoundDate] = useState<String>("");
  const { updateRoundID } = useCurrentRoundStore();

  initFirebase();
  const auth = getAuth();
  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    setRoundDate(moment().format("DD/MM/YYYY"));

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

  //#region --- User stuff ---
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
  //#endregion

  const onRoundConfigSubmit = async () => {
    const collectionRef = collection(database, "rounds");
    // Adds a doc to the rounds collection
    const newRoundDocRef = await addDoc(collectionRef, {
      roundName,
      courseID: courseID,
      courseName: selectedCourseName,
      roundDate: roundDate,
      userID: user.uid,
      roundID: uuidv4(),
    });
    const currentRoundDocRef = getDoc(newRoundDocRef);
    const currentRoundDetails: any = await currentRoundDocRef;

    // Adds the roundID to the store so we can write scores to a specific round
    updateRoundID(currentRoundDetails.data().roundID);

    // Resets the input fields
    setRoundName("");
  };

  const signOut = async () => {
    return auth.signOut();
  };

  const getAndSetSelectedCourseNameAndID = (
    element: ChangeEvent<HTMLSelectElement>
  ) => {
    // Sets the courseID so we can add it to the round document in DB.
    setCourseID(element.target.value);

    /*  
      Finds the repsective courseName based off the selected option and stores it in localState which then adds it to the round document. This is so we can read it in the My Rounds component.
    */
    const selectedCourse = courseNames.find(
      (course) => course.courseID === element.target.value
    );
    const selectedCourseName = selectedCourse?.courseName;
    setSelectedCourseName(selectedCourseName);
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
            onChange={(e) => {
              getAndSetSelectedCourseNameAndID(e);
            }}
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
              required={true}
            />
          </Contanier>

          <button onClick={onRoundConfigSubmit}>
            <Link href="/scorecard/Scorecard">Start</Link>
          </button>
          <button>
            <Link href="/myRounds/MyRounds"> View My Rounds</Link>
          </button>
          <button onClick={signOut}>Sign out</button>
        </InternalContent>
      </Contanier>
    </>
  );
};

export default RoundConfigure;
