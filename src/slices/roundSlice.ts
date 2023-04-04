import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GolfRound } from "@/types/golfRoundTypes";

const initialState: GolfRound = {
  courseID: "",
  roundDate: "",
  roundName: "",
  userID: "",
};

export const roundSlice = createSlice({
  name: "round",
  initialState,
  reducers: {
    updateRound: (state, action: PayloadAction<GolfRound>) => {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
});

export const { updateRound } = roundSlice.actions;
export default roundSlice.reducer;
