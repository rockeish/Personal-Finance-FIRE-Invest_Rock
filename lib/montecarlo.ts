export type MonteCarloParams = {
	initial: number;
	annualContribution: number;
	years: number;
	meanReturn: number; // e.g., 0.07
	volatility: number; // e.g., 0.15
	inflation: number; // e.g., 0.02
	annualWithdrawal: number; // real dollars at retirement
	simulations: number; // e.g., 10000
};

export function runMonteCarlo({ initial, annualContribution, years, meanReturn, volatility, inflation, annualWithdrawal, simulations }: MonteCarloParams) {
	let successes = 0;
	for (let s = 0; s < simulations; s += 1) {
		let balance = initial;
		for (let y = 0; y < years; y += 1) {
			const r = randomNormal(meanReturn, volatility);
			balance = balance * (1 + r) + annualContribution;
		}
		// decumulation 30-year horizon
		let ok = true;
		let spend = annualWithdrawal;
		for (let y = 0; y < 30; y += 1) {
			const r = randomNormal(meanReturn, volatility);
			balance = balance * (1 + r) - spend;
			spend = spend * (1 + inflation);
			if (balance <= 0) { ok = false; break; }
		}
		if (ok) successes += 1;
	}
	return { successProbability: successes / simulations };
}

function randomNormal(mean: number, std: number) {
	// Box-Muller transform
	let u = 0, v = 0;
	while (u === 0) u = Math.random();
	while (v === 0) v = Math.random();
	const n = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
	return mean + n * std;
}