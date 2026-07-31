import React from "react";
import { BookOpen, Code2, Flame, Trophy } from "lucide-react";

export default function StatsCards({ 
  solvedCount = 0, 
  streak = 0, 
  completedLessons = 0, 
  xp = 0,
  easyCount = 0,
  mediumCount = 0,
  hardCount = 0
}) {
  // Calculate Level Up Progress (XP increments of 1000 per level)
  const xpInCurrentLevel = xp % 1000;
  const xpLevelPercent = Math.min(100, Math.round((xpInCurrentLevel / 1000) * 100));

  const statsList = [
    {
      title: "Completed Lessons",
      value: completedLessons.toString(),
      icon: BookOpen,
      color: "#8B5CF6",
      subWidget: (
        <div style={{ display: "flex", alignItems: "center", gap: "6px", width: "100%", height: "16px" }}>
          <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>Active Study</span>
          <div style={{ flex: 1, height: "4px", background: "var(--box-bg)", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ width: completedLessons > 0 ? "55%" : "0%", height: "100%", background: "#8B5CF6", borderRadius: "4px" }} />
          </div>
        </div>
      )
    },
    {
      title: "Problems Solved",
      value: solvedCount.toString(),
      icon: Code2,
      color: "#3B82F6",
      subWidget: (
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          fontSize: "0.85rem", 
          fontWeight: 750, 
          height: "16px", 
          alignItems: "center",
          width: "100%" 
        }}>
          <span style={{ color: "#10b981" }}>Easy: {easyCount}</span>
          <span style={{ color: "var(--border-color)" }}>|</span>
          <span style={{ color: "#f59e0b" }}>Medium: {mediumCount}</span>
          <span style={{ color: "var(--border-color)" }}>|</span>
          <span style={{ color: "#ef4444" }}>Hard: {hardCount}</span>
        </div>
      )
    },
    {
      title: "Current Streak",
      value: `${streak} Day${streak !== 1 ? "s" : ""}`,
      icon: Flame,
      color: "#F97316",
      subWidget: (
        <div 
          style={{
            display: "flex",
            gap: "5px",
            overflowX: "auto",
            width: "100%",
            height: "20px",
            scrollbarWidth: "none",
            msOverflowStyle: "none"
          }}
        >
          {streak === 0 ? (
            <Flame size={17} color="var(--text-muted)" style={{ opacity: 0.3 }} />
          ) : (
            Array.from({ length: streak }).map((_, fIdx) => (
              <Flame 
                key={fIdx} 
                size={17} 
                color="#F97316" 
                style={{ 
                  flexShrink: 0, 
                  filter: "drop-shadow(0 0 4px rgba(249, 115, 22, 0.65))" 
                }} 
              />
            ))
          )}
        </div>
      )
    },
    {
      title: "XP Earned",
      value: xp.toLocaleString(),
      icon: Trophy,
      color: "#22C55E",
      subWidget: (
        <div style={{ display: "flex", alignItems: "center", gap: "6px", width: "100%", height: "16px" }}>
          <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>Next Lvl</span>
          <div style={{ flex: 1, height: "4px", background: "var(--box-bg)", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ width: `${xpLevelPercent}%`, height: "100%", background: "#22C55E", borderRadius: "4px" }} />
          </div>
          <span style={{ fontSize: "0.68rem", color: "var(--text-secondary)", fontWeight: 700 }}>{xpLevelPercent}%</span>
        </div>
      )
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "16px",
        marginBottom: "20px",
      }}
    >
      {statsList.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="card hover-card"
            style={{
              height: "128px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
          
            {/* Top row: Title and Icon */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "0.75rem",
                    margin: "0 0 2px 0",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}
                >
                  {item.title}
                </p>
                <h2
                  style={{
                    color: "var(--text-main)",
                    margin: 0,
                    fontSize: "1.5rem",
                    fontWeight: 800,
                  }}
                >
                  {item.value}
                </h2>
              </div>
              <div
                style={{
                  padding: "8px",
                  borderRadius: "10px",
                  background: "var(--box-bg)",
                  border: "1px solid var(--border-color)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}
              >
                <Icon size={18} color={item.color} />
              </div>
            </div>

            {/* Bottom row: Dynamic Sub-Widget */}
            <div style={{ width: "100%", marginTop: "12px" }}>
              {item.subWidget}
            </div>
          </div>
        );
      })}
    </div>
  );
}