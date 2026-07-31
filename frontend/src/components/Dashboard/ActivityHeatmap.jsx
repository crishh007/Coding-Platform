import React from "react";

export default function ActivityHeatmap({ history = [] }) {
  const totalDays = 84; // 12 weeks of history
  const today = new Date();

  // Create dates map
  const activityMap = {};
  history.forEach(item => {
    if (item.solvedAt) {
      const dateStr = new Date(item.solvedAt).toDateString();
      activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
    }
  });

  // Generate the last 84 days list
  const daysList = [];
  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    daysList.push({
      dateStr: d.toDateString(),
      count: activityMap[d.toDateString()] || 0
    });
  }

  // Activity colors based on number of daily solved problems
  const getColor = (count) => {
    if (count === 0) return "var(--box-bg)"; // Empty — uses theme-aware subtle bg
    if (count === 1) return "#3b82f6"; // Low (Blue)
    if (count === 2) return "#6366f1"; // Mid (Indigo)
    return "var(--primary)"; // High (Green)
  };

  return (
    <div
      className="card"
      style={{
        background: "var(--bg-card)",
        borderRadius: "16px",
        padding: "20px",
        backdropFilter: "blur(12px)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 style={{ color: "var(--text-main)", fontSize: "0.95rem", fontWeight: 700, margin: 0 }}>Coding Activity</h3>
        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Last 12 Weeks</span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(12, 1fr)",
          gridAutoFlow: "column",
          gap: "6px",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        {daysList.map((day, idx) => (
          <div
            key={idx}
            title={`${day.dateStr}: ${day.count} solved`}
            style={{
              aspectRatio: "1/1",
              borderRadius: "3px",
              background: getColor(day.count),
              transition: "transform 0.1s ease, filter 0.1s ease",
              cursor: "pointer",
            }}
            className="heatmap-cell"
            onMouseEnter={e => {
              e.currentTarget.style.transform = "scale(1.2)";
              e.currentTarget.style.filter = "brightness(1.2)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.filter = "none";
            }}
          />
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "6px", marginTop: "1rem", fontSize: "0.7rem", color: "var(--text-muted)" }}>
        <span>Less</span>
        <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: "var(--box-bg)" }} />
        <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#3b82f6" }} />
        <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#6366f1" }} />
        <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: "var(--primary)" }} />
        <span>More</span>
      </div>
    </div>
  );
}