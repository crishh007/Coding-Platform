import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { name: "Python", value: 40 },
  { name: "Java", value: 25 },
  { name: "C++", value: 20 },
  { name: "JavaScript", value: 15 },
];

const COLORS = [
  "#8B5CF6",
  "#6366F1",
  "#22C55E",
  "#F59E0B",
];

export default function LanguagePieChart() {
  return (
    <div
      style={{
        background: "#201B46",
        borderRadius: "16px",
        padding: "20px",
        marginBottom: "25px",
      }}
    >
      <h2
        style={{
          color: "white",
          marginBottom: "20px",
        }}
      >
        Programming Languages
      </h2>

      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
              label
            >
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>

            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}