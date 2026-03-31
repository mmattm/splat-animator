import { Entity } from "@playcanvas/react";
import { GSplat } from "@playcanvas/react/components";
import { useSplat } from "@playcanvas/react/hooks";
import { CustomGSplat } from "./CustomGSplat";
import { useTimeline } from "./stores/timeline";
import { useRef } from "react";
import { useAppEvent } from "@playcanvas/react/hooks";

export default function Splat({ splatId = "A", src }) {
  const { asset } = useSplat(src);

  const entityRef = useRef(null);

  // ✅ only subscribe to what you need (no full store rerender)
  const disableShaders = useTimeline((s) => s.disableShaders);

  // 🔥 transform update (no rerender)
  useAppEvent("update", () => {
    const splat = useTimeline.getState().getSplat(splatId);
    const e = entityRef.current;

    if (!e || !splat) return;

    e.setLocalPosition(...splat.position);
    e.setLocalEulerAngles(...splat.rotation);

    const sc = splat.scale ?? 1;
    e.setLocalScale(sc, sc, sc);
  });

  if (!asset) return null;

  const useCustom = !disableShaders;

  return (
    <Entity ref={entityRef}>
      {useCustom ? (
        <CustomGSplat asset={asset} splatId={splatId} />
      ) : (
        <GSplat asset={asset} highQualitySH />
      )}
    </Entity>
  );
}
