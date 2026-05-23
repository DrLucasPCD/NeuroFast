import { INPUT_SIZE } from "./types.js";

export function frameToTensor(videoElement, canvasElement) {
  if (!window.tf) {
    return null;
  }

  const context = canvasElement.getContext("2d", { willReadFrequently: true });
  canvasElement.width = INPUT_SIZE;
  canvasElement.height = INPUT_SIZE;

  context.save();
  context.translate(INPUT_SIZE, 0);
  context.scale(-1, 1);
  context.drawImage(videoElement, 0, 0, INPUT_SIZE, INPUT_SIZE);
  context.restore();

  return window.tf.tidy(() => {
    const pixels = window.tf.browser.fromPixels(canvasElement);
    const normalized = pixels.toFloat().div(255);
    return normalized.expandDims(0);
  });
}
