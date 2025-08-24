'use client'

import { useState, useEffect } from 'react'

interface UserSettings {
  user_id: number;
  currency: string;
  locale?: string;
  monthly_income: number;
  monthly_investment: number;
  withdrawal_rate: number;
  enable_rollover: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Partial<UserSettings>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      const res = await fetch('/api/settings');
      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
      setIsLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    alert('Settings saved!');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value
    }));
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <section className="rounded border p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <label className="block text-sm">
          Currency
          <input
            name="currency"
            className="mt-1 w-full border rounded px-2 py-1"
            value={settings.currency || ''}
            onChange={handleChange}
          />
        </label>
        <label className="block text-sm">
          Monthly Income
          <input
            name="monthly_income"
            className="mt-1 w-full border rounded px-2 py-1"
            type="number"
            value={settings.monthly_income || 0}
            onChange={handleChange}
          />
        </label>
        <label className="block text-sm">
          Monthly Investment
          <input
            name="monthly_investment"
            className="mt-1 w-full border rounded px-2 py-1"
            type="number"
            value={settings.monthly_investment || 0}
            onChange={handleChange}
          />
        </label>
        <label className="block text-sm">
          Withdrawal Rate (%)
          <input
            name="withdrawal_rate"
            className="mt-1 w-full border rounded px-2 py-1"
            type="number"
            value={settings.withdrawal_rate || 4}
            onChange={handleChange}
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            name="enable_rollover"
            type="checkbox"
            checked={settings.enable_rollover || false}
            onChange={handleChange}
          />
          Enable Rollover
        </label>
      </section>
      <button
        onClick={handleSave}
        className="rounded bg-brand px-4 py-2 text-white"
      >
        Save Settings
      </button>
    </div>
  )
}
