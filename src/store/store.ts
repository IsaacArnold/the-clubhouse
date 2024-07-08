import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface CurrentRoundInfo {
  currentRoundID: number;
  roundDocumentID: string;
  updateRoundID: (selectedRoundID: number) => void;
  updateRoundDocID: (documentID: string) => void;
}

interface SelectedCourseName {
  selectedCourseName: string;
  updateSelectedCourseName: (selectedCourse: string) => void;
}

interface SelectedCourseID {
  selectedCourseID: string;
  updateSelectedCourseID: (selectedID: string) => void;
}

export const useCurrentRoundStore = create<CurrentRoundInfo>()(
  persist(
    (set) => ({
      currentRoundID: 0,
      roundDocumentID: "",
      updateRoundID: (selectedRoundID) => {
        console.log("Updating round ID: ", selectedRoundID);
        set((state) => ({
          currentRoundID: (state.currentRoundID = selectedRoundID),
        }));
      },
      updateRoundDocID: (documentID) => {
        console.log("Setting the store's documentID for this round");
        set((state) => ({
          roundDocumentID: (state.roundDocumentID = documentID)
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

export const useSelectedCourseIDStore = create<SelectedCourseID>()(
  persist(
    (set) => ({
      selectedCourseID: "",
      updateSelectedCourseID: (selectedCourseID) => {
        console.log("Updating selected courseID: ", selectedCourseID);
        set((state) => ({
          selectedCourseID: (state.selectedCourseID = selectedCourseID),
        }));
      },
    }),
    {
      name: "selectedCourseIDStore",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
