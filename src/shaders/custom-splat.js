import noise from "./noise.js";

export default /* glsl */ `
${noise}

uniform float uTime;
uniform float uReveal;       // souris → reveal
uniform float uNoiseAmount;  // souris → noise strength

float fade(float radius, float len, float feather){
    return 1.0 - smoothstep(radius - feather, radius + feather, len);
}

/* =========================
   CENTER → noise contrôlé
   ========================= */

void modifySplatCenter(inout vec3 center) {

    float noiseScale = 300.4;
    float timeScale = 0.15;

    vec3 curl = BitangentNoise4D(
        vec4(center * noiseScale, uTime * timeScale)
    );

    // 👇 noise diminue avec la souris
    center += curl * 0.5 * uNoiseAmount;
}

/* =========================
   SCALE → reveal progressif
   ========================= */

void modifySplatRotationScale(
    vec3 originalCenter,
    vec3 modifiedCenter,
    inout vec4 rotation,
    inout vec3 scale
) {
    float feather = 0.5;

    float radius = uReveal * 3.0; // reveal contrôlé souris
    float len = length(originalCenter);

    float f = fade(radius, len, feather);

    scale *= f;
}

/* obligatoire */
void modifySplatColor(vec3 center, inout vec4 color) {}

`;
