export const STEP_DURATION_MS = 5000;
export const FRAMES_PER_STEP = 10;
export const INPUT_SIZE = 224;

export const LABELS = {
  normal: "normal",
  asymmetry: "assimetria_facial",
  lowQuality: "baixa_qualidade",
};

export const STEPS = [
  {
    id: "neutral",
    title: "Rosto neutro",
    instruction: "Olhe para a câmera e fique parado",
  },
  {
    id: "smile",
    title: "Sorriso",
    instruction: "Sorria mostrando os dentes",
  },
  {
    id: "eyes",
    title: "Olhos",
    instruction: "Feche os olhos com força",
  },
  {
    id: "brows",
    title: "Sobrancelhas",
    instruction: "Levante as sobrancelhas",
  },
];
