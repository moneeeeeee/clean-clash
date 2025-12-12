let startTime, interval;
let isRunning = false;

const timerDisplay = document.getElementById("Timer");
const choreInput = document.getElementById("Chore");
const leaderboard = document.getElementById("Leaderboard");

document.getElementById("startBtn").addEventListener("click", () => {
  if (isRunning) return;
  isRunning = true;
  startTime = Date.now();
  interval = setInterval(updateTimer, 100);
});

document.getElementById("stopBtn").addEventListener("click", () => {
  if (!isRunning) return;
  isRunning = false;
  clearInterval(interval);
  saveTime();
});

document.getElementById("resetBtn").addEventListener("click", () => {
  isRunning = false;
  clearInterval(interval);
  timerDisplay.textContent = "00:00:00";
});

function updateTimer() {
  const elapsed = Date.now() - startTime;
  const seconds = Math.floor((elapsed / 1000) % 60);
  const minutes = Math.floor((elapsed / 1000 / 60) % 60);
  const hours = Math.floor(elapsed / 1000 / 60 / 60);

  timerDisplay.textContent = 
    `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function pad(num) {
  return num.toString().padStart(2, "0");
}

function normalizeAttempts(raw) {
  const arr = raw || [];
  if (!arr.length) return [];

  if (typeof arr[0] === "string") {
    return arr.map((t, idx) => ({ time: t, attempt: idx + 1 }));
  }

  return arr;
}

function saveTime() {
  const chore = (choreInput.value || "Unnamed Chore").trim();
  if(!chore) return;
  
  const time = timerDisplay.textContent;
  const key = `chore_${chore}`;
  
  let attempts = normalizeAttempts(JSON.parse(localStorage.getItem(key)));
  
  const nextAttempt =
    attempts.length === 0
      ? 1
      : Math.max(...attempts.map((a) => a.attempt)) + 1;

  attempts.push({ time, attempt: nextAttempt });
  
  localStorage.setItem(key, JSON.stringify(times));
  renderAllLeaderboards();
}

function renderAllLeaderboards() {
  leaderboard.innerHTML = ""; 

  Object.keys(localStorage)
    .filter((key) => key.startsWith("chore_"))
    .sort()
    .forEach((key) => {
      const chore = key.replace("chore_", "");
      let attempts = normalizeAttempts(JSON.parse(localStorage.getItem(key)));
      if (!attempts.length) return;

      const section = document.createElement("div");
      section.classList.add("chore-block");

      const title = document.createElement("h3");
      title.textContent = chore;
      section.appendChild(title);

      const ul = document.createElement("ul");

      const bestFive = [...attempts]
        .sort((a, b) => a.time.localeCompare(b.time))
        .slice(0, 5);

      bestFive.forEach((entry) => {
        const li = document.createElement("li");
        li.textContent = `#${entry.attempt} - ${entry.time}`;
        ul.appendChild(li);
      });

      section.appendChild(ul);
      leaderboard.appendChild(section);

      localStorage.setItem(key, JSON.stringify(attempts));
    });
}

window.addEventListener("DOMContentLoaded", renderAllLeaderboards);
