import React from "react";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "./ExpenseBudgetChart.scss"; 

const categoriesList = ["Salary", "Housing", "Transport", "Food", "Healthcare", "Shopping", "Others"];

const categoryColors = {
  Salary: "#4caf50",
  Housing: "#ff4d4f",
  Transport: "#ffc107",
  Food: "#2196f3",
  Healthcare: "#4c13d0",
  Shopping: "#9c27b0",
  Others: "#888888",
};

const aggregateByCategory = (items) => {
  if (!Array.isArray(items) || items.length === 0) return [];

  return categoriesList.map((category) => ({
    name: category,
    Total: items
      .filter(
        (item) =>
          item.category?.trim().toLowerCase() === category.trim().toLowerCase()
      )
      .reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0),
    color: categoryColors[category],
  }));
};

const ExpenseBudgetChart = ({ items = [] }) => {
  if (!Array.isArray(items)) {
    console.error("Invalid items prop:", items);
    return <p>Error: Invalid data format</p>;
  }

  const chartData = aggregateByCategory(items);

  return (
    <div className="chartContainer">
      <div>
       <h2 style={{ fontWeight: "bold" }}>Expense & Income by Category</h2>
      </div>
      <div className="chartWrapper">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="Total" fill="#8884d8">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ExpenseBudgetChart;
