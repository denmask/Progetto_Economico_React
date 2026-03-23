import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ChartBar = ({ dataValues, labels, title }) => {
  const data = {
    labels: labels,
    datasets: [
      {
        label: title,
        data: dataValues,
        backgroundColor: ['#2563eb', '#22c55e', '#ef4444', '#f59e0b'],
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
  };

  return <Bar data={data} options={options} />;
};

export default ChartBar;