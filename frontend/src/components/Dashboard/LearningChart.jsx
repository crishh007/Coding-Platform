import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

export default function LearningChart({ history = [] }) {
  const navigate = useNavigate();
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Find start of current week (Sunday)
  const today = new Date();
  const currentDayIndex = today.getDay();
  const startOfWeek = new Date();
  startOfWeek.setDate(today.getDate() - currentDayIndex);
  startOfWeek.setHours(0, 0, 0, 0);

  const solvedCounts = [0, 0, 0, 0, 0, 0, 0];
  
  history.forEach(item => {
    if (item.solvedAt) {
      const solvedDate = new Date(item.solvedAt);
      if (solvedDate >= startOfWeek) {
        const idx = solvedDate.getDay();
        solvedCounts[idx]++;
      }
    }
  });

  const orderedDays = [1, 2, 3, 4, 5, 6, 0]; // Mon to Sun
  const data = orderedDays.map(idx => ({
    day: daysOfWeek[idx],
    Completed: solvedCounts[idx],
  }));

  const totalThisWeek = solvedCounts.reduce((a, b) => a + b, 0);

  return (
    <div
      onClick={() => navigate("/practice")}
      style={{
        background: "var(--bg-card)",
        borderRadius: "16px",
        padding: "24px",
        backdropFilter: "blur(12px)",
        cursor: "pointer",
        width: "100%",
      }}
      className="hover-card"
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem" }}>
        <div>
          <h3 style={{ color: "var(--text-main)", fontSize: "1rem", fontWeight: 700, margin: 0 }}>Weekly Activity & Goal Tracking</h3>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "3px", display: "block" }}>
            Daily target: 3 solved problems
          </span>
        </div>
        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--primary)", display: "block" }}>
            {totalThisWeek}
          </span>
          <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Solved This Week
          </span>
        </div>
      </div>

      <div style={{ width: "100%", height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -32, bottom: 0 }}>
            {/* Custom Neon Gradients */}
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={1} />
                <stop offset="100%" stopColor="#047857" stopOpacity={0.2} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="var(--border-color)" strokeOpacity={0.4} vertical={false} />
            <XAxis 
              dataKey="day" 
              stroke="var(--text-muted)" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false}
              dy={8}
            />
            <YAxis 
              stroke="var(--text-muted)" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false}
              allowDecimals={false}
              dx={-8}
            />
            <Tooltip
              cursor={{ fill: "var(--box-bg)", radius: 8 }}
              contentStyle={{
                background: "var(--bg-card)",
                borderColor: "var(--border-color)",
                borderRadius: "12px",
                color: "var(--text-main)",
                boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                padding: "8px 12px"
              }}
            />
            {/* Soft, minimal target goal line */}
            <ReferenceLine 
              y={3} 
              stroke="rgba(16, 185, 129, 0.25)" 
              strokeWidth={1}
              strokeDasharray="5 5" 
              label={{ value: 'Target Goal', fill: 'rgba(16, 185, 129, 0.65)', fontSize: 9, position: 'right', offset: 10 }} 
            />
            <Bar
              dataKey="Completed"
              fill="url(#barGradient)"
              barSize={20}
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}