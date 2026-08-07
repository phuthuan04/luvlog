const fundGoalForm = document.getElementById("fundGoalForm");
const fundTransactionForm = document.getElementById("fundTransactionForm");
const fundBalance = document.getElementById("fundBalance");
const fundGoalsList = document.getElementById("fundGoalsList");
const fundTransactionsList = document.getElementById("fundTransactionsList");

function formatVND(n) {
  return n.toLocaleString("vi-VN") + "đ";
}

function renderGoals(goals) {
  if (!goals.length) {
    fundGoalsList.innerHTML = '<li class="fund-empty">Chưa có mục tiêu nào</li>';
  } else {
    fundGoalsList.innerHTML = goals
      .map((g) => `
        <li class="goal-item">
          <div class="goal-header">
            <span>${escapeHtml(g.name)}</span>
            <button type="button" class="delete-btn" data-goal-id="${g.id}">Xoá</button>
          </div>
          <div class="progress-bar"><div class="progress-fill" style="width:${Math.min(g.progress, 100)}%"></div></div>
          <span class="goal-meta">${formatVND(g.current)} / ${formatVND(g.target_amount)} · ${g.progress}%</span>
        </li>`)
      .join("");
  }

  const txGoalSelect = document.getElementById("txGoal");
  const currentValue = txGoalSelect.value;
  txGoalSelect.innerHTML = '<option value="">Quỹ chung (không thuộc mục tiêu)</option>' +
    goals.map((g) => `<option value="${g.id}">${escapeHtml(g.name)}</option>`).join("");
  txGoalSelect.value = currentValue;
}

function renderTransactions(transactions, goals) {
  if (!transactions.length) {
    fundTransactionsList.innerHTML = '<li class="fund-empty">Chưa có giao dịch nào</li>';
    return;
  }
  const goalName = (id) => goals.find((g) => g.id === id)?.name;
  fundTransactionsList.innerHTML = transactions
    .map((t) => `
      <li class="transaction-item ${t.amount < 0 ? "expense" : "income"}">
        <span>${escapeHtml(t.description)}${t.goal_id ? ` <small>(${escapeHtml(goalName(t.goal_id) || "")})</small>` : ""}</span>
        <span>${t.amount > 0 ? "+" : ""}${formatVND(t.amount)}</span>
        <button type="button" class="delete-btn" data-tx-id="${t.id}">Xoá</button>
      </li>`)
    .join("");
}

async function loadFund() {
  const res = await fetch(`${API_BASE}/api/fund`, FETCH_OPTS);
  if (res.status === 401) {
    if (typeof showLogin === "function") showLogin();
    return;
  }
  const data = await res.json();
  fundBalance.textContent = formatVND(data.balance);
  renderGoals(data.goals);
  renderTransactions(data.transactions, data.goals);
  if (typeof setCardSummary === "function") {
    setCardSummary("section-fund", `Số dư: ${formatVND(data.balance)}`);
  }
}

fundGoalForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("goalName").value.trim();
  const target = parseInt(document.getElementById("goalTarget").value, 10);
  if (!name || !target) return;

  await fetch(`${API_BASE}/api/fund/goals`, {
    ...FETCH_OPTS,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, target_amount: target }),
  });
  fundGoalForm.reset();
  loadFund();
});

fundTransactionForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const description = document.getElementById("txDescription").value.trim();
  const rawAmount = parseInt(document.getElementById("txAmount").value, 10);
  const type = document.getElementById("txType").value;
  const goalIdRaw = document.getElementById("txGoal").value;
  if (!description || !rawAmount) return;
  const amount = type === "chi" ? -Math.abs(rawAmount) : Math.abs(rawAmount);

  await fetch(`${API_BASE}/api/fund/transactions`, {
    ...FETCH_OPTS,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, description, goal_id: goalIdRaw ? parseInt(goalIdRaw, 10) : null }),
  });
  fundTransactionForm.reset();
  loadFund();
});

document.addEventListener("click", async (e) => {
  if (e.target.matches("[data-tx-id]")) {
    await fetch(`${API_BASE}/api/fund/transactions/${e.target.dataset.txId}`, { ...FETCH_OPTS, method: "DELETE" });
    loadFund();
  }
  if (e.target.matches("[data-goal-id]")) {
    await fetch(`${API_BASE}/api/fund/goals/${e.target.dataset.goalId}`, { ...FETCH_OPTS, method: "DELETE" });
    loadFund();
  }
});