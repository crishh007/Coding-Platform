export default function ActivityHeatmap() {
  const weeks = 7;
  const days = 7;

  const colors = [
    "#2B2555",
    "#4338CA",
    "#6D5DF6",
    "#8B5CF6",
  ];

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
        Coding Activity
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${weeks}, 20px)`,
          gap: "8px",
        }}
      >
        {Array.from({ length: weeks * days }).map((_, index) => (
          <div
            key={index}
            style={{
              width: "18px",
              height: "18px",
              borderRadius: "4px",
              background:
                colors[Math.floor(Math.random() * colors.length)],
            }}
          />
        ))}
      </div>
    </div>
  );
}