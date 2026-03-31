import { Entity } from "@playcanvas/react";
import { GSplat } from "@playcanvas/react/components";
import { useRef } from "react";
import { useAppEvent, useApp } from "@playcanvas/react/hooks";
import { useTimeline } from "./stores/timeline";
import vertexShader from "./shaders/custom-splat.js";

export function CustomGSplat({ asset, splatId = "A" }) {
  const ref = useRef(null);
  const app = useApp();
  const shaderInjected = useRef(false);

  useAppEvent("update", () => {
    const mat = ref.current?.gsplat?.material;
    if (!mat) return;

    if (!shaderInjected.current) {
      shaderInjected.current = true;

      const shaderLanguage = app.graphicsDevice.isWebGPU ? "wgsl" : "glsl";
      mat.getShaderChunks(shaderLanguage).set("gsplatModifyVS", vertexShader);
      mat.update();
    }

    const s = useTimeline.getState();
    const { progress } = s;

    const {
      shaderStart,
      shaderEnd,
      revealStart,
      revealEnd,
      noiseStart,
      noiseEnd,
      noiseSpeed,
    } = s.getSplat(splatId);

    const range = shaderEnd - shaderStart || 0.0001;
    let shaderProgress = (progress - shaderStart) / range;
    shaderProgress = Math.max(0, Math.min(1, shaderProgress));

    const lerp = (a, b, t) => a + (b - a) * t;

    const reveal = lerp(revealStart, revealEnd, shaderProgress);
    const noise = lerp(noiseStart, noiseEnd, shaderProgress);

    const t = performance.now() * 0.001;

    mat.setParameter("uTime", t * noiseSpeed);
    mat.setParameter("uReveal", reveal);
    mat.setParameter("uNoiseAmount", noise);
  });

  return (
    <Entity ref={ref}>
      <GSplat asset={asset} highQualitySH />
    </Entity>
  );
}
