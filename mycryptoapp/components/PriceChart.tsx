"use client";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

export default function PriceChart({ prices }: { prices: number[][] }) {
  const data = {
    labels: prices.map((p) => new Date(p[0]).toLocaleDateString()),
    datasets: [
      {
        label: "מחיר ב-USD",
        data: prices.map((p) => p[1]),
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
        fill: true,
      },
    ],
  };

  return <Line data={data} />;
}