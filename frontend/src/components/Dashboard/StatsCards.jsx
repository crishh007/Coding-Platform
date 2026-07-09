import { BookOpen, Code2, Flame, Trophy } from "lucide-react";

const stats = [
  {
    title: "Courses",
    value: "24",
    icon: BookOpen,
    color: "#8B5CF6",
  },
  {
    title: "Problems Solved",
    value: "356",
    icon: Code2,
    color: "#3B82F6",
  },
  {
    title: "Current Streak",
    value: "15 Days",
    icon: Flame,
    color: "#F97316",
  },
  {
    title: "XP Earned",
    value: "12,450",
    icon: Trophy,
    color: "#22C55E",
  },
];

export default function StatsCards() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
        gap: "16px",
        marginBottom: "20px",
      }}
    >
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            style={{
              background: "#1E1B4B",
              border: "1px solid #3730A3",
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            <Icon size={28} color={item.color} />

            <p
              style={{
                color: "#BDBDBD",
                marginTop: "12px",
              }}
            >
              {item.title}
            </p>

            <h2
              style={{
                color: "white",
                margin: 0,
              }}
            >
              {item.value}
            </h2>
          </div>
        );
      })}
    </div>
  );
}