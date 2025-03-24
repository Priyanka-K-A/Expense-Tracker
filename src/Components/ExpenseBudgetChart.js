import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const aggregateByCategory = (items) => {
  const result = {};

  items.forEach((item) => {
    console.log("Items: ",item.category);
    const category = item.category || 'Others';
    if (!result[category]) {
      result[category] = { Expense: 0, Budget: 0 };
    }

    if (item.type === 'Expense') {
      result[category].Expense += parseFloat(item.amount);
    } else if (item.type === 'Budget') {
      result[category].Budget += parseFloat(item.amount);
    }
  });

  return Object.entries(result).map(([name, value]) => ({
    name,
    ...value,
  }));
};

const ExpenseBudgetChart = ({ items }) => {
  const chartData = aggregateByCategory(items);

  return (
    <div style={{ width: '100%', height: 400, marginTop: 30 }}>
      <h3>Expense vs Budget by Category</h3>
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Expense" fill="#ff4d4f" />
          <Bar dataKey="Budget" fill="#4caf50" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExpenseBudgetChart;
