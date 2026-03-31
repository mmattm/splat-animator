import { Leva, useControls, button, folder } from "leva";
import { useEffect, useRef } from "react";
import { useTimeline } from "./stores/timeline";
import { useApp } from "@playcanvas/react/hooks";
import { OfflineRecorder } from "./lib/OfflineRecorder";
import {
  captureCamera,
  createSplatFolder,
  exportPreset,
  getSplatName,
  importPreset,
  loadDefaultPreset,
} from "./panelUtils";

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

      load: button(() => importPreset(set), {
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

      setStart: button(() => captureCamera(app, "start", set), {
        label: "📍 Set Start",
      }),

      setEnd: button(() => captureCamera(app, "end", set), {
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

    SplatA: folder(createSplatFolder(timeline, "A", ""), {
      collapsed: true,
    }),

    SplatB: folder(createSplatFolder(timeline, "B", "B"), {
      collapsed: true,
    }),
  }));

  useEffect(() => {
    loadDefaultPreset(set);
  }, [set]);

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
