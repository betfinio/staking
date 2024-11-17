export const getConservativeCycle = () => {
	const cycleId = Math.floor((Date.now() - 1000 * 60 * 60 * 36) / 1000 / 60 / 60 / 24 / 7);
	const cycleStart = cycleId * 1000 * 60 * 60 * 24 * 7 + 1000 * 60 * 60 * 36;
	const cycleEnd = (cycleId + 1) * 1000 * 60 * 60 * 24 * 7 + 1000 * 60 * 60 * 36;

	return { cycleId, cycleStart, cycleEnd };
};
