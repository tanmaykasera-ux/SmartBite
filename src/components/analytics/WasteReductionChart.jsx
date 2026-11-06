import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { demandAccuracyData, mealAttendanceBreakdown } from '../../data/mockData';

export function WasteReductionAreaChart() {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={demandAccuracyData} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTraditional" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.28} />
              <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="colorSmartBite" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1f5440" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#1f5440" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
            unit=" kg"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 25px -5px rgba(15, 46, 34, 0.1)',
              fontSize: '12px',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
          <Area
            type="monotone"
            dataKey="traditionalPreparedKg"
            name="Unassisted Prep (kg)"
            stroke="#94a3b8"
            strokeWidth={2}
            strokeDasharray="4 4"
            fillOpacity={1}
            fill="url(#colorTraditional)"
          />
          <Area
            type="monotone"
            dataKey="smartBitePreparedKg"
            name="SmartBite AI Prep (kg)"
            stroke="#1f5440"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorSmartBite)"
          />
          <Area
            type="monotone"
            dataKey="actualConsumedKg"
            name="Actual Student Consumption (kg)"
            stroke="#418c6e"
            strokeWidth={2}
            fill="none"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MealDemandBarChart() {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={mealAttendanceBreakdown} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="meal"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }}
          />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              fontSize: '12px',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
          <Bar
            dataKey="optedIn"
            name="Pre-Selected Attending"
            stackId="a"
            fill="#1f5440"
            radius={[0, 0, 4, 4]}
          />
          <Bar
            dataKey="noResponseBuffer"
            name="Walk-In Entitlement Buffer"
            stackId="a"
            fill="#64a88b"
            radius={[6, 6, 0, 0]}
          />
          <Bar
            dataKey="optedOut"
            name="Indicated Skipping (Saved Prep)"
            fill="#e2dfd5"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
