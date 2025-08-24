'use client'

import { useState, useEffect } from 'react'

interface MonthPickerProps {
  currentMonth: string;
  setCurrentMonth: (month: string) => void;
}

export default function MonthPicker({ currentMonth, setCurrentMonth }: MonthPickerProps) {
  const [months, setMonths] = useState<string[]>([]);

  useEffect(() => {
    const fetchMonths = async () => {
      const res = await fetch('/api/transactions/months');
      if (res.ok) {
        const data = await res.json();
        setMonths(data);
      }
    };
    fetchMonths();
  }, []);

  if (months.length === 0) return null;

  return (
    <select
      className="border rounded px-2 py-1 text-sm"
      value={currentMonth}
      onChange={(e) => setCurrentMonth(e.target.value)}
    >
      {months.map((m) => (
        <option key={m} value={m}>
          {m}
        </option>
      ))}
    </select>
  )
}
