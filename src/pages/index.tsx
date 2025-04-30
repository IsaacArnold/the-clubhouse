import Head from "next/head";

import SignIn from "./auth/SignIn";

export default function Home() {
  return (
    <>
      <Head>
        <meta charSet='utf-8' />
        <title>The Clubhouse</title>
        <meta name='description' content='The Clubhouse - Track your golf game' />
        <meta name='viewport' content='width=device-width, initial-scale=1, maximum-scale=1' />
      </Head>
      <main>
        <SignIn />
      </main>
    </>
  );
}
