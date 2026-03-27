import React from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  BarElement, PointElement, LineElement,
  Title, Tooltip, Legend, Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale,
  BarElement, PointElement, LineElement,
  Title, Tooltip, Legend, Filler,
);

const COLORS = ['#4f8ef7', '#0fd494', '#ff4d6a', '#ffb340', '#a78bfa', '#00d4ff'];

const ChartBar = ({ dataValues = [], labels = [], title = '', tipo = 'barre', colori }) => {
  const resolvedColors = colori || dataValues.map((_, i) => COLORS[i % COLORS.length]);

  const baseDataset = {
    label: title,
    data: dataValues,
    borderRadius: tipo === 'barre' ? 6 : 0,
    borderSkipped: false,
  };

  const barDataset = {
    ...baseDataset,
    backgroundColor: resolvedColors,
  };

  const lineDataset = {
    ...baseDataset,
    backgroundColor: `${resolvedColors[0]}22`,
    borderColor: resolvedColors[0],
    borderWidth: 2.5,
    pointBackgroundColor: resolvedColors[0],
    pointBorderColor: '#060810',
    pointBorderWidth: 2,
    pointRadius: 5,
    pointHoverRadius: 7,
    tension: 0.38,
    fill: true,
  };

  const chartData = {
    labels,
    datasets: [tipo === 'linea' ? lineDataset : barDataset],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(11,15,26,0.95)',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        titleColor: '#f0f4ff',
        bodyColor: '#8899bb',
        padding: 10,
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${ctx.raw.toLocaleString('it-IT')} €`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#6a7a9b',
          font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' },
        },
        grid: { color: 'rgba(255,255,255,0.04)' },
      },
      y: {
        ticks: {
          color: '#6a7a9b',
          font: { family: 'JetBrains Mono', size: 11 },
          callback: (v) => v.toLocaleString('it-IT') + ' €',
        },
        grid: { color: 'rgba(255,255,255,0.04)' },
      },
    },
  };

  const Component = tipo === 'linea' ? Line : Bar;

  return <Component data={chartData} options={options} />;
};

export default ChartBar;