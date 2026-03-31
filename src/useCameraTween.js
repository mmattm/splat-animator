import * as TWEEN from "@tweenjs/tween.js";

export function tweenCamera(cameraEntity, from, to, duration = 2000) {
  if (!cameraEntity) return;

  const state = {
    x: from[0],
    y: from[1],
    z: from[2],
  };

  new TWEEN.Tween(state)
    .to(
      {
        x: to[0],
        y: to[1],
        z: to[2],
      },
      duration,
    )
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onUpdate(() => {
      cameraEntity.setPosition(state.x, state.y, state.z);

      // toujours regarder le centre (optionnel)
      cameraEntity.lookAt(0, 0, 0);
    })
    .start();
}
