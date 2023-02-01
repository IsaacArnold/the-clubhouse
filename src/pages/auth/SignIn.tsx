import GoogleBtn from "@/components/buttons/GoogleBtn";
import { Spinner } from "@chakra-ui/react";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { initFirebase } from "firebaseConfig";
import Image from "next/image";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import styled from "styled-components";
import bunkerImg from "../../images/bunker.jpg";

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
`;

const InternalContent = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 10px;
`;

const Heading = styled.h1`
  color: var(--primaryText);
  font-size: 36px;
  font-weight: 600;
  margin-top: 30px;
`;
//#endregion

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

  const signInGoogle = async () => {
    const result = await signInWithPopup(auth, provider);
    console.log(result.user);
  };

  return (
    <>
      <Contanier>
        <Image
          src={bunkerImg}
          alt="Bunker on a golf course"
          className="mainImg"
        />
        <InternalContent>
          <Heading>Login</Heading>
          <GoogleBtn />
        </InternalContent>
        {/* <button onClick={signInGoogle}>Sign-in with Google</button> */}
      </Contanier>
    </>
  );
};

export default SignIn;
