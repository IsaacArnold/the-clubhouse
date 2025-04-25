// We start on hole 1.
// When we are on hole 1, we want to figure out what the next hole will be and store this somewhere
// When we click submit on hole 1, we want to fetch the next holeNumber and use this holeNumber for the next page load (pulling in hole 2).
export const nextHoleNumber = (currentHole: number): number => {
  // First check if currentHole is between 1 - 18
  const isCurrentHoleValid: boolean = currentHole >= 1 || currentHole <= 18;

  const nextHoleNumber = isCurrentHoleValid ? currentHole + 1 : NaN;

  const isNextHoleValid: boolean = nextHoleNumber >= 1 || nextHoleNumber <= 18;

  return isNextHoleValid ? nextHoleNumber : NaN;
}