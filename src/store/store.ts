import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface CurrentRoundID {
  currentRoundID: number;
  updateRoundID: (selectedRoundID: number) => void;
}

interface SelectedCourseName {
  selectedCourseName: string;
  updateSelectedCourseName: (selectedCourse: string) => void;
}

export const useCurrentRoundStore = create<CurrentRoundID>()(
  persist(
    (set) => ({
      currentRoundID: 0,
      updateRoundID: (selectedRoundID) => {
        console.log("Updating round ID: ", selectedRoundID);
        set((state) => ({
          currentRoundID: (state.currentRoundID = selectedRoundID),
        }));
      },
    }),
    {
      name: "currentRoundStore",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

export const useSelectedCourseNameStore = create<SelectedCourseName>()(
  persist(
    (set) => ({
      selectedCourseName: "",
      updateSelectedCourseName: (selectedCourse) => {
        console.log("Updating selected courseName: ", selectedCourse);
        set((state) => ({
          selectedCourseName: (state.selectedCourseName = selectedCourse),
        }));
      },
    }),
    {
      name: "selectedCourseNameStore",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
