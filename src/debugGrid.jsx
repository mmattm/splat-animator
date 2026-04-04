import { Entity } from "@playcanvas/react";
import { useApp } from "@playcanvas/react/hooks";
import { useEffect } from "react";
import { useTimeline } from "./stores/timeline";
import * as pc from "playcanvas";

export default function DebugGrid() {
  const app = useApp();

  useEffect(() => {
    if (!app) return;

    const onUpdate = () => {
      const { cameraMode, showDebug } = useTimeline.getState();

      if (!showDebug) return;
      if (cameraMode !== "free") return;

      const halfSize = 40;
      const step = 1;
      const y = 0;

      const gridColor = new pc.Color(0.25, 0.25, 0.25);
      const xAxisColor = new pc.Color(1, 0, 0);
      const zAxisColor = new pc.Color(0, 0.7, 1);

      for (let i = -halfSize; i <= halfSize; i += step) {
        const colorX = i === 0 ? xAxisColor : gridColor;
        const colorZ = i === 0 ? zAxisColor : gridColor;

        app.drawLine(
          new pc.Vec3(i, y, -halfSize),
          new pc.Vec3(i, y, halfSize),
          colorX,
        );

        app.drawLine(
          new pc.Vec3(-halfSize, y, i),
          new pc.Vec3(halfSize, y, i),
          colorZ,
        );
      }
    };

    app.on("update", onUpdate);

    return () => {
      app.off("update", onUpdate);
    };
  }, [app]);

  return <Entity />;
}
