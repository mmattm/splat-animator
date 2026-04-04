import { Application } from "@playcanvas/react";
import Splat from "./Splat";
import CameraAnimator from "./cameraAnimator";
import CameraPathDebug from "./CameraPathDebug";
import DebugGrid from "./DebugGrid";
import Panel from "./panel";
import { useTimeline } from "./stores/timeline";

const resolveSplatSrc = (src) => {
  if (!src) return null;

  if (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("/")
  ) {
    return src;
  }

  return `/splats/${src}`;
};

export default function PlayCanvasView() {
  const srcA = useTimeline((s) => s.splatA.src);
  const srcB = useTimeline((s) => s.splatB.src);

  const resolvedSrcA = resolveSplatSrc(srcA);
  const resolvedSrcB = resolveSplatSrc(srcB);

  return (
    <Application
      style={{ width: "100vw", height: "100vh", background: "transparent" }}
      fillMode="none"
      resolutionMode="fixed"
      width={1920}
      height={1080}
      graphicsDeviceOptions={{
        antialias: false,
        alpha: true,
        premultipliedAlpha: false,
        preserveDrawingBuffer: true,
      }}
      className="pc-app"
    >
      <CameraAnimator />
      <CameraPathDebug />
      <DebugGrid />
      <Panel />

      {resolvedSrcA && (
        <Splat key={`A-${resolvedSrcA}`} splatId="A" src={resolvedSrcA} />
      )}

      {resolvedSrcB && (
        <Splat key={`B-${resolvedSrcB}`} splatId="B" src={resolvedSrcB} />
      )}
    </Application>
  );
}
