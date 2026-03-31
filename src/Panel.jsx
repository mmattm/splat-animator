import { Leva, useControls, button, folder } from "leva";
import { useEffect, useRef } from "react";
import { useTimeline } from "./stores/timeline";
import { useApp } from "@playcanvas/react/hooks";
import { OfflineRecorder } from "./lib/OfflineRecorder";

export default function Panel() {
  const app = useApp();
  const timeline = useTimeline();
  const syncingRef = useRef(false);

  const recorderRef = useRef(
    new OfflineRecorder({
      width: 3840,
      height: 2160,
      fps: 60,
    }),
  );

  const renderOffline = async () => {
    await recorderRef.current.render(app, useTimeline.getState());
  };

  const getSplatName = (src, fallback = "none") => {
    if (!src) return fallback;
    return src.split("/").pop() || fallback;
  };

  const applyPreset = (preset) => {
    const t = useTimeline.getState();

    if (preset.start) t.setVec3("start", preset.start);
    if (preset.end) t.setVec3("end", preset.end);
    if (preset.targetStart) t.setVec3("targetStart", preset.targetStart);
    if (preset.targetEnd) t.setVec3("targetEnd", preset.targetEnd);

    if (preset.duration !== undefined) t.setDuration(preset.duration);

    if (preset.splatA) {
      for (const [key, value] of Object.entries(preset.splatA)) {
        t.setSplatValue("A", key, value);
      }
    }

    if (preset.splatB) {
      for (const [key, value] of Object.entries(preset.splatB)) {
        t.setSplatValue("B", key, value);
      }
    }

    // backward compatibility ancien format
    if (preset.shaderStart !== undefined)
      t.setSplatValue("A", "shaderStart", preset.shaderStart);

    if (preset.shaderEnd !== undefined)
      t.setSplatValue("A", "shaderEnd", preset.shaderEnd);

    if (preset.revealStart !== undefined)
      t.setSplatValue("A", "revealStart", preset.revealStart);

    if (preset.revealEnd !== undefined)
      t.setSplatValue("A", "revealEnd", preset.revealEnd);

    if (preset.noiseStart !== undefined)
      t.setSplatValue("A", "noiseStart", preset.noiseStart);

    if (preset.noiseEnd !== undefined)
      t.setSplatValue("A", "noiseEnd", preset.noiseEnd);

    if (preset.noiseSpeed !== undefined)
      t.setSplatValue("A", "noiseSpeed", preset.noiseSpeed);
  };

  const exportPreset = () => {
    const s = useTimeline.getState();

    const preset = {
      start: s.start.toArray(),
      end: s.end.toArray(),
      targetStart: s.targetStart.toArray(),
      targetEnd: s.targetEnd.toArray(),
      duration: s.duration,
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

  const importPreset = () => {
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

  useEffect(() => {
    const load = async () => {
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

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const captureCamera = (type) => {
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

    if (type === "end") {
      t.setVec3("end", pos.toArray());
      t.setVec3("targetEnd", target.toArray());
    }

    set(useTimeline.getState());
  };

  const splatFolder = (id, suffix = "") => {
    const p = id === "B" ? timeline.splatB : timeline.splatA;
    const k = (name) => `${name}${suffix}`;

    return folder(
      {
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
          max: 100,
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
      },
      { collapsed: true },
    );
  };

  const [, set] = useControls(() => ({
    Controls: folder({
      progress: {
        value: timeline.progress,
        min: 0,
        max: 1,
        step: 0.001,
        onChange: (v) => {
          if (!syncingRef.current) {
            timeline.setProgress(v);
          }
        },
      },

      duration: {
        value: timeline.duration,
        min: 0.5,
        max: 15,
        step: 0.1,
        onChange: (v) => timeline.setDuration(v),
      },

      disableShaders: {
        value: timeline.disableShaders ?? false,
        label: "Disable Shaders",
        onChange: (v) => timeline.setDisableShaders(v),
      },

      play: button(() =>
        timeline.playing ? timeline.pause() : timeline.play(),
      ),

      render: button(renderOffline, {
        label: "🎬 Render MP4",
        fullWidth: true,
      }),

      export: button(exportPreset, {
        label: "📤 Export JSON",
        fullWidth: true,
      }),

      load: button(importPreset, {
        label: "📥 Load JSON",
        fullWidth: true,
      }),
    }),

    Camera: folder({
      mode: {
        options: { Animation: "animation", Free: "free" },
        value: timeline.cameraMode,
        onChange: (v) => timeline.setCameraMode(v),
      },

      setStart: button(() => captureCamera("start"), {
        label: "📍 Set Start",
      }),

      setEnd: button(() => captureCamera("end"), {
        label: "📍 Set End",
      }),

      start: {
        value: timeline.start.toArray(),
        onChange: (v) => timeline.setVec3("start", v),
      },

      end: {
        value: timeline.end.toArray(),
        onChange: (v) => timeline.setVec3("end", v),
      },

      targetStart: {
        value: timeline.targetStart.toArray(),
        onChange: (v) => timeline.setVec3("targetStart", v),
      },

      targetEnd: {
        value: timeline.targetEnd.toArray(),
        onChange: (v) => timeline.setVec3("targetEnd", v),
      },
    }),

    SplatA: splatFolder("A", ""),
    SplatB: splatFolder("B", "B"),
  }));

  useEffect(() => {
    syncingRef.current = true;

    const s = useTimeline.getState();

    set({
      progress: s.progress,
      duration: s.duration,

      start: s.start.toArray(),
      end: s.end.toArray(),
      targetStart: s.targetStart.toArray(),
      targetEnd: s.targetEnd.toArray(),

      name: getSplatName(s.splatA.src),
      position: s.splatA.position,
      rotation: s.splatA.rotation,
      scale: typeof s.splatA.scale === "number" ? s.splatA.scale : 1,
      shaderStart: s.splatA.shaderStart,
      shaderEnd: s.splatA.shaderEnd,
      revealStart: s.splatA.revealStart,
      revealEnd: s.splatA.revealEnd,
      noiseStart: s.splatA.noiseStart,
      noiseEnd: s.splatA.noiseEnd,
      noiseSpeed: s.splatA.noiseSpeed,

      nameB: getSplatName(s.splatB.src),
      positionB: s.splatB.position,
      rotationB: s.splatB.rotation,
      scaleB: typeof s.splatB.scale === "number" ? s.splatB.scale : 1,
      shaderStartB: s.splatB.shaderStart,
      shaderEndB: s.splatB.shaderEnd,
      revealStartB: s.splatB.revealStart,
      revealEndB: s.splatB.revealEnd,
      noiseStartB: s.splatB.noiseStart,
      noiseEndB: s.splatB.noiseEnd,
      noiseSpeedB: s.splatB.noiseSpeed,

      disableShaders: s.disableShaders,
    });

    queueMicrotask(() => {
      syncingRef.current = false;
    });
  }, [timeline, set]);

  return <Leva collapsed={false} />;
}
