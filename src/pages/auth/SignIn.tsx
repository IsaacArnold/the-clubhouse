import { Spinner } from "@chakra-ui/react";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { initFirebase } from "firebaseConfig";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";

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
    router.push("/welcomeScreen");
  }

  const signIn = async () => {
    const result = await signInWithPopup(auth, provider);
    console.log(result.user);
  };
  return (
    <>
      <main>
        <div>
          <p>Welcome</p>
          <button onClick={signIn}>Sign In</button>
        </div>
      </main>
    </>
  );
};

export default SignIn;
