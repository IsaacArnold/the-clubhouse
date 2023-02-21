import { getAuth } from "firebase/auth";
import { Spinner } from "@chakra-ui/react";
import router from "next/router";
import Link from "next/link";
import { useAuthState } from "react-firebase-hooks/auth";
import styled from "styled-components";
import { initFirebase, database } from "firebaseConfig";
import { collection, getDocs, query, DocumentData } from "firebase/firestore";
import { useEffect, useState, SetStateAction } from "react";
import RoundName from "@/components/inputs/roundName";

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
//#endregion

const RoundConfigure = () => {
  const [courseNames, setCourseNames] = useState<DocumentData[]>([]);
  initFirebase();
  const auth = getAuth();
  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    const golfCourses = query(collection(database, "courses"));
    const getGolfCourses = async () => {
      const snapShot = await getDocs(golfCourses);
      const data: SetStateAction<DocumentData[]> = [];
      snapShot.forEach((doc) => {
        data.push({ ...doc.data() });
      });
      setCourseNames(data);
    };
    getGolfCourses();
  }, []);

  console.log(courseNames);

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

  /*
  To configure the round we would create a document under Rounds with the user inputted roundID. We would then fill out the fields in that doc with the courseID, based on the selected course and the date
  */

  return (
    <>
      <Contanier>
        <h1>Round Details</h1>
        <InternalContent>
          <h3>Choose a course</h3>
          {courseNames.map((course) => (
            <p key={course.courseID}>{course.courseName}</p>
          ))}
          <RoundName />
          <button>
            <Link href="/scorecard/Scorecard">Start</Link>
          </button>
        </InternalContent>
      </Contanier>
    </>
  );
};

export default RoundConfigure;
