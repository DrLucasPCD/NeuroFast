import { createAnalyzer } from "./src/analyzer.js";
import { createCameraController } from "./src/camera.js";
import { loadModels } from "./src/modelLoader.js";
import { STEPS, STEP_DURATION_MS, FRAMES_PER_STEP } from "./src/types.js";
import {
  bindUI,
  renderResult,
  renderStep,
  renderSummary,
  setProgress,
  showScreen,
  showStatus,
  toggleRepeat,
} from "./src/ui.js";

const ui = bindUI();
const camera = createCameraController(ui.video, ui.cameraFrame);

let analyzer;
let currentStepIndex = 0;
let stepResults = [];
let isRunning = false;
let repeatRequested = false;

async function boot() {
  ui.startButton.addEventListener("click", startTriage);
  ui.restartButton.addEventListener("click", restartTriage);
  ui.repeatButton.addEventListener("click", requestRepeat);

  const models = await loadModels();
  analyzer = createAnalyzer(models);

  if (models.demoMode) {
    showStatus("Modo demonstração: modelos reais não carregados");
  }
}

async function startTriage() {
  if (isRunning) return;

  showScreen("test");
  toggleRepeat(false);
  stepResults = [];
  currentStepIndex = 0;

  const modelsWarning = analyzer.isDemoMode()
    ? "Modo demonstração: modelos reais não carregados"
    : "Modelos carregados. Análise local ativa.";

  showStatus(modelsWarning);

  try {
    await camera.start();
    await runAllSteps();
  } catch (error) {
    showStatus(error.message || "Não foi possível iniciar a câmera.");
    toggleRepeat(true);
  }
}

async function restartTriage() {
  camera.stop();
  setProgress(0);
  renderSummary([]);
  renderResult(0);
  showScreen("home");
}

function requestRepeat() {
  repeatRequested = true;
}

async function runAllSteps() {
  isRunning = true;

  while (currentStepIndex < STEPS.length) {
    const step = STEPS[currentStepIndex];
    const result = await runStep(step, currentStepIndex);

    if (result.shouldRepeat || repeatRequested) {
      repeatRequested = false;
      showStatus("Qualidade baixa em muitos frames. Repita esta etapa.");
      toggleRepeat(true);
      await waitForRepeatTap();
      continue;
    }

    stepResults.push(result);
    currentStepIndex += 1;
  }

  isRunning = false;
  camera.stop();
  finishTriage();
}

async function runStep(step, index) {
  toggleRepeat(false);
  renderStep(step, index);
  setProgress(0);

  const frameDelay = STEP_DURATION_MS / FRAMES_PER_STEP;
  const frameResults = [];
  const startTime = performance.now();

  showStatus(analyzer.isDemoMode() ? "Modo demonstração: modelos reais não carregados" : "Analisando no navegador...");

  for (let frameIndex = 0; frameIndex < FRAMES_PER_STEP; frameIndex += 1) {
    const elapsed = performance.now() - startTime;
    setProgress(Math.min((elapsed / STEP_DURATION_MS) * 100, 100));

    const frameResult = await analyzer.analyzeFrame(ui.video, ui.canvas, step.id);
    frameResults.push(frameResult);

    await sleep(frameDelay);
  }

  setProgress(100);
  return analyzer.summarizeStep(step, frameResults);
}

function waitForRepeatTap() {
  return new Promise((resolve) => {
    const onClick = () => {
      ui.repeatButton.removeEventListener("click", onClick);
      toggleRepeat(false);
      resolve();
    };

    ui.repeatButton.addEventListener("click", onClick);
  });
}

function finishTriage() {
  const suspectCount = stepResults.filter((result) => result.suspicious).length;
  renderResult(suspectCount);
  renderSummary(stepResults);
  showScreen("result");
}

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

boot();
