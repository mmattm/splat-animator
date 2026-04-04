import { useTimeline } from "./stores/timeline";

export const getSplatName = (src, fallback = "none") => {
  if (!src) return fallback;
  return src.split("/").pop() || fallback;
};

export const applyPreset = (preset) => {
  const t = useTimeline.getState();

  if (preset.start) t.setVec3("start", preset.start);
  if (preset.intermediate) t.setVec3("intermediate", preset.intermediate);
  if (preset.end) t.setVec3("end", preset.end);

  if (preset.targetStart) t.setVec3("targetStart", preset.targetStart);
  if (preset.targetIntermediate) {
    t.setVec3("targetIntermediate", preset.targetIntermediate);
  }
  if (preset.targetEnd) t.setVec3("targetEnd", preset.targetEnd);

  if (preset.duration !== undefined) t.setDuration(preset.duration);

  if (preset.showDebug !== undefined) {
    t.setShowDebug(preset.showDebug);
  }

  const nextA = preset.splatA ?? null;
  const nextB = preset.splatB ?? null;

  // force un vrai unload/remount des splats
  t.setSplatValue("A", "src", "");
  t.setSplatValue("B", "src", "");

  requestAnimationFrame(() => {
    if (nextA) {
      for (const [key, value] of Object.entries(nextA)) {
        t.setSplatValue("A", key, value);
      }
    }

    if (nextB) {
      for (const [key, value] of Object.entries(nextB)) {
        t.setSplatValue("B", key, value);
      }
    } else {
      t.setSplatValue("B", "src", "");
    }

    // backward compatibility ancien format
    if (preset.shaderStart !== undefined) {
      t.setSplatValue("A", "shaderStart", preset.shaderStart);
    }

    if (preset.shaderEnd !== undefined) {
      t.setSplatValue("A", "shaderEnd", preset.shaderEnd);
    }

    if (preset.revealStart !== undefined) {
      t.setSplatValue("A", "revealStart", preset.revealStart);
    }

    if (preset.revealEnd !== undefined) {
      t.setSplatValue("A", "revealEnd", preset.revealEnd);
    }

    if (preset.noiseStart !== undefined) {
      t.setSplatValue("A", "noiseStart", preset.noiseStart);
    }

    if (preset.noiseEnd !== undefined) {
      t.setSplatValue("A", "noiseEnd", preset.noiseEnd);
    }

    if (preset.noiseSpeed !== undefined) {
      t.setSplatValue("A", "noiseSpeed", preset.noiseSpeed);
    }
  });
};
export const exportPreset = () => {
  const s = useTimeline.getState();

  const preset = {
    start: s.start.toArray(),
    intermediate: s.intermediate.toArray(),
    end: s.end.toArray(),

    targetStart: s.targetStart.toArray(),
    targetIntermediate: s.targetIntermediate.toArray(),
    targetEnd: s.targetEnd.toArray(),

    duration: s.duration,
    showDebug: s.showDebug,

    splatA: s.splatA,
    splatB: s.splatB,
  };

  const blob = new Blob([JSON.stringify(preset, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = "timeline-preset.json";
  a.click();

  URL.revokeObjectURL(url);
};

export const importPreset = (set) => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";

  input.onchange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const json = JSON.parse(await file.text());
    applyPreset(json);
    set(useTimeline.getState());
  };

  input.click();
};

export const loadDefaultPreset = async (set) => {
  try {
    const res = await fetch("/presets/timeline-preset.json", {
      cache: "no-store",
    });

    const json = await res.json();
    applyPreset(json);
    set(useTimeline.getState());
  } catch {
    console.warn("No preset found");
  }
};

export const captureCamera = (app, type, set) => {
  const camComp = app.systems.camera.cameras[0];
  if (!camComp) return;

  const entity = camComp.entity;
  const pos = entity.getPosition().clone();
  const forward = entity.forward.clone().mulScalar(5);
  const target = pos.clone().add(forward);

  const t = useTimeline.getState();

  if (type === "start") {
    t.setVec3("start", pos.toArray());
    t.setVec3("targetStart", target.toArray());
  }

  if (type === "intermediate") {
    t.setVec3("intermediate", pos.toArray());
    t.setVec3("targetIntermediate", target.toArray());
  }

  if (type === "end") {
    t.setVec3("end", pos.toArray());
    t.setVec3("targetEnd", target.toArray());
  }

  set(useTimeline.getState());
};

export const createSplatFolder = (timeline, id, suffix = "") => {
  const p = id === "B" ? timeline.splatB : timeline.splatA;
  const k = (name) => `${name}${suffix}`;

  return {
    [k("name")]: {
      value: getSplatName(p.src),
      editable: false,
      label: "file",
    },

    [k("position")]: {
      value: p.position,
      label: "position",
      step: 0.01,
      onChange: (v) => timeline.setSplatValue(id, "position", v),
    },

    [k("rotation")]: {
      value: p.rotation,
      label: "rotation",
      step: 0.1,
      onChange: (v) => timeline.setSplatValue(id, "rotation", v),
    },

    [k("scale")]: {
      value: typeof p.scale === "number" ? p.scale : 1,
      label: "scale",
      min: 0,
      max: 10,
      step: 0.01,
      onChange: (v) => timeline.setSplatValue(id, "scale", v),
    },

    [k("shaderStart")]: {
      value: p.shaderStart,
      min: 0,
      max: 1,
      step: 0.01,
      onChange: (v) => timeline.setSplatValue(id, "shaderStart", v),
    },

    [k("shaderEnd")]: {
      value: p.shaderEnd,
      min: 0,
      max: 1,
      step: 0.01,
      onChange: (v) => timeline.setSplatValue(id, "shaderEnd", v),
    },

    [k("revealStart")]: {
      value: p.revealStart,
      min: 0,
      max: 10,
      step: 0.01,
      onChange: (v) => timeline.setSplatValue(id, "revealStart", v),
    },

    [k("revealEnd")]: {
      value: p.revealEnd,
      min: 0,
      max: 25,
      step: 0.01,
      onChange: (v) => timeline.setSplatValue(id, "revealEnd", v),
    },

    [k("noiseStart")]: {
      value: p.noiseStart,
      min: 0,
      max: 2,
      step: 0.01,
      onChange: (v) => timeline.setSplatValue(id, "noiseStart", v),
    },

    [k("noiseEnd")]: {
      value: p.noiseEnd,
      min: 0,
      max: 2,
      step: 0.01,
      onChange: (v) => timeline.setSplatValue(id, "noiseEnd", v),
    },

    [k("noiseSpeed")]: {
      value: p.noiseSpeed,
      min: 0,
      max: 1,
      step: 0.01,
      onChange: (v) => timeline.setSplatValue(id, "noiseSpeed", v),
    },
  };
};
