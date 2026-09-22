'use client';

import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

interface DifficultyChartProps {
  distribution: { Easy: number; Moderate: number; Difficult: number };
}

const COLORS = {
  Easy: '#34d399',
  Moderate: '#fbbf24',
  Difficult: '#f87171',
};

export function DifficultyChart({ distribution }: DifficultyChartProps) {
  const data = [
    { name: 'Easy %', value: distribution?.Easy || 0, color: COLORS.Easy },
    { name: 'Moderate %', value: distribution?.Moderate || 0, color: COLORS.Moderate },
    { name: 'Difficult %', value: distribution?.Difficult || 0, color: COLORS.Difficult },
  ];

  return (
    <div className="h-64 w-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
            formatter={(val: any) => [`${val}%`, 'Share']}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
