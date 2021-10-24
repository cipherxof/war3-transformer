import { readFileSync, existsSync, writeFileSync } from "fs";
import War3MapW3d from "mdx-m3-viewer/dist/cjs/parsers/w3x/w3d/file";
import War3MapW3u from "mdx-m3-viewer/dist/cjs/parsers/w3x/w3u/file";
import { ObjectData, ModificationFiles } from "war3-objectdata";

function loadFile(path: string, ContainerClass: typeof War3MapW3u | typeof War3MapW3d) {
  if (existsSync(path)) {
    const file = new ContainerClass();

    file.load(readFileSync(path));

    return file;
  }
}

export function loadObjectData(mapDir?: string) {
  const objectData = new ObjectData();

  if (mapDir) {
    const mapFiles: ModificationFiles = {};

    // Load in the map unit modifications if it has any.
    const w3u = loadFile(`${mapDir}/war3map.w3u`, War3MapW3u);
    if (w3u) {
      mapFiles.w3u = w3u;
    }
   
    // Load in the map item modifications if it has any.
    const w3t = loadFile(`${mapDir}/war3map.w3t`, War3MapW3u);
    if (w3t) {
      mapFiles.w3t = w3t;
    }

    // Load in the map destructable modifications if it has any.
    const w3b = loadFile(`${mapDir}/war3map.w3b`, War3MapW3u);
    if (w3b) {
      mapFiles.w3b = w3b;
    }

    // Load in the map doodad modifications if it has any.
    const w3d = loadFile(`${mapDir}/war3map.w3d`, War3MapW3d);
    if (w3d) {
      mapFiles.w3d = w3d;
    }

    objectData.load(mapFiles);
  }

  return objectData;
}

export function saveObjectData(objectData: ObjectData, outputDir: string) {
  const { w3u, w3t, w3b, w3d } = objectData.save();

  if (w3u) {
    writeFileSync(`${outputDir}/war3map.w3u`, w3u.save());
  }

  if (w3t) {
    writeFileSync(`${outputDir}/war3map.w3t`, w3t.save());
  }

  if (w3b) {
    writeFileSync(`${outputDir}/war3map.w3b`, w3b.save());
  }

  if (w3d) {
    writeFileSync(`${outputDir}/war3map.w3d`, w3d.save());
  }
}
