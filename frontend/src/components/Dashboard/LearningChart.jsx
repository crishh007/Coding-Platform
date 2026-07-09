import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const data = [
  { day: "Mon", solved: 8 },
  { day: "Tue", solved: 12 },
  { day: "Wed", solved: 15 },
  { day: "Thu", solved: 18 },
  { day: "Fri", solved: 25 },
  { day: "Sat", solved: 30 },
  { day: "Sun", solved: 22 },
];

export default function LearningChart() {
  return (
  <div
    style={{
      background: "#201B46",
      borderRadius: "16px",
      padding: "20px",
      marginBottom: "25px",
    }}
  >
    <h2 style={{ color: "white", marginBottom: "20px" }}>
      Weekly Learning Analytics
    </h2>

    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="#3730A3" strokeDasharray="5 5" />

          <XAxis dataKey="day" stroke="#BDBDBD" />

          <YAxis stroke="#BDBDBD" />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="solved"
            stroke="#8B5CF6"
            strokeWidth={4}
            dot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);
}