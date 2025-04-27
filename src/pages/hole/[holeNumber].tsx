import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useCurrentRoundStore } from "@/store/store";
import { UserScore } from "@/types/userScore";

const HolePage = () => {
  const router = useRouter();
  const { holeNumber } = router.query;

  const courseHoleDetails = useCurrentRoundStore((state) => state.courseHoleDetails);
  const userScores = useCurrentRoundStore((state) => state.userScores);
  const setUserScores = useCurrentRoundStore((state) => state.setUserScores);
  
  const [holeDetails, setHoleDetails] = useState<any>(null);
  const [score, setScore] = useState<number | "">("");
  
  useEffect(() => {
    if (holeNumber && courseHoleDetails.length > 0) {
      const details = courseHoleDetails.find(
        (hole) => hole.holeNumber === parseInt(holeNumber as string, 10)
      );
      setHoleDetails(details);
      
      // Check if a score exists for this hole and set it, otherwise reset to blank
      const existingScore = userScores.find(
        (s) => s.holeNumber === parseInt(holeNumber as string, 10)
      );
      setScore(existingScore?.score || "");
    }
    console.log('userScores', userScores);
  }, [holeNumber, courseHoleDetails, userScores]);

  if (!holeDetails) return <p>Loading...</p>;

  const navigateToHole = (targetHole: number) => {
    router.push(`/hole/${targetHole}`);
  };

  const handleSubmitScore = () => {
    // Save the score locally in Zustand
    const updatedScores: UserScore[] = [...userScores];
    const existingIndex: number = updatedScores.findIndex(
      (hole: UserScore) => hole.holeNumber === parseInt(holeNumber as string, 10)
    );

    if (existingIndex !== -1) {
      updatedScores[existingIndex] = { ...updatedScores[existingIndex], score: Number(score) };
    } else {
      updatedScores.push({
        holeNumber: parseInt(holeNumber as string, 10),
        holePar: holeDetails.holePar,
        score: Number(score),
      });
    }

    setUserScores(updatedScores);

    // Reset the score input field
    setScore("");

    // Navigate to the next hole
    const nextHole = parseInt(holeNumber as string, 10) + 1;
    if (nextHole <= courseHoleDetails.length) {
      navigateToHole(nextHole);
    } else {
      alert("You have completed the round!");
      router.push("/scorecard"); // Redirect to the scorecard page after the last hole
    }
  };

  return (
    <div>
      <h1>Hole {holeDetails.holeNumber}</h1>
      <p>Par: {holeDetails.holePar}</p>
      <p>Distance: {holeDetails.holeDistance}m</p>
      <p>Stroke Index: {holeDetails.strokeIndex}</p>
      <div>
        <label htmlFor="scoreInput">Your Score:</label>
        <input
          type="number"
          id="scoreInput"
          value={score}
          onChange={(e) => setScore(parseInt(e.target.value, 10))}
          placeholder="Enter your score"
        />
      </div>
      <button
        onClick={() =>
          navigateToHole(Math.max(1, parseInt(holeNumber as string, 10) - 1))
        }
      >
        Previous Hole
      </button>
      <button onClick={handleSubmitScore}>Submit Score</button>
      <button
        onClick={() =>
          navigateToHole(parseInt(holeNumber as string, 10) + 1)
        }
      >
        Next Hole
      </button>
    </div>
  );
};

export default HolePage;
