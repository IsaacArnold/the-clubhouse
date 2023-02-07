import styled from "styled-components";
import Image from "next/image";
import googleLogo from "../../images/icons/googleIcon.png";
import { Spinner } from "@chakra-ui/react";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { initFirebase } from "firebaseConfig";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";

const Button = styled.button`
  background-color: var(--lightenedGreen);
  color: var(--primaryText);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 25px;
  padding: 10px 0;
  margin-top: 30px;
  .logo {
    width: 20px;
    height: 20px;
    margin-right: 40px;
  }
`;

const GoogleIcon = () => {
  return <Image src={googleLogo} alt="Google logo" className="logo" />;
};

const GoogleBtn = () => {
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

  const signInGoogle = async () => {
    const result = await signInWithPopup(auth, provider);
    console.log(result.user);
  };
  return (
    <Button onClick={signInGoogle}>
      <GoogleIcon />
      Sign in with Google
    </Button>
  );
};

export default GoogleBtn;
