import { NextRequest } from "next/server";

export const revalidate = 300;

async function fetchYahooQuote(symbols: string[]): Promise<Record<string, number>> {
	const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols.join(","))}`;
	const res = await fetch(url, { next: { revalidate: 300 } });
	if (!res.ok) return {};
	const data = await res.json();
	const quoteMap: Record<string, number> = {};
	for (const q of data.quoteResponse?.result ?? []) {
		if (q?.symbol && typeof q?.regularMarketPrice === "number") {
			quoteMap[q.symbol] = q.regularMarketPrice;
		}
	}
	return quoteMap;
}

export async function GET(req: NextRequest) {
	const s = req.nextUrl.searchParams.get("s") || "";
	const symbols = s.split(",").map((x) => x.trim()).filter(Boolean);
	if (symbols.length === 0) {
		return new Response(JSON.stringify({}), { headers: { "content-type": "application/json" } });
	}
	const quotes = await fetchYahooQuote(symbols);
	return new Response(JSON.stringify(quotes), { headers: { "content-type": "application/json" } });
}