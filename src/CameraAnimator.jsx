import { Entity } from "@playcanvas/react";
import { Camera, Script } from "@playcanvas/react/components";
import { useAppEvent } from "@playcanvas/react/hooks";
import { useRef } from "react";
import { useTimeline } from "./stores/timeline";
import { CameraControls } from "playcanvas/scripts/esm/camera-controls.mjs";
import * as pc from "playcanvas";

function quadraticBezierVec3(p0, p1, p2, t) {
  const a = new pc.Vec3().lerp(p0, p1, t);
  const b = new pc.Vec3().lerp(p1, p2, t);
  return new pc.Vec3().lerp(a, b, t);
}

export default function CameraAnimator() {
  const camRef = useRef(null);
  const lastLoggedRef = useRef({
    pos: "",
    target: "",
    rot: "",
  });

  useAppEvent("update", (dt) => {
    const state = useTimeline.getState();
    state.update(dt);

    const cam = camRef.current;
    if (!cam) return;

    if (state.cameraMode === "animation") {
      const {
        progress,
        start,
        intermediate,
        end,
        targetStart,
        targetIntermediate,
        targetEnd,
      } = state;

      const ease = progress * progress * (3 - 2 * progress);

      const pos = quadraticBezierVec3(start, intermediate, end, ease);
      const target = quadraticBezierVec3(
        targetStart,
        targetIntermediate,
        targetEnd,
        ease,
      );

      cam.setPosition(pos);
      cam.lookAt(target);
    }

    const p = cam.getPosition();
    const r = cam.getEulerAngles();

    const posKey = `${p.x.toFixed(2)},${p.y.toFixed(2)},${p.z.toFixed(2)}`;
    const rotKey = `${r.x.toFixed(2)},${r.y.toFixed(2)},${r.z.toFixed(2)}`;

    if (
      posKey !== lastLoggedRef.current.pos ||
      rotKey !== lastLoggedRef.current.rot
    ) {
      console.log("Camera position:", [p.x, p.y, p.z]);
      console.log("Camera rotation:", [r.x, r.y, r.z]);

      lastLoggedRef.current.pos = posKey;
      lastLoggedRef.current.rot = rotKey;
    }
  });

  return (
    <Entity ref={camRef}>
      <Camera clearColor="rgba(0, 0, 0, 0)" clearColorBuffer={true} />
      <Script script={CameraControls} />
    </Entity>
  );
}
