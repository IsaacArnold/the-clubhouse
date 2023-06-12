import { Spinner } from "@chakra-ui/react";
import { getAuth } from "firebase/auth";
import { initFirebase } from "firebaseConfig";
import Link from "next/link";
import router from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import styled from "styled-components";

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

const WelcomeScreen = () => {
  initFirebase();
  const auth = getAuth();
  const [user, loading] = useAuthState(auth);

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

  const signOut = async () => {
    return auth.signOut();
  };

  return (
    <>
      <Contanier>
        <h1>The Clubhouse</h1>
        <InternalContent>
          <h2>Hello, {user?.displayName}</h2>
          <button>
            <Link href="/myRounds">View My Rounds</Link>
          </button>
          <button>
            <Link href="/RoundConfigure">Start a round</Link>
          </button>
          <button onClick={signOut}>Sign out</button>
        </InternalContent>
      </Contanier>
    </>
  );
};

export default WelcomeScreen;
