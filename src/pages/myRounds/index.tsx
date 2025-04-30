"use client";

import { getAuth } from "firebase/auth";
import { type DocumentData, collection, getDocs, query, where } from "firebase/firestore";
import { database, initFirebase } from "firebaseConfig";
import { type SetStateAction, useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import styles from "./MyRounds.module.css";
import Link from "next/link";
import { GlobeIcon as GolfBall, MapPin, Plus } from "lucide-react";
import { useRouter } from "next/router";
import Head from "next/head";

const MyRounds = () => {
  initFirebase();
  const auth = getAuth();
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  const [myRounds, setMyRounds] = useState<DocumentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const userID = user?.uid;

  const getUserRounds = async () => {
    if (userID) {
      setIsLoading(true);
      try {
        const q = query(collection(database, "rounds"), where("userID", "==", userID));
        const querySnapshot = await getDocs(q);
        const myRoundsData: SetStateAction<DocumentData[]> = [];
        querySnapshot.forEach((doc) => {
          // Add the document ID to the data for reference
          myRoundsData.push({ id: doc.id, ...doc.data() });
        });

        // Sort rounds by date (newest first)
        myRoundsData.sort((a, b) => {
          // Assuming roundDate is in DD/MM/YYYY format
          const dateA = a.roundDate.split("/").reverse().join("");
          const dateB = b.roundDate.split("/").reverse().join("");
          return dateB.localeCompare(dateA);
        });

        setMyRounds(myRoundsData);
      } catch (error) {
        console.error("Error fetching rounds:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userID) {
      getUserRounds();
    }
  }, [userID]);

  // Calculate relative to par for a round
  const calculateRelativeToPar = (round: DocumentData) => {
    if (!round.scores || round.scores.length === 0) return 0;

    // Get valid scores (scores that have been entered)
    const validScores = round.scores.filter((score: any) => score.score && score.score > 0);
    if (validScores.length === 0) return 0;

    // Calculate total score
    const totalScore = validScores.reduce((sum: number, score: any) => sum + score.score, 0);

    // Calculate total par for the holes that have valid scores
    const totalPar = validScores.reduce((sum: number, score: any) => {
      return sum + (score.holePar || 0);
    }, 0);

    // Return the difference
    return totalScore - totalPar;
  };

  // Format relative to par for display
  const formatRelativeToPar = (relativeToPar: number) => {
    if (relativeToPar === 0) return "E";
    return relativeToPar > 0 ? `+${relativeToPar}` : relativeToPar.toString();
  };

  if (loading || isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingIcon}>
          <svg
            className='animate-spin h-8 w-8'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
          >
            <circle
              className='opacity-25'
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              strokeWidth='4'
            ></circle>
            <path
              className='opacity-75'
              fill='currentColor'
              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
            ></path>
          </svg>
        </div>
        <p className={styles.loadingText}>Loading your rounds...</p>
      </div>
    );
  }

  if (!user) {
    router.push("/");
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingIcon}>
          <svg
            className='animate-spin h-8 w-8'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
          >
            <circle
              className='opacity-25'
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              strokeWidth='4'
            ></circle>
            <path
              className='opacity-75'
              fill='currentColor'
              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
            ></path>
          </svg>
        </div>
        <p className={styles.loadingText}>Redirecting to login...</p>
      </div>
    );
  }

  // Function to view a round's scorecard
  const viewRound = (roundId: string) => {
    // Navigate to the scorecard page with the round ID
    router.push(`/scorecard?roundId=${roundId}`);
  };

  const subtitle =
    myRounds && myRounds.length === 0
      ? "You haven't played any rounds yet"
      : "Check out your rounds below";

  return (
    <>
      <Head>
        <title>My Rounds</title>
        <meta
          name='description'
          content='View your past golf rounds and track your progress over time'
        />
        <link rel='icon' href='/golf-cart-icon_96.png' />
      </Head>

      <div className={styles.myRoundsContainer}>
        <main className={`container ${styles.mainContent}`}>
          <h2 className={styles.pageTitle}>My Rounds</h2>
          {myRounds && myRounds.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>
                <GolfBall size={48} />
              </div>
              <p className={styles.emptyStateText}>Start tracking your golf game today</p>
              <Link href='/configureRound' className={styles.startButton}>
                <Plus size={16} />
                Start a new round
              </Link>
            </div>
          ) : (
            <div className={styles.roundsList}>
              {myRounds.map((round) => {
                const relativeToPar = calculateRelativeToPar(round);
                const relativeToParFormatted = formatRelativeToPar(relativeToPar);

                // Determine the CSS class based on the relative to par value
                let relativeToParClass = styles.parValue; // Default (even par)
                if (relativeToPar < 0) {
                  relativeToParClass = styles.birdieValue; // Under par
                } else if (relativeToPar > 0) {
                  relativeToParClass = relativeToPar > 3 ? styles.doubleValue : styles.bogeyValue; // Over par
                }

                return (
                  <div key={round.roundID} className={styles.roundCard}>
                    <div className={styles.roundCardLink} onClick={() => viewRound(round.id)}>
                      <div className={styles.roundHeader}>
                        <h3 className={styles.roundName}>{round.roundName}</h3>
                        <span className={styles.roundDate}>{round.roundDate}</span>
                      </div>
                      <div className={styles.roundContent}>
                        <div className={styles.courseInfo}>
                          <MapPin size={16} className={styles.courseIcon} />
                          <span className={styles.courseName}>{round.courseName}</span>
                        </div>

                        {/* If you have score data, you can display stats here */}
                        {round.scores && round.scores.length > 0 && (
                          <div className={styles.roundStats}>
                            <div className={styles.statItem}>
                              <p className={styles.statLabel}>Total</p>
                              <p className={styles.statValue}>
                                {round.scores.reduce(
                                  (sum: number, score: any) => sum + (score.score || 0),
                                  0
                                )}
                              </p>
                            </div>
                            <div className={styles.statItem}>
                              <p className={styles.statLabel}>Holes</p>
                              <p className={styles.statValue}>{round.scores.length}</p>
                            </div>
                            <div className={styles.statItem}>
                              <p className={styles.statLabel}>To Par</p>
                              <p className={`${styles.statValue} ${relativeToParClass}`}>
                                {relativeToParFormatted}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default MyRounds;
