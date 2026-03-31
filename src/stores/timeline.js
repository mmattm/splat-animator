import { create } from "zustand";
import * as pc from "playcanvas";

const defaultSplatParams = () => ({
  shaderStart: 0,
  shaderEnd: 1,

  revealStart: 0,
  revealEnd: 10,

  noiseStart: 2,
  noiseEnd: 0,
  noiseSpeed: 0.1,
});

export const useTimeline = create((set, get) => ({
  /* =================================================
     ⏱ GLOBAL TIMELINE
  ================================================= */

  duration: 2.5,
  time: 0,
  progress: 0,
  playing: false,

  disableShaders: false,
  setDisableShaders: (v) => set({ disableShaders: v }),

  setDuration: (d) => set({ duration: d }),

  play: () => {
    const { progress } = get();
    if (progress >= 1) {
      set({ time: 0, progress: 0, playing: true });
    } else {
      set({ playing: true });
    }
  },

  pause: () => set({ playing: false }),

  setProgress: (p) =>
    set({
      progress: p,
      time: p * get().duration,
      playing: false,
    }),

  update: (dt) => {
    const { playing, time, duration } = get();
    if (!playing) return;

    const newTime = time + dt;

    set({
      time: newTime,
      progress: Math.min(newTime / duration, 1),
      playing: newTime < duration,
    });
  },

  /* =================================================
     🎥 CAMERA (global)
  ================================================= */

  start: new pc.Vec3(0, 0, 10),
  end: new pc.Vec3(-0.9, 0.2, 1.5),

  targetStart: new pc.Vec3(0, 0, 0),
  targetEnd: new pc.Vec3(-2, -1, -10),

  setVec3: (key, v) => set({ [key]: new pc.Vec3(...v) }),

  /* =================================================
     ✨ SPLAT PARAMS (per layer)
  ================================================= */

  splatA: defaultSplatParams(),
  splatB: defaultSplatParams(),

  // helper: get params by id
  getSplat: (id) => (id === "B" ? get().splatB : get().splatA),

  // set a param inside splatA/splatB
  setSplatValue: (id, key, value) =>
    set((state) => {
      const prop = id === "B" ? "splatB" : "splatA";
      return { [prop]: { ...state[prop], [key]: value } };
    }),

  // optional convenience setters if you like
  setSplatShaderStart: (id, v) => get().setSplatValue(id, "shaderStart", v),
  setSplatShaderEnd: (id, v) => get().setSplatValue(id, "shaderEnd", v),

  /* =================================================
     CAMERA MODE
  ================================================= */

  cameraMode: "animation", // "animation" | "free"
  setCameraMode: (m) => set({ cameraMode: m }),
}));
