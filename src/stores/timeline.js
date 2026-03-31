import { create } from "zustand";
import * as pc from "playcanvas";

const defaultSplatParams = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
} = {}) => ({
  src: "",
  position,
  rotation,
  scale,

  shaderStart: 0,
  shaderEnd: 1,

  revealStart: 0,
  revealEnd: 10,

  noiseStart: 2,
  noiseEnd: 0,
  noiseSpeed: 0.1,
});

export const useTimeline = create((set, get) => ({
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

  start: new pc.Vec3(0, 0, 10),
  end: new pc.Vec3(-0.9, 0.2, 1.5),

  targetStart: new pc.Vec3(0, 0, 0),
  targetEnd: new pc.Vec3(-2, -1, -10),

  setVec3: (key, v) => set({ [key]: new pc.Vec3(...v) }),

  splatA: defaultSplatParams({
    position: [0, 0, -25],
    rotation: [180, 0, 0],
    scale: 1,
  }),

  splatB: defaultSplatParams({
    position: [0, 0, -20],
    rotation: [180, 0, 0],
    scale: 1,
  }),

  getSplat: (id) => (id === "B" ? get().splatB : get().splatA),

  setSplatValue: (id, key, value) =>
    set((state) => {
      const prop = id === "B" ? "splatB" : "splatA";
      return {
        [prop]: {
          ...state[prop],
          [key]: value,
        },
      };
    }),

  cameraMode: "animation",
  setCameraMode: (m) => set({ cameraMode: m }),
}));
