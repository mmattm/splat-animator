import { Application } from "@playcanvas/react";
import Splat from "./Splat";
import CameraAnimator from "./cameraAnimator";
import Panel from "./panel";

export default function PlayCanvasView() {
  return (
    <Application
      style={{ width: "100vw", height: "100vh" }}
      fillMode="none"
      resolutionMode="fixed"
      width={1920}
      height={1080}
    >
      <CameraAnimator />
      <Panel />

      {/* <Splat
        id="A"
        src="/splats/1.ply"
        position={[0, 0, -25]}
        rotation={[180, 0, 0]}
        applyShader={true}
      /> */}

      <Splat
        id="B"
        src="/splats/Cedre1.ply"
        position={[0, 0, -20]}
        rotation={[180, 0, 0]}
        applyShader={true} // ✅ splat “classique”
      />
    </Application>
  );
}
