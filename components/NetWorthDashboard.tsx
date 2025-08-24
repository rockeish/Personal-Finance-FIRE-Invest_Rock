'use client'

import { useState } from 'react';
import NetWorthChart from './NetWorthChart';

export default function NetWorthDashboard() {
  const [isTakingSnapshot, setIsTakingSnapshot] = useState(false);

  const handleTakeSnapshot = async () => {
    setIsTakingSnapshot(true);
    await fetch('/api/charts/net-worth/snapshot', { method: 'POST' });
    // We should ideally refetch the chart data here, but for now,
    // we can just rely on the user refreshing the page.
    // A better solution would be to have the chart component refetch on a signal.
    setIsTakingSnapshot(false);
    alert('Snapshot taken! The chart will update on the next page load.');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-medium">Net Worth History</h2>
        <button
          onClick={handleTakeSnapshot}
          disabled={isTakingSnapshot}
          className="rounded bg-brand px-3 py-1 text-white text-sm"
        >
          {isTakingSnapshot ? 'Taking snapshot...' : 'Take Snapshot'}
        </button>
      </div>
      <NetWorthChart />
    </div>
  );
}
