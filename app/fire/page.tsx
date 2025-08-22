'use client'

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

interface FireInputs {
  currentPortfolio: number;
  monthlyInvestment: number;
  annualReturn: number;
  fireNumber: number;
}

export default function FirePage() {
  const [inputs, setInputs] = useState<FireInputs>({
    currentPortfolio: 0,
    monthlyInvestment: 0,
    annualReturn: 7,
    fireNumber: 1000000,
  });
  const [projection, setProjection] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const res = await fetch('/api/fire/data');
      if (res.ok) {
        const data = await res.json();
        setInputs(prev => ({ ...prev, ...data }));
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  const calculateProjection = () => {
    const data = [];
    let portfolio = inputs.currentPortfolio;
    const monthlyReturn = inputs.annualReturn / 100 / 12;
    const monthlyInvestment = inputs.monthlyInvestment;

    for (let year = 0; year <= 40; year++) {
      data.push({ year: new Date().getFullYear() + year, value: portfolio });
      if (portfolio >= inputs.fireNumber) {
        break;
      }
      for (let month = 0; month < 12; month++) {
        portfolio += monthlyInvestment;
        portfolio *= (1 + monthlyReturn);
      }
    }
    setProjection(data);
  };

  if (isLoading) {
    return <div>Loading calculator...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">FIRE Calculator</h1>

      <section className="rounded-lg border p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <label className="block text-sm">
          Current Portfolio
          <input name="currentPortfolio" type="number" value={inputs.currentPortfolio} onChange={handleInputChange} className="mt-1 w-full border rounded px-2 py-1" />
        </label>
        <label className="block text-sm">
          Monthly Investment
          <input name="monthlyInvestment" type="number" value={inputs.monthlyInvestment} onChange={handleInputChange} className="mt-1 w-full border rounded px-2 py-1" />
        </label>
        <label className="block text-sm">
          Est. Annual Return (%)
          <input name="annualReturn" type="number" value={inputs.annualReturn} onChange={handleInputChange} className="mt-1 w-full border rounded px-2 py-1" />
        </label>
        <label className="block text-sm">
          FIRE Number
          <input name="fireNumber" type="number" value={inputs.fireNumber} onChange={handleInputChange} className="mt-1 w-full border rounded px-2 py-1" />
        </label>
        <div className="col-span-full">
          <button onClick={calculateProjection} className="rounded bg-brand px-4 py-2 text-white">Calculate</button>
        </div>
      </section>

      {projection.length > 0 && (
        <section className="rounded-lg border p-4">
          <h2 className="font-medium mb-2">Net Worth Projection</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={projection}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip formatter={(value: number) => `$${value.toFixed(0)}`} />
              <Legend />
              <Line type="monotone" dataKey="value" name="Projected Net Worth" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </section>
      )}
    </div>
  );
}
