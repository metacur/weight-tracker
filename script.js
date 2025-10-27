// 各HTML要素を取得して変数に格納
const dateInput = document.getElementById("date");         // 日付入力欄
const weightInput = document.getElementById("weight");     // 体重入力欄
const goalInput = document.getElementById("goal");         // 目標体重入力欄
const goalStatus = document.getElementById("goalStatus");  // 目標との差を表示する領域
const tableBody = document.querySelector("#dataTable tbody"); // 体重記録一覧のテーブル本体
const chartCanvas = document.getElementById("weightChart");   // グラフ描画用のCanvas要素
let chart; // Chart.jsのインスタンスを格納する変数（再描画時に破棄するため）

// ページ読み込み時の初期処理
window.onload = () => {
  dateInput.valueAsDate = new Date(); // 日付入力欄に今日の日付を自動設定
  loadGoal();      // 保存された目標体重を読み込む
  renderTable();   // 体重記録一覧を表示
  renderChart();   // グラフを描画
};

// 新しい体重記録を追加する関数
function addEntry() {
  const date = dateInput.value;                     // 入力された日付
  const weight = parseFloat(weightInput.value);     // 入力された体重（数値に変換）

  // 入力チェック：日付と体重が正しく入力されていない場合は警告
  if (!date || isNaN(weight)) return alert("日付と体重を入力してください");

  const data = getData();               // 現在の記録データを取得
  data.push({ date, weight });          // 新しい記録を追加
  saveData(data);                       // データを保存
  renderTable();                        // テーブルを再描画
  renderChart();                        // グラフを再描画
  updateGoalStatus();                   // 目標との差を更新表示
  weightInput.value = "";              // 入力欄をクリア
}

// ローカルストレージから体重データを取得する関数
function getData() {
  return JSON.parse(localStorage.getItem("weightData")) || []; // データがなければ空配列を返す
}

// ローカルストレージに体重データを保存する関数
function saveData(data) {
  localStorage.setItem("weightData", JSON.stringify(data)); // 配列をJSON文字列に変換して保存
}

// 体重記録一覧テーブルを描画する関数
function renderTable() {
  const data = getData();             // データを取得
  tableBody.innerHTML = "";          // テーブルの中身を初期化

  // 各記録をテーブルの行として追加
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

// 指定された記録を削除する関数
function deleteEntry(index) {
  const data = getData();       // データを取得
  data.splice(index, 1);        // 指定されたインデックスの要素を削除
  saveData(data);               // 更新されたデータを保存
  renderTable();                // テーブルを再描画
  renderChart();                // グラフを再描画
  updateGoalStatus();           // 目標との差を更新表示
}

// Chart.jsを使って体重推移グラフを描画する関数
function renderChart() {
  const data = getData();                     // データを取得
  const labels = data.map(e => e.date);       // 日付の配列
  const weights = data.map(e => e.weight);    // 体重の配列

  if (chart) chart.destroy(); // 既存のグラフがあれば削除（再描画のため）

  chart = new Chart(chartCanvas, {
    type: "line", // 折れ線グラフ
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
          beginAtZero: false // Y軸は0から始めない（体重に合わせる）
        }
      }
    }
  });
}

// 目標体重を保存する関数
function saveGoal() {
  const goal = parseFloat(goalInput.value); // 入力された目標体重
  if (!isNaN(goal)) {
    localStorage.setItem("goalWeight", goal); // ローカルストレージに保存
    updateGoalStatus();                       // 表示を更新
  }
}

// 保存された目標体重を読み込む関数
function loadGoal() {
  const goal = localStorage.getItem("goalWeight"); // ローカルストレージから取得
  if (goal) {
    goalInput.value = goal;     // 入力欄に反映
    updateGoalStatus();         // 表示を更新
  }
}

// 最新の体重と目標体重の差を表示する関数
function updateGoalStatus() {
  const goal = parseFloat(goalInput.value); // 目標体重
  const data = getData();                   // 体重記録データ

  // 目標体重が未設定または記録がない場合は表示をクリア
  if (!goal || data.length === 0) {
    goalStatus.textContent = "";
    return;
  }

  const latest = data[data.length - 1].weight; // 最新の体重
  const diff = (latest - goal).toFixed(1);     // 目標との差（小数1桁）
  goalStatus.textContent = `最新の体重は目標より ${diff > 0 ? "+" : ""}${diff}kg です`;
}
