import {
  Recorder as CanvasRecorder,
  estimateBitRate,
  Encoders,
} from "canvas-record";
import { AVC } from "media-codecs";

export class OfflineRecorder {
  constructor({
    width = 1920,
    height = 1080,
    fps = 60,
    format = "mp4", // "mp4" | "png-sequence"
    name = "export",
  } = {}) {
    this.width = width;
    this.height = height;
    this.fps = fps;
    this.format = format;
    this.name = name;

    this.recorder = null;
    this.currentFormat = null;
  }

  even(v) {
    return Math.floor(v / 2) * 2;
  }

  getCanvasContext(canvas) {
    return canvas.getContext("webgl2") || canvas.getContext("webgl");
  }

  init(app, format = this.format) {
    const canvas = app.graphicsDevice.canvas;
    const ctx = this.getCanvasContext(canvas);

    if (!ctx) {
      throw new Error("Impossible de récupérer un contexte WebGL.");
    }

    if (format === "mp4") {
      const bitrate = estimateBitRate(
        this.width,
        this.height,
        this.fps,
        4,
        "variable",
      );

      this.recorder = new CanvasRecorder(ctx, {
        name: this.name,
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
    } else if (format === "png-sequence") {
      this.recorder = new CanvasRecorder(ctx, {
        name: this.name,
        extension: "png",
        frameRate: this.fps,
        encoder: new Encoders.FrameEncoder(),
        download: true,
      });
    } else {
      throw new Error(`Format non supporté : ${format}`);
    }

    this.currentFormat = format;
  }

  async render(app, timeline, options = {}) {
    if (!app) return;

    const format = options.format || this.format;

    if (!this.recorder || this.currentFormat !== format) {
      this.init(app, format);
    }

    const canvas = app.graphicsDevice.canvas;

    const prevWidth = canvas.width;
    const prevHeight = canvas.height;
    const prevStyleW = canvas.style.width;
    const prevStyleH = canvas.style.height;

    try {
      canvas.width = this.even(this.width);
      canvas.height = this.even(this.height);

      canvas.style.width = `${this.width}px`;
      canvas.style.height = `${this.height}px`;

      app.resizeCanvas(this.width, this.height);

      const frames = Math.max(1, Math.floor(timeline.duration * this.fps));

      timeline.pause?.();
      timeline.setProgress?.(0);

      // important: rendre une vraie première frame avant de démarrer
      app.update(1 / this.fps);
      app.render();

      // important: ne pas laisser start() encoder une frame vide
      await this.recorder.start({ initOnly: true });

      for (let i = 0; i < frames; i++) {
        const p = frames === 1 ? 1 : i / (frames - 1);

        timeline.setProgress?.(p);

        app.update(1 / this.fps);
        app.render();

        await this.recorder.step();
      }

      await this.recorder.stop();
    } finally {
      canvas.width = prevWidth;
      canvas.height = prevHeight;

      canvas.style.width = prevStyleW;
      canvas.style.height = prevStyleH;

      app.resizeCanvas(prevWidth, prevHeight);

      timeline.setProgress?.(0);
      timeline.pause?.();
    }
  }
}
