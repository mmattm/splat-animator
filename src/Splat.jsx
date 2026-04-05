import { Entity } from "@playcanvas/react";
import { GSplat } from "@playcanvas/react/components";
import { useSplat, useAppEvent } from "@playcanvas/react/hooks";
import { CustomGSplat } from "./CustomGSplat";
import { useTimeline } from "./stores/timeline";
import { useRef } from "react";

export default function Splat({ splatId = "A", src }) {
  const { asset } = useSplat(src);
  const entityRef = useRef(null);

  const disableShaders = useTimeline((s) => s.disableShaders);
  const visible = useTimeline((s) =>
    splatId === "B" ? s.splatB.visible : s.splatA.visible,
  );

  useAppEvent("update", () => {
    const splat = useTimeline.getState().getSplat(splatId);
    const e = entityRef.current;

    if (!e || !splat) return;

    e.setLocalPosition(...splat.position);
    e.setLocalEulerAngles(...splat.rotation);

    const sc = splat.scale ?? 1;
    e.setLocalScale(sc, sc, sc);
  });

  if (!asset || !visible) return null;

  return (
    <Entity ref={entityRef}>
      {!disableShaders ? (
        <CustomGSplat asset={asset} splatId={splatId} />
      ) : (
        <GSplat asset={asset} highQualitySH />
      )}
    </Entity>
  );
}
