const MODEL_PATHS = {
  faceDetector: "./models/face_detector/model.json",
  strokeClassifier: "./models/stroke_face_classifier/model.json",
};

export async function loadModels() {
  if (!window.tf) {
    return {
      demoMode: true,
      faceDetector: null,
      strokeClassifier: null,
      warning: "Modo demonstração: modelos reais não carregados",
    };
  }

  try {
    const [faceDetector, strokeClassifier] = await Promise.all([
      loadAnyTfjsModel(MODEL_PATHS.faceDetector),
      loadAnyTfjsModel(MODEL_PATHS.strokeClassifier),
    ]);

    return {
      demoMode: false,
      faceDetector,
      strokeClassifier,
      warning: "",
    };
  } catch (error) {
    console.warn("NeuroFAST demo mode:", error);
    return {
      demoMode: true,
      faceDetector: null,
      strokeClassifier: null,
      warning: "Modo demonstração: modelos reais não carregados",
    };
  }
}

async function loadAnyTfjsModel(path) {
  try {
    return await window.tf.loadGraphModel(path);
  } catch (graphError) {
    try {
      return await window.tf.loadLayersModel(path);
    } catch (layersError) {
      throw graphError || layersError;
    }
  }
}
