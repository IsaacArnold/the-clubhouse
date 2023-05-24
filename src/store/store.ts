import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface CurrentRoundID {
  currentRoundID: number;
  updateRoundID: (selectedRoundID: number) => void;
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
