document.querySelector("#start-game").addEventListener("click", () => {
  const playerName = document.querySelector("#player-name").value.trim();
  const difficulty = document.querySelector("#difficulty").value;
  
  if (!playerName) {
    alert("Kérlek, adj meg egy nevet!");
    return;
  }
  
  const level = levels[difficulty];
  
  document.querySelector("#start-screen").classList.add("hidden");
  document.querySelector("#game-screen").classList.remove("hidden");
  document.querySelector("#player-info").textContent = `${playerName} - ${level.name} mód`;
  
  generateBoard(level.cols, level.rows);
  placeInitialTechnologies(difficulty);
  startTimer(level.time);
});

function generateBoard(cols, rows, difficulty) {
  const board = document.querySelector("#game-board");
  board.innerHTML = "";
  board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  board.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

  const availableTechs = getAvailableTechnologies(difficulty);

  for (let i = 0; i < cols * rows; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;

    cell.addEventListener("click", () => {
      if (!cell.innerHTML) {
        const tech = availableTechs[Math.floor(Math.random() * availableTechs.length)];
        cell.innerHTML = `
          <img 
            src="assets/logos/${tech.step1.img}" 
            title="${tech.step1.description}" 
            class="tech-img"
            data-name="${tech.step1.name}"
            data-description="${tech.step1.description}"
            data-evolution="${tech.evolutionName}"
            data-tooltip="${tech.evolutionTooltip}"
          >
        `;
        cell.dataset.step = "1";
        cell.dataset.tech = tech.step1.name;
      }
    });

    board.appendChild(cell);
  }
}

function getRandomAvailableTech(difficulty, stepNumber) {
  const availableTechs = getAvailableTechnologies(difficulty);
  const filtered = availableTechs.filter(t => t.step1.step === stepNumber);

  if (filtered.length === 0) return null;
  return filtered[Math.floor(Math.random() * filtered.length)];
}


function getAvailableTechnologies(difficulty) {
  const difficulties = ["easy", "medium", "hard"];
  const currentIndex = difficulties.indexOf(difficulty);

  const availableTechs = [];

  evolutions.forEach(evo => {
    const evoDifficultyIndex = difficulties.indexOf(evo.difficulty);
    if (evoDifficultyIndex <= currentIndex) {
      const step1 = evo.steps.find(s => s.step === 1);
      if (step1) {
        availableTechs.push({
          step1,
          evolutionName: evo.name,
          evolutionTooltip: evo.tooltip
        });
      }
    }
  });

  return availableTechs;
}

function getRandomTechnologyStep(stepNumber) {
  const candidates = evolutions
    .filter(e => e.steps.some(s => s.step === stepNumber))
    .flatMap(e => e.steps.filter(s => s.step === stepNumber));
  
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function placeInitialTechnologies(difficulty) {
  const startCount = {
    "easy": 4,
    "medium": 6,
    "hard": 8
  }[difficulty];

  const availableTechs = getAvailableTechnologies(difficulty);
  const allCells = Array.from(document.querySelectorAll(".cell"));
  const shuffledCells = allCells.sort(() => 0.5 - Math.random()).slice(0, startCount);

  shuffledCells.forEach(cell => {
    const tech = availableTechs[Math.floor(Math.random() * availableTechs.length)];
    cell.innerHTML = `
      <img 
        src="assets/logos/${tech.step1.img}"
        alt="${tech.step1.name}"
        class="tech-img"
        data-name="${tech.step1.name}"
        data-description="${tech.step1.description}"
        data-evolution="${tech.evolutionName}"
        data-tooltip="${tech.evolutionTooltip}"
      >
    `;
    cell.dataset.step = "1";
    cell.dataset.tech = tech.step1.name;
  });
}

function startTimer(minutes) {
  let secondsLeft = minutes * 60;
  const timerDisplay = document.querySelector("#timer");

  const interval = setInterval(() => {
    const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
    const secs = String(secondsLeft % 60).padStart(2, '0');
    timerDisplay.textContent = `${mins}:${secs}`;

    if (secondsLeft-- <= 0) {
      clearInterval(interval);
      alert("Lejárt az idő!");
      // TODO: End game logic
    }
  }, 1000);
}
