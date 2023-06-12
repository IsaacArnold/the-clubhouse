import { Spinner } from "@chakra-ui/react";
import { getAuth } from "firebase/auth";
import { initFirebase } from "firebaseConfig";
import Link from "next/link";
import router from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";

import "./WelcomeScreen.module.scss";

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
      <div className="signOutDiv">
        <Spinner color="red.500" />
        <h2>Signing out</h2>
      </div>
    );
  }

  const signOut = async () => {
    return auth.signOut();
  };

  return (
    <>
      <div className="container">
        <h1>The Clubhouse</h1>
        <div className="internalContent">
          <h2>Hello, {user?.displayName}</h2>
          <button>
            <Link href="/myRounds">View My Rounds</Link>
          </button>
          <button>
            <Link href="/RoundConfigure">Start a round</Link>
          </button>
          <button onClick={signOut}>Sign out</button>
        </div>
      </div>
    </>
  );
};

export default WelcomeScreen;
