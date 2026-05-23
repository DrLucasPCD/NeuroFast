import { STEPS } from "./types.js";

const screens = {
  home: "homeScreen",
  test: "testScreen",
  result: "resultScreen",
};

export function bindUI() {
  return {
    homeScreen: document.getElementById("homeScreen"),
    testScreen: document.getElementById("testScreen"),
    resultScreen: document.getElementById("resultScreen"),
    startButton: document.getElementById("startButton"),
    restartButton: document.getElementById("restartButton"),
    repeatButton: document.getElementById("repeatButton"),
    video: document.getElementById("cameraPreview"),
    canvas: document.getElementById("captureCanvas"),
    cameraFrame: document.querySelector(".camera-frame"),
    stepCount: document.getElementById("stepCount"),
    instructionText: document.getElementById("instructionText"),
    progressFill: document.getElementById("progressFill"),
    statusText: document.getElementById("statusText"),
    resultCard: document.getElementById("resultCard"),
    resultTitle: document.getElementById("resultTitle"),
    resultDescription: document.getElementById("resultDescription"),
    emergencyNote: document.getElementById("emergencyNote"),
    summaryList: document.getElementById("summaryList"),
  };
}

export function showScreen(screenName) {
  Object.values(screens).forEach((screenId) => {
    document.getElementById(screenId).classList.add("is-hidden");
  });

  document.getElementById(screens[screenName]).classList.remove("is-hidden");
}

export function renderStep(step, index) {
  document.getElementById("stepCount").textContent = `Etapa ${index + 1} de ${STEPS.length} - ${step.title}`;
  document.getElementById("instructionText").textContent = step.instruction;
}

export function setProgress(percent) {
  document.getElementById("progressFill").style.width = `${Math.max(0, Math.min(percent, 100))}%`;
}

export function showStatus(message) {
  document.getElementById("statusText").textContent = message;
}

export function toggleRepeat(enabled) {
  document.getElementById("repeatButton").disabled = !enabled;
}

export function renderResult(suspectCount) {
  const resultCard = document.getElementById("resultCard");
  const resultTitle = document.getElementById("resultTitle");
  const resultDescription = document.getElementById("resultDescription");
  const emergencyNote = document.getElementById("emergencyNote");

  resultCard.classList.toggle("severe", suspectCount >= 2);
  emergencyNote.classList.toggle("is-hidden", suspectCount < 2);

  if (suspectCount === 0) {
    resultTitle.textContent = "Baixo risco visual";
    resultDescription.textContent = "Nenhuma etapa apresentou assimetria facial visual persistente.";
    return;
  }

  if (suspectCount === 1) {
    resultTitle.textContent = "Assimetria detectada — recomenda avaliação médica";
    resultDescription.textContent =
      "Uma etapa apresentou assimetria facial visual persistente. Procure avaliação médica.";
    return;
  }

  resultTitle.textContent =
    "Sinais visuais compatíveis com AVC/paralisia facial — procure emergência imediatamente";
  resultDescription.textContent =
    "Duas ou mais etapas apresentaram assimetria facial visual persistente.";
}

export function renderSummary(results) {
  const summaryList = document.getElementById("summaryList");
  summaryList.innerHTML = "";

  results.forEach((result) => {
    const row = document.createElement("div");
    row.className = "summary-item";

    const title = document.createElement("strong");
    title.textContent = result.title;

    const status = document.createElement("span");
    status.textContent = result.suspicious ? "Suspeita" : "Sem suspeita";

    row.append(title, status);
    summaryList.appendChild(row);
  });
}
