# splat-animator

Simple PlayCanvas splat animation tool with a Leva control panel.

## Setup

Install dependencies:

`npm install`

## Run

`npm run dev`

## Splats

Put your splat files in:

`public/splats/`

Example:

`public/splats/asd.ply`

Then use the filename in your preset or state, for example:

`"src": "asd.ply"`

Relative filenames are resolved automatically to `/splats/...`.

## Presets

Put your preset files in:

`public/presets/`

Example:

`public/presets/example.json`

The default preset loaded on startup is:

`public/presets/timeline-preset.json`

## Panel overview

The panel is built with **Leva** and lets you control:

- timeline progress
- animation duration
- shader toggle
- debug display
- render mode
- JSON import/export
- camera positions and targets
- splat transforms
- splat animation values

## Controls

### Main controls

- **progress**: move through the animation from `0` to `1`
- **duration**: total animation duration in seconds
- **Disable Shaders**: disables custom shader animation
- **Show Debug**: shows debug helpers
- **Render Mode**: choose between `mp4` and `png-sequence`
- **Render MP4 / Render PNG Sequence**: offline render output
- **Export JSON**: save the current preset
- **Load JSON**: load a preset from a local file

### Camera

- **mode**: switch between `animation` and `free`
- **Set Start**: capture current camera position and target as start
- **Set Intermediate**: capture current camera position and target as intermediate
- **Set End**: capture current camera position and target as end

Editable values:

- `start`
- `intermediate`
- `end`
- `targetStart`
- `targetIntermediate`
- `targetEnd`

These values define the animated camera path and look targets.

### Splat folders

There are two splat folders:

- **SplatA**
- **SplatB**

Each splat includes:

- **file**: current splat filename
- **position**: splat position
- **rotation**: splat rotation
- **scale**: splat scale
- **Anim Start**: animation start progress
- **Anim End**: animation end progress
- **Reveal Start**: reveal animation start
- **Reveal End**: reveal animation end
- **Noise Start**: noise amount at start
- **Noise End**: noise amount at end
- **Noise velocity**: speed of the noise animation

## Typical workflow

1. Put `.ply` splat files in `public/splats/`
2. Put preset files in `public/presets/`
3. Move the camera in free mode
4. Capture start, intermediate, and end camera positions
5. Adjust timeline duration and progress
6. Tune SplatA and SplatB transform and animation values
7. Export the setup as JSON
8. Render as MP4 or PNG sequence
