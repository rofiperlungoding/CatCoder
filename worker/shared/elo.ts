export function updateElo(rating: number, difficulty: number, won: boolean, k = 32): number {
    const expected = 1 / (1 + Math.pow(10, (difficulty - rating) / 400));
    const score = won ? 1 : 0;
    return Math.round(rating + k * (score - expected));
}
