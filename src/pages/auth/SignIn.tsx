import GoogleBtn from "@/components/buttons/GoogleBtn";
import { Spinner } from "@chakra-ui/react";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { addDoc, collection, doc } from "firebase/firestore";
import { database, initFirebase } from "firebaseConfig";
import Image from "next/image";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";

import bunkerImg from "../../images/bunker.jpg";
import styles from "./SignIn.module.scss";

const SignIn = () => {
  initFirebase();
  const provider = new GoogleAuthProvider();
  const auth = getAuth();
  // Tracks the auth state of the use. Only triggered when user signs in or out
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  if (loading) {
    return <Spinner color="purple.500" />;
  }

  if (user) {
    // Redirects user to this component
    router.push("/welcome");
  }

  const registerGoogle = async () => {
    const result = await signInWithPopup(auth, provider);
  };
  return (
    <>
      <div className="container">
        <h1>The Clubhouse</h1>
        <Image
          src={bunkerImg}
          alt="Bunker on a golf course"
          className="mainImg"
          priority
        />
        <div className="internalContent">
          <h2>Login</h2>
          <GoogleBtn />
          <div className={styles.registerCTA}>
            <p>New to The Clubhouse?</p>
            <button className="button" onClick={registerGoogle}>
              Register
            </button>
          </div>
        </div>
        {/* <button onClick={signInGoogle}>Sign-in with Google</button> */}
      </div>
    </>
  );
};

export default SignIn;
