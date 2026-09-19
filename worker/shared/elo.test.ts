import { describe, it, expect } from 'vitest';
import { updateElo } from './elo';

describe('updateElo', () => {
    it('gains half of K on an even matchup win', () => {
        expect(updateElo(1200, 1200, true)).toBe(1216);
    });

    it('loses half of K on an even matchup loss', () => {
        expect(updateElo(1200, 1200, false)).toBe(1184);
    });

    it('rewards beating a harder problem more than an easier one', () => {
        const easyWin = updateElo(1200, 1000, true);
        const hardWin = updateElo(1200, 1600, true);
        expect(hardWin).toBeGreaterThan(easyWin);
    });

    it('honours a custom K factor', () => {
        expect(updateElo(1200, 1200, true, 16)).toBe(1208);
    });

    it('is pure and deterministic and does not mutate inputs', () => {
        const rating = 1500;
        const difficulty = 1450;
        const first = updateElo(rating, difficulty, true);
        const second = updateElo(rating, difficulty, true);
        expect(first).toBe(second);
        expect(rating).toBe(1500);
        expect(difficulty).toBe(1450);
    });
});
