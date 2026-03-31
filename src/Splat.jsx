import { Entity } from "@playcanvas/react";
import { GSplat } from "@playcanvas/react/components";
import { useSplat } from "@playcanvas/react/hooks";
import { CustomGSplat } from "./CustomGSplat";
import { useTimeline } from "./stores/timeline";

export default function Splat({
  id = "A",
  src,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  applyShader = true,
}) {
  const { asset } = useSplat(src);
  const disableShaders = useTimeline((s) => s.disableShaders);

  if (!asset) return null;

  const useCustom = applyShader && !disableShaders;

  return (
    <Entity position={position} rotation={rotation} scale={scale}>
      {useCustom ? (
        <CustomGSplat asset={asset} id={id} />
      ) : (
        <GSplat asset={asset} highQualitySH />
      )}
    </Entity>
  );
}
