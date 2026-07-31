import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = [
  "var(--primary)",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

const LANG_LABELS = {
  python: "Python 3",
  javascript: "JavaScript",
  java: "Java",
  cpp: "C++",
  c: "C",
  go: "Go",
};

export default function LanguagePieChart({ history = [] }) {
  // Aggregate languages
  const langCounts = {};
  history.forEach(item => {
    const lang = item.language || "unknown";
    const label = LANG_LABELS[lang] || lang.toUpperCase();
    langCounts[label] = (langCounts[label] || 0) + 1;
  });

  const chartData = Object.keys(langCounts).map(name => ({
    name,
    value: langCounts[name]
  })).sort((a, b) => b.value - a.value);

  const hasData = chartData.length > 0;

  const displayData = hasData ? chartData : [
    { name: "No Data", value: 1 }
  ];

  return (
    <div
      className="card"
      style={{
        background: "var(--bg-card)",
        borderRadius: "16px",
        padding: "20px",
        backdropFilter: "blur(12px)",
        display: "flex",
        flexDirection: "column",
        gap: "1rem"
      }}
    >
      <h3 style={{ color: "var(--text-main)", fontSize: "0.95rem", fontWeight: 700, margin: 0 }}>Languages Used</h3>

      <div style={{ width: "100%", height: 200, position: "relative" }}>
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={displayData}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                stroke="transparent"
              >
                {displayData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--bg-card)",
                  borderColor: "var(--border-color)",
                  borderRadius: "8px",
                  color: "var(--text-main)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.8rem",
              color: "var(--text-muted)",
              textAlign: "center",
              padding: "0 1.5rem",
              lineHeight: 1.5
            }}
          >
            No language usage recorded yet.<br />Submit code in the Practice page to populate!
          </div>
        )}
      </div>

      {hasData && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem 1rem", fontSize: "0.72rem", justifyContent: "center" }}>
          {displayData.map((item, index) => (
            <div key={item.name} style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: COLORS[index % COLORS.length] }} />
              <span style={{ color: "var(--text-secondary)" }}>{item.name}</span>
              <span style={{ color: "var(--text-main)", fontWeight: 700 }}>({item.value})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}