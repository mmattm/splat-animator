# splat-animator

Simple PlayCanvas splat animation tool.

## Setup

Install dependencies:

`npm install`

## Run

`npm run dev`

## Splats

Put your splat files in:

`public/splats/`

The **Upload** button only sets the filename and loads a splat that is already available in the `public/splats/` folder.

## Presets

Put your preset files in:

`public/presets/`

The default preset loaded on startup is:

`public/presets/timeline-preset.json`

Set your splat filenames inside `splatA.src` and `splatB.src`.

## Panel overview

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

> ⚠️ **Warning:** `Reveal Start` and `Reveal End` are highly dependent on the specific splat.
>
> Some splats become fully revealed at very low values, while others need a much larger range.
> Always test and adjust these values for each splat individually.

## How To

1. Put `.ply` splat files in `public/splats/`
2. Switch the camera to **Free** mode
3. Move the camera to the desired framing for each point
4. Click **Set Start**, **Set Intermediate**, and **Set End** to capture the camera positions for each stage
5. Adjust timeline duration and progress
6. Tune SplatA and SplatB transform and animation values
7. Hide debug elements before rendering
8. Export the setup as JSON
9. Render as MP4 or PNG sequence

> ⚠️ **Warning:** PNG sequence export downloads each PNG frame individually in the browser.
> There is currently no automatic ZIP packaging, so this can trigger many separate downloads.
