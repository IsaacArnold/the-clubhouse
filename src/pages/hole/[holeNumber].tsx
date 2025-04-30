"use client";

import type React from "react";
import { database, initFirebase } from "firebaseConfig";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useCurrentRoundStore } from "@/store/store";
import type { UserScore } from "@/types/userScore";
import styles from "./HoleNumber.module.css";
import { ArrowLeft, ArrowRight, Check, Flag } from "lucide-react";
import { doc, updateDoc } from "@firebase/firestore";
import Head from "next/head";

const HolePage = () => {
  initFirebase();
  const router = useRouter();
  const { holeNumber } = router.query;

  const courseHoleDetails = useCurrentRoundStore((state) => state.courseHoleDetails);
  const userScores = useCurrentRoundStore((state) => state.userScores);
  const setUserScores = useCurrentRoundStore((state) => state.setUserScores);
  const roundDocumentID = useCurrentRoundStore((state) => state.roundDocumentID);

  const [holeDetails, setHoleDetails] = useState<any>(null);
  const [score, setScore] = useState<number | "">("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (holeNumber && courseHoleDetails.length > 0) {
      const details = courseHoleDetails.find(
        (hole) => hole.holeNumber === Number.parseInt(holeNumber as string, 10)
      );
      setHoleDetails(details);

      // Check if a score exists for this hole and set it, otherwise reset to blank
      const existingScore = userScores.find(
        (s) => s.holeNumber === Number.parseInt(holeNumber as string, 10)
      );
      setScore(existingScore?.score || "");
    }
  }, [holeNumber, courseHoleDetails, userScores]);

  if (!holeDetails) {
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
        <p className={styles.loadingText}>Loading hole details...</p>
      </div>
    );
  }

  const navigateToHole = (targetHole: number) => {
    router.push(`/hole/${targetHole}`);
  };

  const handleSubmitScore = async () => {
    if (score === "") {
      alert("Please enter your score");
      return;
    }

    // Create a new score object
    const newScore: UserScore = {
      holeNumber: Number.parseInt(holeNumber as string, 10),
      holePar: holeDetails.holePar,
      score: Number(score),
    };

    // Create a new array with the updated scores
    const updatedScores = [...userScores];
    const existingIndex = updatedScores.findIndex(
      (hole) => hole.holeNumber === newScore.holeNumber
    );

    if (existingIndex !== -1) {
      // Update existing score
      updatedScores[existingIndex] = newScore;
    } else {
      // Add new score
      updatedScores.push(newScore);
    }

    // Update the Zustand store
    setUserScores(updatedScores);

    const isLastHole = Number.parseInt(holeNumber as string, 10) === courseHoleDetails.length;

    // Only save to database if this is the last hole
    if (isLastHole) {
      if (roundDocumentID) {
        try {
          setIsSaving(true);
          const docRef = doc(database, "rounds", roundDocumentID);
          await updateDoc(docRef, {
            scores: updatedScores,
          });
          console.log("All scores saved to database successfully");
          setIsSaving(false);

          // Navigate to the scorecard page with the round ID
          router.push(`/scorecard?roundId=${roundDocumentID}`);
        } catch (error) {
          console.error("Error saving scores to database:", error);
          setIsSaving(false);
          alert("There was an error saving your scores. Please try again.");
        }
      } else {
        console.error("No roundDocumentID available, scores not saved to database");
        alert("Unable to save scores: Round ID not found");
      }
    } else {
      // If not the last hole, just navigate to the next hole
      const nextHole = Number.parseInt(holeNumber as string, 10) + 1;
      navigateToHole(nextHole);
    }
  };

  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      setScore("");
    } else {
      const numValue = Number.parseInt(value, 10);
      if (!isNaN(numValue) && numValue > 0) {
        setScore(numValue);
      }
    }
  };

  const isFirstHole = Number.parseInt(holeNumber as string, 10) === 1;
  const isLastHole = Number.parseInt(holeNumber as string, 10) === courseHoleDetails.length;

  return (
    <>
      <Head>
        <title>Hole {holeNumber}</title>
        <meta name='description' content='View your golf stats and start tracking your rounds' />
        <meta name='viewport' content='width=device-width, initial-scale=1, maximum-scale=1' />
        <link rel='icon' href='/golf-cart-icon_96.png' />
      </Head>
      <div className={styles.holeContainer}>
        <main className={`container ${styles.mainContent}`}>
          <div className={styles.holeCard}>
            <div className={styles.holeHeader}>
              <h2 className={styles.holeTitle}>
                <Flag size={20} />
                Hole {holeDetails.holeNumber}
              </h2>
              <span className={styles.holePar}>Par {holeDetails.holePar}</span>
            </div>
            <div className={styles.holeContent}>
              <div className={styles.holeDetailsGrid}>
                <div className={styles.detailCard}>
                  <p className={styles.detailLabel}>Distance</p>
                  <p className={styles.detailValue}>{holeDetails.holeDistance}m</p>
                </div>
                {/* <div className={styles.detailCard}>
                <p className={styles.detailLabel}>Par</p>
                <p className={styles.detailValue}>
                  {holeDetails.holePar}
                </p>
              </div> */}
                <div className={styles.detailCard}>
                  <p className={styles.detailLabel}>Stroke Index</p>
                  <p className={styles.detailValue}>{holeDetails.strokeIndex}</p>
                </div>
              </div>

              <div className={styles.scoreSection}>
                <label htmlFor='scoreInput' className={styles.scoreLabel}>
                  Enter your score for this hole:
                </label>
                <input
                  type='number'
                  id='scoreInput'
                  className={styles.scoreInput}
                  value={score}
                  onChange={handleScoreChange}
                  placeholder='Score'
                  min='1'
                />
              </div>

              <div className={styles.navigationButtons}>
                <button
                  className={`${styles.navButton} ${styles.prevButton}`}
                  onClick={() =>
                    navigateToHole(Math.max(1, Number.parseInt(holeNumber as string, 10) - 1))
                  }
                  disabled={isFirstHole}
                  style={{ opacity: isFirstHole ? 0.5 : 1 }}
                >
                  <ArrowLeft size={16} />
                  Previous
                </button>
                <button
                  className={`${styles.navButton} ${styles.submitButton}`}
                  onClick={handleSubmitScore}
                >
                  <Check size={16} />
                  {isLastHole ? "Finish" : "Save & next"}
                </button>
                <button
                  className={`${styles.navButton} ${styles.nextButton}`}
                  onClick={() => navigateToHole(Number.parseInt(holeNumber as string, 10) + 1)}
                  disabled={isLastHole}
                  style={{ opacity: isLastHole ? 0.5 : 1 }}
                >
                  Next
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default HolePage;
