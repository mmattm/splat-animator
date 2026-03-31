import { Application } from "@playcanvas/react";
import Splat from "./Splat";
import CameraAnimator from "./cameraAnimator";
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
  console.log(srcA);

  const resolvedSrcA = resolveSplatSrc(srcA);
  const resolvedSrcB = resolveSplatSrc(srcB);

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

      {resolvedSrcA && <Splat splatId="A" src={resolvedSrcA} />}

      {resolvedSrcB && <Splat splatId="B" src={resolvedSrcB} />}
    </Application>
  );
}
