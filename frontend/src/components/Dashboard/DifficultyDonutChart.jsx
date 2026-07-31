import React from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export default function DifficultyDonutChart({ easy = 0, medium = 0, hard = 0 }) {
  const navigate = useNavigate();
  const total = easy + medium + hard;

  const data = [
    { name: "Easy", value: easy || 1, color: "#10b981", isPlaceholder: easy === 0 && total === 0 },
    { name: "Medium", value: medium || 1, color: "#f59e0b", isPlaceholder: medium === 0 && total === 0 },
    { name: "Hard", value: hard || 1, color: "#ef4444", isPlaceholder: hard === 0 && total === 0 },
  ];

  const chartData = total === 0 ? data : [
    { name: "Easy", value: easy, color: "#10b981" },
    { name: "Medium", value: medium, color: "#f59e0b" },
    { name: "Hard", value: hard, color: "#ef4444" },
  ].filter(d => d.value > 0);

  return (
    <div
      onClick={() => navigate("/practice")}
      className="card hover-card"
      style={{
        background: "var(--bg-card)",
        borderRadius: "16px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        backdropFilter: "blur(12px)",
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ color: "var(--text-main)", fontSize: "0.95rem", fontWeight: 700, margin: 0 }}>Difficulty Ratio</h3>
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>
          {total} Solved
        </span>
      </div>

      <div style={{ width: "100%", height: 200, position: "relative" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={55}
              outerRadius={75}
              paddingAngle={4}
              stroke="transparent"
              cornerRadius={6}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
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

        {/* Central Summary Circle */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-main)" }}>
            {total}
          </div>
          <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Solved
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", justifyContent: "space-around", fontSize: "0.78rem" }}>
        {[
          { label: "Easy", count: easy, color: "#10b981" },
          { label: "Medium", count: medium, color: "#f59e0b" },
          { label: "Hard", count: hard, color: "#ef4444" },
        ].map((item) => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: item.color }} />
            <span style={{ color: "var(--text-secondary)" }}>{item.label}</span>
            <span style={{ color: "var(--text-main)", fontWeight: 700 }}>{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
