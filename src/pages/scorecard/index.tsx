"use client";

import { useCurrentRoundStore } from "@/store/store";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { database } from "firebaseConfig";
import { useEffect, useState } from "react";
import type { UserScore } from "@/types/userScore";
import { ArrowLeft, Flag, Share2, Trophy } from "lucide-react";
import Link from "next/link";
import styles from "./Scorecard.module.css";

const Scorecard = () => {
  const [currentRoundName, setCurrentRoundName] = useState<string>("");
  const [courseName, setCourseName] = useState<string>("");
  const [coursePar, setCoursePar] = useState<number>(0);
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const [userScores, setUserScores] = useState<UserScore[]>([]);
  const [date, setDate] = useState<string>(new Date().toLocaleDateString());
  const [weather, setWeather] = useState<string>("Sunny, 24°C");

  const roundDocumentID = useCurrentRoundStore((state) => state.roundDocumentID);
  const courseHoleDetails = useCurrentRoundStore((state) => state.courseHoleDetails);

  useEffect(() => {
    const fetchRoundDetails = async () => {
      if (!roundDocumentID) return;

      try {
        // Fetch the round document from Firestore
        const docRef = doc(database, "rounds", roundDocumentID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const roundData = docSnap.data();
          setCurrentRoundName(roundData.roundName);
          setCourseName(roundData.courseName);

          // Calculate coursePar and totalDistance from courseHoleDetails
          const par = courseHoleDetails.reduce((sum, hole) => sum + hole.holePar, 0);
          const distance = courseHoleDetails.reduce((sum, hole) => sum + hole.holeDistance, 0);

          setCoursePar(par);
          setTotalDistance(distance);

          // Populate userScores from Zustand store
          setUserScores(useCurrentRoundStore.getState().userScores);

          // Set date if available in roundData
          if (roundData.date) {
            setDate(roundData.date);
          }

          // Set weather if available in roundData
          if (roundData.weather) {
            setWeather(roundData.weather);
          }
        } else {
          console.error("No such round document!");
        }
      } catch (error) {
        console.error("Error fetching round details:", error);
      }
    };

    fetchRoundDetails();
  }, [roundDocumentID, courseHoleDetails]);

  const handleScoreChange = (holeNumber: number, score: number) => {
    // Update the score for the specific hole
    setUserScores((prevScores) =>
      prevScores.map((hole) => (hole.holeNumber === holeNumber ? { ...hole, score } : hole))
    );
  };

  const handleSubmitFinalScores = async () => {
    try {
      const docRef = doc(database, "rounds", roundDocumentID);
      await updateDoc(docRef, {
        scores: userScores,
      });
      alert("Final scores submitted successfully!");
    } catch (error) {
      console.error("Error submitting final scores: ", error);
    }
  };

  // Calculate statistics for the round summary
  const calculateStats = () => {
    // Filter out scores that are not yet entered (undefined, null, or 0)
    const validScores = userScores.filter((score) => score.score && score.score > 0);

    if (validScores.length === 0) {
      return {
        totalScore: 0,
        relativeToPar: 0,
        birdies: 0,
        pars: 0,
        bogeys: 0,
        doubleBogeys: 0,
      };
    }

    const totalScore = validScores.reduce((sum, score) => sum + score.score, 0);

    // Calculate par for only the holes that have valid scores
    const validHoleNumbers = validScores.map((score) => score.holeNumber);
    const parForValidHoles = courseHoleDetails
      .filter((hole) => validHoleNumbers.includes(hole.holeNumber))
      .reduce((sum, hole) => sum + hole.holePar, 0);

    const relativeToPar = totalScore - parForValidHoles;

    // Count birdies, pars, bogeys, and double bogeys
    const birdies = validScores.filter((score) => {
      const hole = courseHoleDetails.find((h) => h.holeNumber === score.holeNumber);
      return hole && score.score < hole.holePar;
    }).length;

    const pars = validScores.filter((score) => {
      const hole = courseHoleDetails.find((h) => h.holeNumber === score.holeNumber);
      return hole && score.score === hole.holePar;
    }).length;

    const bogeys = validScores.filter((score) => {
      const hole = courseHoleDetails.find((h) => h.holeNumber === score.holeNumber);
      return hole && score.score === hole.holePar + 1;
    }).length;

    const doubleBogeys = validScores.filter((score) => {
      const hole = courseHoleDetails.find((h) => h.holeNumber === score.holeNumber);
      return hole && score.score > hole.holePar + 1;
    }).length;

    return {
      totalScore,
      relativeToPar,
      birdies,
      pars,
      bogeys,
      doubleBogeys,
    };
  };

  // Helper function to get score style class
  const getScoreClass = (score: number, par: number) => {
    if (score < par) return styles.birdie;
    if (score === par) return styles.par;
    if (score === par + 1) return styles.bogey;
    return styles.double;
  };

  // Helper function to get score badge class
  const getScoreBadgeClass = (score: number, par: number) => {
    if (score < par) return `${styles.scoreBadge} ${styles.birdieBadge}`;
    if (score === par) return `${styles.scoreBadge} ${styles.parBadge}`;
    if (score === par + 1) return `${styles.scoreBadge} ${styles.bogeyBadge}`;
    return `${styles.scoreBadge} ${styles.doubleBadge}`;
  };

  // Helper function to get score label
  const getScoreLabel = (score: number, par: number) => {
    const diff = score - par;
    if (diff === -2) return "Eagle";
    if (diff === -1) return "Birdie";
    if (diff === 0) return "Par";
    if (diff === 1) return "Bogey";
    if (diff === 2) return "Double Bogey";
    if (diff > 2) return `+${diff}`;
    return "";
  };

  // Get the statistics
  const stats = calculateStats();

  return (
    <div className={styles.scorecardContainer}>
      <header className={styles.header}>
        <div className='container flex items-center justify-between'>
          <Link href='/dashboard' className={styles.headerLink}>
            <ArrowLeft size={18} />
            <span className='font-medium text-sm'>Back</span>
          </Link>
          <h1 className={styles.headerTitle}>Clubhouse</h1>
          <button className={styles.shareButton}>
            <Share2 size={18} />
          </button>
        </div>
      </header>

      <main className={`container ${styles.mainContent}`}>
        <div>
          <h2 className={styles.pageTitle}>Review Your Scorecard</h2>
          <p className={styles.pageSubtitle}>
            {date} • {weather}
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className='flex items-center justify-between'>
              <h3 className={styles.cardTitle}>Round Details</h3>
              <span className={styles.parBadge}>
                {stats.relativeToPar > 0 ? `+${stats.relativeToPar}` : stats.relativeToPar}
              </span>
            </div>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.detailsGrid}>
              <div>
                <p className={styles.detailLabel}>Course</p>
                <p className={styles.detailValue}>{courseName}</p>
              </div>
              <div>
                <p className={styles.detailLabel}>Round Name</p>
                <p className={styles.detailValue}>{currentRoundName}</p>
              </div>
              <div>
                <p className={styles.detailLabel}>Course Par</p>
                <p className={styles.detailValue}>{coursePar}</p>
              </div>
              <div>
                <p className={styles.detailLabel}>Course Distance</p>
                <p className={styles.detailValue}>{totalDistance}m</p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className='flex items-center justify-between'>
              <h3 className={styles.cardTitle}>Round Summary</h3>
              <div className='flex items-center gap-1'>
                <Trophy size={16} />
                <span className='font-bold'>{stats.totalScore}</span>
              </div>
            </div>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.statsGrid}>
              <div className={`${styles.statCard} ${styles.birdieCard}`}>
                <p className={`${styles.statValue} ${styles.birdieValue}`}>{stats.birdies}</p>
                <p className={styles.statLabel}>Birdies</p>
              </div>
              <div className={`${styles.statCard} ${styles.parCard}`}>
                <p className={`${styles.statValue} ${styles.parValue}`}>{stats.pars}</p>
                <p className={styles.statLabel}>Pars</p>
              </div>
              <div className={`${styles.statCard} ${styles.bogeyCard}`}>
                <p className={`${styles.statValue} ${styles.bogeyValue}`}>{stats.bogeys}</p>
                <p className={styles.statLabel}>Bogeys</p>
              </div>
              <div className={`${styles.statCard} ${styles.doubleCard}`}>
                <p className={`${styles.statValue} ${styles.doubleValue}`}>{stats.doubleBogeys}</p>
                <p className={styles.statLabel}>Double+</p>
              </div>
            </div>
          </div>
        </div>

        <h3 className={styles.sectionTitle}>Hole by Hole</h3>

        <div className={styles.holesList}>
          {courseHoleDetails.map((hole) => {
            const userScore = userScores.find((score) => score.holeNumber === hole.holeNumber);

            return (
              <div key={hole.holeNumber} className={styles.holeCard}>
                <div className={styles.holeNumber}>
                  <div className='text-center'>
                    <Flag size={14} className={styles.holeFlag} />
                    <span className={styles.holeNumberText}>{hole.holeNumber}</span>
                  </div>
                </div>
                <div className={styles.holeContent}>
                  <div className={styles.holeDetailsGrid}>
                    <div>
                      <p className={styles.detailLabel}>Par</p>
                      <p className={styles.detailValue}>{hole.holePar}</p>
                    </div>
                    <div>
                      <p className={styles.detailLabel}>Distance</p>
                      <p className={styles.detailValue}>{hole.holeDistance}m</p>
                    </div>
                    <div>
                      <p className={styles.detailLabel}>SI</p>
                      <p className={styles.detailValue}>{hole.strokeIndex}</p>
                    </div>
                  </div>
                  <div className={styles.holeSeparator}></div>
                  <div className={styles.scoreRow}>
                    <div>
                      <p className={styles.scoreLabel}>Your Score</p>
                      <div className={styles.scoreDisplay}>
                        {userScore && userScore.score ? (
                          <>
                            <span
                              className={`${styles.scoreValue} ${getScoreClass(
                                userScore.score,
                                hole.holePar
                              )}`}
                            >
                              {userScore.score}
                            </span>
                            <span className={getScoreBadgeClass(userScore.score, hole.holePar)}>
                              {getScoreLabel(userScore.score, hole.holePar)}
                            </span>
                          </>
                        ) : (
                          <input
                            type='number'
                            className={styles.scoreInput}
                            value={userScore?.score || ""}
                            onChange={(e) =>
                              handleScoreChange(
                                hole.holeNumber,
                                Number.parseInt(e.target.value, 10)
                              )
                            }
                            placeholder='Score'
                          />
                        )}
                      </div>
                    </div>
                    <button
                      className={styles.editButton}
                      onClick={() => {
                        // If there's already a score, allow editing by clearing it
                        if (userScore && userScore.score) {
                          handleScoreChange(hole.holeNumber, 0);
                        }
                      }}
                    >
                      {userScore && userScore.score ? "Edit" : "Save"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.actionButtons}>
          <button className={styles.primaryButton} onClick={handleSubmitFinalScores}>
            Submit Final Scores
          </button>
          <button className={styles.secondaryButton}>Share Round</button>
        </div>
      </main>
    </div>
  );
};

export default Scorecard;
