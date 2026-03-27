export type HoleScoreCalculation = {
  shots: number;
  net: number;
  points: number;
};

export function shotsReceived(handicap: number, strokeIndex: number): number {
  if (handicap <= 0) return 0;
  
  if (handicap <= 18) {
    return strokeIndex <= handicap ? 1 : 0;
  } else {
    const extraShots = handicap - 18;
    if (strokeIndex <= extraShots) {
      return 2;
    } else {
      return 1;
    }
  }
}

export function netScore(gross: number, shotsReceived: number): number {
  return gross - shotsReceived;
}

export function stablefordPoints(par: number, net: number): number {
  if (net === 0) return 0;
  
  const diff = net - par;
  
  if (diff <= -4) return 0;
  if (diff === -3) return 1;
  if (diff === -2) return 2;
  if (diff === -1) return 3;
  if (diff === 0) return 4;
  if (diff === 1) return 5;
  if (diff >= 2) return 6;
  
  return 0;
}

export function calculateHoleScore({
  par,
  gross,
  strokeIndex,
  handicap,
}: {
  par: number;
  gross: number;
  strokeIndex: number;
  handicap: number;
}): HoleScoreCalculation {
  const shots = shotsReceived(handicap, strokeIndex);
  const net = gross > 0 ? netScore(gross, shots) : 0;
  const points = gross > 0 ? stablefordPoints(par, net) : 0;

  return { shots, net, points };
}

export function calculateTotals(
  holes: Array<{
    par: number;
    gross: number;
    strokeIndex: number;
  }>,
  handicap: number
) {
  let grossTotal = 0;
  let netTotal = 0;
  let pointsTotal = 0;

  holes.forEach((hole) => {
    const calc = calculateHoleScore({
      par: hole.par,
      gross: hole.gross,
      strokeIndex: hole.strokeIndex,
      handicap,
    });

    grossTotal += hole.gross;
    netTotal += calc.net;
    pointsTotal += calc.points;
  });

  return {
    grossTotal,
    netTotal,
    pointsTotal,
  };
}

export function calculateSplit(
  holes: Array<{
    par: number;
    gross: number;
    strokeIndex: number;
  }>,
  handicap: number,
  splitAt: number = 9
) {
  const outHoles = holes.slice(0, splitAt);
  const inHoles = holes.slice(splitAt);

  const out = calculateTotals(outHoles, handicap);
  const inTotals = calculateTotals(inHoles, handicap);
  const total = calculateTotals(holes, handicap);

  return {
    out,
    in: inTotals,
    total,
  };
}
