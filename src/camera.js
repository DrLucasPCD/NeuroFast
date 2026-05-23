export function createCameraController(videoElement, frameElement) {
  let stream;

  async function start() {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Este navegador não oferece acesso à câmera.");
    }

    stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: "user",
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    });

    videoElement.srcObject = stream;
    await videoElement.play();
    frameElement.classList.add("has-video");
  }

  function stop() {
    if (!stream) return;

    stream.getTracks().forEach((track) => track.stop());
    stream = undefined;
    videoElement.srcObject = null;
    frameElement.classList.remove("has-video");
  }

  return {
    start,
    stop,
  };
}
