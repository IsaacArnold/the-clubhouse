"use client";

import { getAuth } from "firebase/auth";
import { type DocumentData, collection, getDocs, query, where } from "firebase/firestore";
import { database, initFirebase } from "firebaseConfig";
import { type SetStateAction, useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import styles from "./MyRounds.module.css";
import Link from "next/link";
import { ArrowLeft, GlobeIcon as GolfBall, MapPin, Plus } from "lucide-react";
import { useRouter } from "next/router";

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
    console.log("roundId", roundId);
    // Navigate to the scorecard page with the round ID
    router.push(`/scorecard?roundId=${roundId}`);
  };

  return (
    <div className={styles.myRoundsContainer}>
      <header className={styles.header}>
        <div className='container'>
          <div className={styles.headerContent}>
            <Link href='/dashboard' className={styles.backLink}>
              <ArrowLeft size={18} />
              <span>Dashboard</span>
            </Link>
            <h1 className={styles.headerTitle}>Clubhouse</h1>
            <div style={{ width: "24px" }}></div> {/* Spacer for alignment */}
          </div>
        </div>
      </header>

      <main className={`container ${styles.mainContent}`}>
        <h2 className={styles.pageTitle}>My Rounds</h2>
        {myRounds && myRounds.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>
              <GolfBall size={48} />
            </div>
            <p className={styles.emptyStateText}>You haven't played any rounds yet.</p>
            <Link href='/configureRound' className={styles.startButton}>
              <Plus size={16} />
              Start a new round
            </Link>
          </div>
        ) : (
          <>
            <p className={styles.pageSubtitle}>Check out your rounds below</p>
            <div className={styles.roundsList}>
              {myRounds.map((round) => (
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
                            <p className={styles.statLabel}>Best</p>
                            <p className={styles.statValue}>
                              {Math.min(...round.scores.map((s: any) => s.score || 999))}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default MyRounds;
