import { Entity } from "@playcanvas/react";
import { Camera, Script } from "@playcanvas/react/components";
import { useAppEvent } from "@playcanvas/react/hooks";
import { useRef } from "react";
import { useTimeline } from "./stores/timeline";
import { CameraControls } from "playcanvas/scripts/esm/camera-controls.mjs";
import * as pc from "playcanvas";

export default function CameraAnimator() {
  const camRef = useRef(null);

  useAppEvent("update", (dt) => {
    const state = useTimeline.getState();

    state.update(dt);

    const cam = camRef.current;
    if (!cam) return;

    /* 🔥 NEW */
    if (state.cameraMode !== "animation") return;

    const { progress, start, end, targetStart, targetEnd } = state;

    const ease = progress * progress * (3 - 2 * progress);

    const pos = new pc.Vec3().lerp(start, end, ease);
    const target = new pc.Vec3().lerp(targetStart, targetEnd, ease);

    cam.setPosition(pos);
    cam.lookAt(target);
  });

  return (
    <Entity ref={camRef}>
      <Camera clearColor={[0, 0, 0]} />
      <Script script={CameraControls} />
    </Entity>
  );
}
