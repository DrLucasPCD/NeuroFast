import { frameToTensor } from "./preprocess.js";
import { LABELS } from "./types.js";

const CLASSIFIER_LABELS = [LABELS.normal, LABELS.asymmetry, LABELS.lowQuality];

export function createAnalyzer(models) {
  function isDemoMode() {
    return models.demoMode || !models.strokeClassifier;
  }

  async function analyzeFrame(videoElement, canvasElement, stepId) {
    if (isDemoMode()) {
      return simulateFrameResult(stepId);
    }

    const tensor = frameToTensor(videoElement, canvasElement);

    try {
      const prediction = models.strokeClassifier.predict(tensor);
      const outputTensor = Array.isArray(prediction) ? prediction[0] : prediction;
      const data = await outputTensor.data();
      const labelIndex = indexOfMax(Array.from(data));
      disposePrediction(prediction);

      return CLASSIFIER_LABELS[labelIndex] || LABELS.lowQuality;
    } finally {
      tensor?.dispose();
    }
  }

  function summarizeStep(step, frameResults) {
    const lowQualityCount = countLabel(frameResults, LABELS.lowQuality);
    const asymmetryCount = countLabel(frameResults, LABELS.asymmetry);
    const total = frameResults.length || 1;
    const shouldRepeat = lowQualityCount / total > 0.4;
    const suspicious = asymmetryCount / total > 0.5;

    return {
      stepId: step.id,
      title: step.title,
      frames: frameResults,
      lowQualityCount,
      asymmetryCount,
      shouldRepeat,
      suspicious,
    };
  }

  return {
    analyzeFrame,
    isDemoMode,
    summarizeStep,
  };
}

function simulateFrameResult(stepId) {
  const random = Math.random();
  const asymmetryBias = stepId === "smile" || stepId === "brows" ? 0.22 : 0.12;

  if (random < 0.12) return LABELS.lowQuality;
  if (random < 0.12 + asymmetryBias) return LABELS.asymmetry;
  return LABELS.normal;
}

function countLabel(results, label) {
  return results.filter((result) => result === label).length;
}

function indexOfMax(values) {
  return values.reduce((bestIndex, value, index, array) => {
    return value > array[bestIndex] ? index : bestIndex;
  }, 0);
}

function disposePrediction(prediction) {
  if (Array.isArray(prediction)) {
    prediction.forEach((tensor) => tensor.dispose?.());
    return;
  }

  prediction.dispose?.();
}
