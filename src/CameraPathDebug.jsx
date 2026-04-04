import { Entity } from "@playcanvas/react";
import { useApp } from "@playcanvas/react/hooks";
import { useEffect, useRef } from "react";
import { useTimeline } from "./stores/timeline";
import * as pc from "playcanvas";

function quadraticBezierVec3(p0, p1, p2, t) {
  const a = new pc.Vec3().lerp(p0, p1, t);
  const b = new pc.Vec3().lerp(p1, p2, t);
  return new pc.Vec3().lerp(a, b, t);
}

function createSphere(parent, position, color, scale = 0.12) {
  const entity = new pc.Entity();
  entity.addComponent("render", { type: "sphere" });

  const material = new pc.StandardMaterial();
  material.diffuse = color;
  material.emissive = color;
  material.useLighting = false;
  material.update();

  entity.render.material = material;
  entity.setLocalScale(scale, scale, scale);
  entity.setPosition(position);
  parent.addChild(entity);

  return entity;
}

function drawQuad(app, a, b, c, d, color) {
  app.drawLine(a, b, color);
  app.drawLine(b, c, color);
  app.drawLine(c, d, color);
  app.drawLine(d, a, color);
}

function drawCameraFrustum(app, origin, target) {
  const forward = target.clone().sub(origin).normalize();

  const worldUp = new pc.Vec3(0, 1, 0);
  let right = new pc.Vec3().cross(worldUp, forward).normalize();

  if (right.lengthSq() < 0.0001) {
    right = new pc.Vec3(1, 0, 0);
  }

  const up = new pc.Vec3().cross(forward, right).normalize();

  const nearDist = 0.3;
  const farDist = 1.8;

  const nearWidth = 0.26;
  const nearHeight = 0.15;

  const farWidth = 1.7;
  const farHeight = 1.0;

  const nearCenter = origin.clone().add(forward.clone().mulScalar(nearDist));
  const farCenter = origin.clone().add(forward.clone().mulScalar(farDist));

  const makeCorner = (center, rw, uh) =>
    center
      .clone()
      .add(right.clone().mulScalar(rw))
      .add(up.clone().mulScalar(uh));

  const nTL = makeCorner(nearCenter, -nearWidth, nearHeight);
  const nTR = makeCorner(nearCenter, nearWidth, nearHeight);
  const nBR = makeCorner(nearCenter, nearWidth, -nearHeight);
  const nBL = makeCorner(nearCenter, -nearWidth, -nearHeight);

  const fTL = makeCorner(farCenter, -farWidth, farHeight);
  const fTR = makeCorner(farCenter, farWidth, farHeight);
  const fBR = makeCorner(farCenter, farWidth, -farHeight);
  const fBL = makeCorner(farCenter, -farWidth, -farHeight);

  drawQuad(app, nTL, nTR, nBR, nBL, pc.Color.WHITE);
  drawQuad(app, fTL, fTR, fBR, fBL, pc.Color.WHITE);

  app.drawLine(nTL, fTL, pc.Color.WHITE);
  app.drawLine(nTR, fTR, pc.Color.WHITE);
  app.drawLine(nBR, fBR, pc.Color.WHITE);
  app.drawLine(nBL, fBL, pc.Color.WHITE);
}

export default function CameraPathDebug() {
  const app = useApp();
  const rootRef = useRef(null);
  const pointsRef = useRef({});

  useEffect(() => {
    if (!app) return;

    const root = new pc.Entity("camera-path-debug");
    app.root.addChild(root);
    rootRef.current = root;

    pointsRef.current = {
      start: createSphere(root, new pc.Vec3(), new pc.Color(1, 0, 0), 0.12),
      intermediate: createSphere(
        root,
        new pc.Vec3(),
        new pc.Color(1, 0, 0),
        0.16,
      ),
      end: createSphere(root, new pc.Vec3(), new pc.Color(1, 0, 0), 0.12),
      current: createSphere(root, new pc.Vec3(), new pc.Color(1, 1, 1), 0.11),
    };

    const onUpdate = () => {
      const state = useTimeline.getState();
      const {
        start,
        intermediate,
        end,
        targetStart,
        targetIntermediate,
        targetEnd,
        progress,
        showDebug,
      } = state;

      if (rootRef.current) {
        rootRef.current.enabled = showDebug;
      }

      if (!showDebug) return;

      const ease = progress * progress * (3 - 2 * progress);

      const currentPos = quadraticBezierVec3(start, intermediate, end, ease);
      const currentTarget = quadraticBezierVec3(
        targetStart,
        targetIntermediate,
        targetEnd,
        ease,
      );

      pointsRef.current.start?.setPosition(start);
      pointsRef.current.intermediate?.setPosition(intermediate);
      pointsRef.current.end?.setPosition(end);
      pointsRef.current.current?.setPosition(currentPos);

      const samples = 48;
      let prev = quadraticBezierVec3(start, intermediate, end, 0);

      for (let i = 1; i <= samples; i++) {
        const t = i / samples;
        const curr = quadraticBezierVec3(start, intermediate, end, t);
        app.drawLine(prev, curr, pc.Color.WHITE);
        prev = curr;
      }

      drawCameraFrustum(app, currentPos, currentTarget);
    };

    app.on("update", onUpdate);

    return () => {
      app.off("update", onUpdate);
      root.destroy();
      rootRef.current = null;
      pointsRef.current = {};
    };
  }, [app]);

  return <Entity />;
}
