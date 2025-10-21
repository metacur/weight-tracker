const dateInput = document.getElementById("date");
const weightInput = document.getElementById("weight");
const goalInput = document.getElementById("goal");
const goalStatus = document.getElementById("goalStatus");
const tableBody = document.querySelector("#dataTable tbody");
const chartCanvas = document.getElementById("weightChart");
let chart;

window.onload = () => {
  dateInput.valueAsDate = new Date();
  loadGoal();
  renderTable();
  renderChart();
};

function addEntry() {
  const date = dateInput.value;
  const weight = parseFloat(weightInput.value);
  if (!date || isNaN(weight)) return alert("日付と体重を入力してください");

  const data = getData();
  data.push({ date, weight });
  saveData(data);
  renderTable();
  renderChart();
  updateGoalStatus();
  weightInput.value = "";
}

function getData() {
  return JSON.parse(localStorage.getItem("weightData")) || [];
}

function saveData(data) {
  localStorage.setItem("weightData", JSON.stringify(data));
}

function renderTable() {
  const data = getData();
  tableBody.innerHTML = "";
  data.forEach((entry, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${entry.date}</td>
      <td>${entry.weight.toFixed(1)}</td>
      <td><button onclick="deleteEntry(${index})">削除</button></td>
    `;
    tableBody.appendChild(row);
  });
}

function deleteEntry(index) {
  const data = getData();
  data.splice(index, 1);
  saveData(data);
  renderTable();
  renderChart();
  updateGoalStatus();
}

function renderChart() {
  const data = getData();
  const labels = data.map(e => e.date);
  const weights = data.map(e => e.weight);

  if (chart) chart.destroy();
  chart = new Chart(chartCanvas, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "体重 (kg)",
        data: weights,
        borderColor: "blue",
        fill: false
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: false
        }
      }
    }
  });
}

function saveGoal() {
  const goal = parseFloat(goalInput.value);
  if (!isNaN(goal)) {
    localStorage.setItem("goalWeight", goal);
    updateGoalStatus();
  }
}

function loadGoal() {
  const goal = localStorage.getItem("goalWeight");
  if (goal) {
    goalInput.value = goal;
    updateGoalStatus();
  }
}

function updateGoalStatus() {
  const goal = parseFloat(goalInput.value);
  const data = getData();
  if (!goal || data.length === 0) {
    goalStatus.textContent = "";
    return;
  }
  const latest = data[data.length - 1].weight;
  const diff = (latest - goal).toFixed(1);
  goalStatus.textContent = `最新の体重は目標より ${diff > 0 ? "+" : ""}${diff}kg です`;
}