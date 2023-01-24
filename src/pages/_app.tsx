import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { app, database } from "../../firebaseConfig";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from "firebase/auth";
import { useEffect, useState } from "react";

export default function App({ Component, pageProps }: AppProps) {
  const firebase = app;
  const auth = getAuth(firebase);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  const signIn = () => signInWithPopup(auth, provider);
  const signOut = () => auth.signOut();

  const [user, setUser] = useState();

  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log(user);
    } else {
      console.log("I've signed out");
    }
  });

  return (
    <ChakraProvider>
      <button onClick={signIn}>Sign in</button>
      <button onClick={signOut}>Sign out</button>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}
