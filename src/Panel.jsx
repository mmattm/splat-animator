import { Leva, useControls, button, folder } from "leva";
import { useEffect, useRef } from "react";
import { useTimeline } from "./stores/timeline";
import { useApp } from "@playcanvas/react/hooks";
import { OfflineRecorder } from "./lib/OfflineRecorder";

export default function Panel() {
  const app = useApp();

  /* =================================================
     🧠 STORE (single source of truth)
  ================================================= */

  const timeline = useTimeline();
  const syncingRef = useRef(false);

  /* =================================================
     🎬 RECORDER
  ================================================= */

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

  /* =================================================
     📦 PRESET APPLY
  ================================================= */

  const applyPreset = (p) => {
    const t = useTimeline.getState();

    // Camera
    if (p.start) t.setVec3("start", p.start);
    if (p.end) t.setVec3("end", p.end);
    if (p.targetStart) t.setVec3("targetStart", p.targetStart);
    if (p.targetEnd) t.setVec3("targetEnd", p.targetEnd);

    // Global timeline
    if (p.duration) t.setDuration(p.duration);

    // ✅ New format: per-splat params
    if (p.splatA) {
      for (const [k, v] of Object.entries(p.splatA)) t.setSplatValue("A", k, v);
    }
    if (p.splatB) {
      for (const [k, v] of Object.entries(p.splatB)) t.setSplatValue("B", k, v);
    }

    // ✅ Backward compatibility: old presets (single transition block)
    if (p.shaderStart !== undefined)
      t.setSplatValue("A", "shaderStart", p.shaderStart);
    if (p.shaderEnd !== undefined)
      t.setSplatValue("A", "shaderEnd", p.shaderEnd);
    if (p.revealStart !== undefined)
      t.setSplatValue("A", "revealStart", p.revealStart);
    if (p.revealEnd !== undefined)
      t.setSplatValue("A", "revealEnd", p.revealEnd);
    if (p.noiseStart !== undefined)
      t.setSplatValue("A", "noiseStart", p.noiseStart);
    if (p.noiseEnd !== undefined) t.setSplatValue("A", "noiseEnd", p.noiseEnd);
    if (p.noiseSpeed !== undefined)
      t.setSplatValue("A", "noiseSpeed", p.noiseSpeed);
  };

  /* =================================================
     💾 EXPORT JSON
  ================================================= */

  const exportPreset = () => {
    const s = useTimeline.getState();

    const preset = {
      // Camera
      start: s.start.toArray(),
      end: s.end.toArray(),
      targetStart: s.targetStart.toArray(),
      targetEnd: s.targetEnd.toArray(),

      // Global timeline
      duration: s.duration,

      // ✅ Per-splat params
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

  /* =================================================
     📥 IMPORT JSON
  ================================================= */

  const importPreset = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";

    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      applyPreset(JSON.parse(await file.text()));

      // 🔥 sync leva after import
      set(useTimeline.getState());
    };

    input.click();
  };

  /* =================================================
     🚀 AUTO LOAD DEFAULT PRESET
  ================================================= */

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/presets/timeline-preset.json", {
          cache: "no-store",
        });

        const json = await res.json();
        applyPreset(json);

        // 🔥 sync leva with store
        set(useTimeline.getState());
      } catch {
        console.warn("No preset found");
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =================================================
     📍 CAPTURE CAMERA
  ================================================= */

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

    // 🔥 update leva sliders
    set(useTimeline.getState());
  };

  /* =================================================
     🎛 LEVA HELPERS
  ================================================= */

  const splatFolder = (id, suffix = "") => {
    const p = id === "B" ? timeline.splatB : timeline.splatA;
    const k = (name) => `${name}${suffix}`;

    return folder(
      {
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

  /* =================================================
     🎛 LEVA UI
  ================================================= */

  const [, set] = useControls(() => ({
    Controls: folder({
      progress: {
        value: timeline.progress,
        min: 0,
        max: 1,
        step: 0.001,
        onChange: (v) => {
          if (!syncingRef.current) timeline.setProgress(v);
        },
      },

      duration: {
        value: timeline.duration,
        min: 0.5,
        max: 15,
        step: 0.1,
        onChange: timeline.setDuration,
      },

      disableShaders: {
        value: timeline.disableShaders ?? false,
        label: "Disable Shaders",
        onChange: timeline.setDisableShaders,
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
        onChange: timeline.setCameraMode,
      },

      setStart: button(() => captureCamera("start"), { label: "📍 Set Start" }),
      setEnd: button(() => captureCamera("end"), { label: "📍 Set End" }),

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

    // ✅ per splat transitions
    SplatA: splatFolder("A", ""),
    SplatB: splatFolder("B", "B"),
  }));

  /* =================================================
     🔄 SYNC STORE -> LEVA
  ================================================= */

  useEffect(() => {
    syncingRef.current = true;

    const s = useTimeline.getState();

    set({
      // Controls
      progress: s.progress,
      duration: s.duration,

      // Camera
      start: s.start.toArray(),
      end: s.end.toArray(),
      targetStart: s.targetStart.toArray(),
      targetEnd: s.targetEnd.toArray(),

      // Splat A
      shaderStart: s.splatA.shaderStart,
      shaderEnd: s.splatA.shaderEnd,
      revealStart: s.splatA.revealStart,
      revealEnd: s.splatA.revealEnd,
      noiseStart: s.splatA.noiseStart,
      noiseEnd: s.splatA.noiseEnd,
      noiseSpeed: s.splatA.noiseSpeed,

      // ✅ Splat B (suffix B)
      shaderStartB: s.splatB.shaderStart,
      shaderEndB: s.splatB.shaderEnd,
      revealStartB: s.splatB.revealStart,
      revealEndB: s.splatB.revealEnd,
      noiseStartB: s.splatB.noiseStart,
      noiseEndB: s.splatB.noiseEnd,
      noiseSpeedB: s.splatB.noiseSpeed,
      disableShaders: s.disableShaders,
    });

    queueMicrotask(() => (syncingRef.current = false));
  }, [timeline, set]);

  return <Leva collapsed={false} />;
}
