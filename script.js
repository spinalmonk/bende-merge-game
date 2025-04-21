let selectedCell = null;

document.querySelector("#start-game").addEventListener("click", () => {
  const playerName = document.querySelector("#player-name").value.trim();
  const difficulty = document.querySelector("#difficulty").value;
  
  if (!playerName) {
    showMessage("Kérlek adj meg egy nevet!");
    return;
  }
  
  const level = levels[difficulty];
  
  document.querySelector("#start-screen").classList.add("hidden");
  document.querySelector("#game-screen").classList.remove("hidden");
  document.querySelector("#player-info").textContent = `${playerName} - ${level.name} mód`;
  
  generateBoard(level.cols, level.rows, difficulty);
  placeInitialTechnologies(difficulty);
  enableTooltips();
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
      const img = cell.querySelector(".tech-img");

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

        const newImg = cell.querySelector(".tech-img");
        addTooltipListeners(newImg);
        return;
      }

    // Ha már van technológia benne
      if (!selectedCell) {
        // Első kattintás: kijelölés
        selectedCell = cell;
        cell.classList.add("selected");
      } else {
        if (selectedCell === cell) {
          // Ugyanarra kattintott újra → töröljük a kijelölést
          selectedCell.classList.remove("selected");
          selectedCell = null;
          return;
        }
    
        // Megpróbáljuk összeolvasztani
        tryMergeTechnologies(selectedCell, cell);
    
        // Végül mindig töröljük a kijelölést
        selectedCell.classList.remove("selected");
        selectedCell = null;
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
  enableTooltips();
}

function startTimer(minutes) {
  let secondsLeft = minutes * 60;
  const timerDisplay = document.querySelector("#timer");

  const interval = setInterval(() => {
    const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
    const secs = String(secondsLeft % 60).padStart(2, '0');
    timerDisplay.textContent = `${mins}:
    ${secs}`;

    if (secondsLeft-- <= 0) {
      clearInterval(interval);
      showMessage("Lejárt az idő!");
      // TODO: End game logic
    }
  }, 1000);
}

document.querySelector("#draw-button").addEventListener("click", () => {
  const emptyCells = Array.from(document.querySelectorAll(".cell"))
    .filter(cell => cell.innerHTML.trim() === "");

  if (emptyCells.length === 0) {
    showMessage("Nincs üres mező!");
    return;
  }

  const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const difficulty = document.querySelector("#difficulty").value;
  const availableTechs = getAvailableTechnologies(difficulty);
  const tech = availableTechs[Math.floor(Math.random() * availableTechs.length)];

  randomCell.innerHTML = `
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
  randomCell.dataset.step = "1";
  randomCell.dataset.tech = tech.step1.name;
  enableTooltips();
});

function addTooltipListeners(img) {
  let localTimeout;

  img.addEventListener("mouseenter", () => {
    localTimeout = setTimeout(() => {
      const name = img.dataset.name;
      const desc = img.dataset.description;
      const evo = img.dataset.evolution;
      const tooltipImg = img.dataset.tooltip;

      tooltip.innerHTML = `
        <strong>${evo}</strong><br>
        <em>${name}</em><br>
        <p>${desc}</p><br>
        <img src="assets/evolutions/${tooltipImg}" alt="${name}" class="tooltip-img">
        
      `;
      tooltip.classList.remove("hidden");
      tooltip.classList.add("visible");
    }, 3000);
  });

img.addEventListener("mouseleave", () => {
  clearTimeout(localTimeout);
  setTimeout(() => {
    tooltip.classList.remove("visible");
    tooltip.classList.add("hidden");
  }, 300); // 300ms „buffer”
});
}

const tooltip = document.querySelector("#tooltip");

function enableTooltips() {
  const techImgs = document.querySelectorAll(".tech-img");

  techImgs.forEach(img => {
    if (!img.dataset.tooltipReady) {
      addTooltipListeners(img);
      img.dataset.tooltipReady = "true";
    }
  });
}

document.addEventListener("mousemove", (e) => {
  if (tooltip.classList.contains("visible")) {
    let left = e.pageX + 15;
    let top = e.pageY + 15;

    const tooltipRect = tooltip.getBoundingClientRect();
    const padding = 20;

    if (left + tooltipRect.width > window.innerWidth - padding) {
      left = e.pageX - tooltipRect.width - 15;
    }
    if (top + tooltipRect.height > window.innerHeight - padding) {
      top = e.pageY - tooltipRect.height - 15;
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }
});

function tryMergeTechnologies(cell1, cell2) {
  const img1 = cell1.querySelector(".tech-img");
  const img2 = cell2.querySelector(".tech-img");

  if (!img1 || !img2) return;

  const name1 = img1.dataset.name;
  const name2 = img2.dataset.name;
  const evo1 = img1.dataset.evolution;
  const evo2 = img2.dataset.evolution;
  const step1 = parseInt(cell1.dataset.step);
  const step2 = parseInt(cell2.dataset.step);

  // Csak akkor olvaszthatók össze, ha minden stimmel
  if (name1 === name2 && evo1 === evo2 && step1 === step2) {
    const evolution = evolutions.find(e => e.name === evo1);
    const nextStep = evolution.steps.find(s => s.step === step1 + 1);

    if (!nextStep) {
      showMessage("Ez már a legfejlettebb technológia!");
      return;
    }

    // cell2 lesz az új technológia, cell1 kiürül
    cell2.innerHTML = `
      <img 
        src="assets/logos/${nextStep.img}" 
        class="tech-img"
        data-name="${nextStep.name}"
        data-description="${nextStep.description}"
        data-evolution="${evo1}"
        data-tooltip="${evolution.tooltip}"
        data-step="${nextStep.step}"
      >
    `;
    cell2.dataset.step = nextStep.step;
    cell2.dataset.tech = nextStep.name;

    cell1.innerHTML = "";
    delete cell1.dataset.step;
    delete cell1.dataset.tech;

    const img = cell2.querySelector(".tech-img");
    addTooltipListeners(img);
  }
}

function showMessage(text, duration = 2000) {
  const messageBox = document.querySelector("#message");
  messageBox.textContent = text;
  messageBox.classList.remove("hidden");
  messageBox.classList.add("visible");

  setTimeout(() => {
    messageBox.classList.remove("visible");
    messageBox.classList.add("hidden");
  }, duration);
}