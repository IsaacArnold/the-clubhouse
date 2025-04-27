"use client";

import { useCurrentRoundStore } from "@/store/store";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { database } from "firebaseConfig";
import { useEffect, useState } from "react";
import type { UserScore } from "@/types/userScore";
import { ArrowLeft, Flag, Share2, Trophy } from "lucide-react";
import Link from "next/link";

const Scorecard = () => {
  const [currentRoundName, setCurrentRoundName] = useState<string>("");
  const [courseName, setCourseName] = useState<string>("");
  const [coursePar, setCoursePar] = useState<number>(0);
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const [userScores, setUserScores] = useState<UserScore[]>([]);
  const [date, setDate] = useState<string>(new Date().toLocaleDateString());

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

  // Helper function to determine score color
  const getScoreColor = (score: number, par: number) => {
    if (score < par) return "text-clubhouse-green";
    if (score === par) return "text-clubhouse-text";
    if (score === par + 1) return "text-orange-600";
    return "text-red-600";
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
    <div className='min-h-screen bg-clubhouse-white'>
      <header className='bg-clubhouse-green text-white p-3 sticky top-0 z-10'>
        <div className='container mx-auto'>
          <div className='flex items-center justify-between'>
            <Link href='/dashboard' className='flex items-center gap-1'>
              <ArrowLeft size={18} />
              <span className='font-medium text-sm'>Back</span>
            </Link>
            <h1 className='text-lg font-bold'>Clubhouse</h1>
            <button className='text-white p-1 h-8 w-8 flex items-center justify-center'>
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className='container mx-auto px-3 py-4 max-w-2xl'>
        <div className='mb-4'>
          <h2 className='text-2xl sm:text-3xl font-bold text-clubhouse-text'>
            Review Your Scorecard
          </h2>
        </div>

        <div className='mb-4 border border-clubhouse-gray rounded-lg shadow-md bg-white overflow-hidden'>
          <div className='bg-clubhouse-green text-white p-3 sm:p-4'>
            <div className='flex justify-between items-center'>
              <h3 className='text-lg font-semibold'>Round Details</h3>
              <span className='bg-white text-clubhouse-green text-xs sm:text-sm px-2 py-1 rounded-full'>
                {stats.relativeToPar > 0 ? `+${stats.relativeToPar}` : stats.relativeToPar}
              </span>
            </div>
          </div>
          <div className='p-3 sm:p-4'>
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <p className='text-xs text-clubhouse-lightened-gray'>Course</p>
                <p className='font-medium text-clubhouse-text text-sm'>{courseName}</p>
              </div>
              <div>
                <p className='text-xs text-clubhouse-lightened-gray'>Round Name</p>
                <p className='font-medium text-clubhouse-text text-sm'>{currentRoundName}</p>
              </div>
              <div>
                <p className='text-xs text-clubhouse-lightened-gray'>Course Par</p>
                <p className='font-medium text-clubhouse-text text-sm'>{coursePar}</p>
              </div>
              <div>
                <p className='text-xs text-clubhouse-lightened-gray'>Course Distance</p>
                <p className='font-medium text-clubhouse-text text-sm'>{totalDistance}m</p>
              </div>
            </div>
          </div>
        </div>

        <div className='mb-4 border border-clubhouse-gray rounded-lg shadow-md bg-white overflow-hidden'>
          <div className='bg-clubhouse-green text-white p-3 sm:p-4'>
            <div className='flex justify-between items-center'>
              <h3 className='text-lg font-semibold'>Round Summary</h3>
              <div className='flex items-center gap-1'>
                <Trophy size={16} />
                <span className='font-bold'>{stats.totalScore}</span>
              </div>
            </div>
          </div>
          <div className='p-3 sm:p-4'>
            <div className='grid grid-cols-2 gap-2 sm:gap-3'>
              <div className='text-center p-2 bg-clubhouse-lightened-green rounded-lg'>
                <p className='text-clubhouse-green font-bold text-lg'>{stats.birdies}</p>
                <p className='text-xs sm:text-sm text-clubhouse-text'>Birdies</p>
              </div>
              <div className='text-center p-2 bg-clubhouse-gray rounded-lg'>
                <p className='text-clubhouse-text font-bold text-lg'>{stats.pars}</p>
                <p className='text-xs sm:text-sm text-clubhouse-text'>Pars</p>
              </div>
              <div className='text-center p-2 bg-orange-100 rounded-lg'>
                <p className='text-orange-700 font-bold text-lg'>{stats.bogeys}</p>
                <p className='text-xs sm:text-sm text-clubhouse-text'>Bogeys</p>
              </div>
              <div className='text-center p-2 bg-red-100 rounded-lg'>
                <p className='text-red-700 font-bold text-lg'>{stats.doubleBogeys}</p>
                <p className='text-xs sm:text-sm text-clubhouse-text'>Double+</p>
              </div>
            </div>
          </div>
        </div>

        <h3 className='text-xl sm:text-2xl font-bold text-clubhouse-text mb-3'>Hole by Hole</h3>

        <div className='space-y-2 sm:space-y-3'>
          {courseHoleDetails.map((hole) => {
            const userScore = userScores.find((score) => score.holeNumber === hole.holeNumber);

            return (
              <div
                key={hole.holeNumber}
                className='border border-clubhouse-gray rounded-lg shadow-sm bg-white overflow-hidden'
              >
                <div className='flex'>
                  <div className='flex items-center justify-center bg-clubhouse-green text-white p-3 w-12 sm:w-16'>
                    <div className='text-center'>
                      <Flag size={14} className='mx-auto mb-1' />
                      <span className='text-lg font-bold'>{hole.holeNumber}</span>
                    </div>
                  </div>
                  <div className='flex-1 p-3'>
                    <div className='grid grid-cols-3 gap-2 sm:gap-4'>
                      <div>
                        <p className='text-xs text-clubhouse-lightened-gray'>Par</p>
                        <p className='font-medium text-clubhouse-text text-sm'>{hole.holePar}</p>
                      </div>
                      <div>
                        <p className='text-xs text-clubhouse-lightened-gray'>Distance</p>
                        <p className='font-medium text-clubhouse-text text-sm'>
                          {hole.holeDistance}m
                        </p>
                      </div>
                      <div>
                        <p className='text-xs text-clubhouse-lightened-gray'>SI</p>
                        <p className='font-medium text-clubhouse-text text-sm'>
                          {hole.strokeIndex}
                        </p>
                      </div>
                    </div>
                    <div className='h-px bg-clubhouse-gray my-2'></div>
                    <div className='flex justify-between items-center'>
                      <div>
                        <p className='text-xs text-clubhouse-lightened-gray'>Your Score</p>
                        <div className='flex items-center gap-2'>
                          {userScore && userScore.score ? (
                            <>
                              <span
                                className={`text-lg font-bold ${getScoreColor(
                                  userScore.score,
                                  hole.holePar
                                )}`}
                              >
                                {userScore.score}
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${
                                  userScore.score < hole.holePar
                                    ? "bg-clubhouse-lightened-green text-clubhouse-green"
                                    : userScore.score === hole.holePar
                                    ? "bg-clubhouse-gray text-clubhouse-text"
                                    : userScore.score === hole.holePar + 1
                                    ? "bg-orange-100 text-orange-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {getScoreLabel(userScore.score, hole.holePar)}
                              </span>
                            </>
                          ) : (
                            <input
                              type='number'
                              className='w-16 p-1 border border-clubhouse-gray rounded text-center'
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
                        className='text-clubhouse-green border border-clubhouse-green hover:bg-clubhouse-lightened-green h-8 text-xs px-3 py-1 rounded'
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
              </div>
            );
          })}
        </div>

        <div className='mt-6 flex flex-col sm:flex-row justify-center gap-3 px-4'>
          <button
            className='bg-clubhouse-green hover:bg-opacity-90 text-white w-full py-2 rounded-md font-medium'
            onClick={handleSubmitFinalScores}
          >
            Submit Final Scores
          </button>
          <button className='border border-clubhouse-green text-clubhouse-green hover:bg-clubhouse-lightened-green w-full py-2 rounded-md font-medium'>
            Share Round
          </button>
        </div>
      </main>
    </div>
  );
};

export default Scorecard;
