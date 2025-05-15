import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface HoleDetails {
  holeNumber: number;
  holePar: number;
  holeDistance: number;
  strokeIndex: number;
}

interface UserScore {
  holeNumber: number;
  holePar: number;
  score: number;
}

interface CurrentRoundState {
  currentRoundID: number;
  roundDocumentID: string;
  courseHoleDetails: HoleDetails[];
  userScores: UserScore[];
  updateRoundID: (selectedRoundID: number) => void;
  updateRoundDocID: (documentID: string) => void;
  setCourseHoleDetails: (details: HoleDetails[]) => void;
  setUserScores: (scores: UserScore[]) => void;
}

export const useCurrentRoundStore = create<CurrentRoundState>()(
  persist(
    (set) => ({
      currentRoundID: 0,
      roundDocumentID: "",
      courseHoleDetails: [],
      userScores: [],
      updateRoundID: (selectedRoundID) => {
        set({ currentRoundID: selectedRoundID });
      },
      updateRoundDocID: (documentID) => {
        set({ roundDocumentID: documentID });
      },
      setCourseHoleDetails: (details) => {
        set({ courseHoleDetails: details });
      },
      setUserScores: (scores) => {
        set({ userScores: scores });
      },
    }),
    {
      name: "currentRoundStore", // Key for localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);

interface SelectedCourseName {
  selectedCourseName: string;
  updateSelectedCourseName: (selectedCourse: string) => void;
}

export const useSelectedCourseNameStore = create<SelectedCourseName>()(
  persist(
    (set) => ({
      selectedCourseName: "",
      updateSelectedCourseName: (selectedCourse) => {
        console.log("Updating selected courseName: ", selectedCourse);
        set({ selectedCourseName: selectedCourse });
      },
    }),
    {
      name: "selectedCourseNameStore",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

interface SelectedCourseID {
  selectedCourseID: string;
  updateSelectedCourseID: (selectedID: string) => void;
}

export const useSelectedCourseIDStore = create<SelectedCourseID>()(
  persist(
    (set) => ({
      selectedCourseID: "",
      updateSelectedCourseID: (selectedCourseID) => {
        console.log("Updating selected courseID: ", selectedCourseID);
        set({ selectedCourseID: selectedCourseID });
      },
    }),
    {
      name: "selectedCourseIDStore",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
