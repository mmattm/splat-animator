import { Recorder as CanvasRecorder, estimateBitRate } from "canvas-record";
import { AVC } from "media-codecs";

export class OfflineRecorder {
  constructor({ width = 1920, height = 1080, fps = 60 } = {}) {
    this.width = width;
    this.height = height;
    this.fps = fps;

    this.recorder = null;
  }

  /* ================= init encoder ================= */

  init(app) {
    const canvas = app.graphicsDevice.canvas;

    const ctx = canvas.getContext("webgl2") || canvas.getContext("webgl");

    const bitrate = estimateBitRate(
      this.width,
      this.height,
      this.fps,
      4,
      "variable",
    );

    this.recorder = new CanvasRecorder(ctx, {
      name: "export",
      extension: "mp4",
      frameRate: this.fps,
      encoderOptions: {
        codec: AVC.getCodec({
          profile: "High",
          level: "5.1",
        }),
        bitrate,
      },
      download: true,
    });
  }

  /* ================= render ================= */

  async render(app, timeline) {
    if (!app) return;

    if (!this.recorder) this.init(app);

    const canvas = app.graphicsDevice.canvas;

    const even = (v) => Math.floor(v / 2) * 2;

    const prevWidth = canvas.width;
    const prevHeight = canvas.height;
    const prevStyleW = canvas.style.width;
    const prevStyleH = canvas.style.height;

    /* force size */
    canvas.width = even(this.width);
    canvas.height = even(this.height);

    canvas.style.width = `${this.width}px`;
    canvas.style.height = `${this.height}px`;

    app.resizeCanvas(this.width, this.height);

    const frames = Math.floor(timeline.duration * this.fps);

    timeline.pause();

    await this.recorder.start();

    for (let i = 0; i < frames; i++) {
      const p = i / (frames - 1);

      timeline.setProgress(p);

      app.update(1 / this.fps);
      app.render();

      await this.recorder.step();
    }

    await this.recorder.stop();

    /* restore */
    canvas.width = prevWidth;
    canvas.height = prevHeight;

    canvas.style.width = prevStyleW;
    canvas.style.height = prevStyleH;

    app.resizeCanvas(prevWidth, prevHeight);

    timeline.reset();
  }
}
