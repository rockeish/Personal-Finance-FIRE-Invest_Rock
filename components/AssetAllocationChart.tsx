"use client";

import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell } from "recharts";

const COLORS = ["#0ea5e9", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6"];

export default function AssetAllocationChart({ data }: { data: Array<{ name: string; value: number }> }) {
	const nonZero = data.filter((d) => d.value > 0);
	return (
		<div className="h-64 w-full">
			<ResponsiveContainer>
				<PieChart>
					<Pie dataKey="value" data={nonZero} outerRadius={90} label>
						{nonZero.map((entry, index) => (
							<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
						))}
					</Pie>
					<Tooltip />
				</PieChart>
			</ResponsiveContainer>
		</div>
	);
}