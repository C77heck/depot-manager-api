function combinationSum2(candidates: number[], target: number): number[][] {
    const combinations: number[][] = [];

    const candidatesThatAreLess: number[] = candidates.filter(i => i <= target).sort((a, b) => a - b);
    let index = 1;

    if (candidatesThatAreLess.reduce((a, b) => a + b, 0) === target) {
        combinations.push(candidatesThatAreLess);
    } else {
        for (const candidate of candidatesThatAreLess) {
            if (candidate === target) {
                combinations.push([candidate]);
                continue;
            }

            if (target / candidate > 1) {
                const results = combinationSum2(candidatesThatAreLess.slice(index), target - candidate);
                combinations.push(...results.map(arr => [...arr, candidate]));
            }
            index++;
        }
    }

    return Array.from(new Set(combinations.map((i) => JSON.stringify(i)))).map(i => JSON.parse(i));
};
