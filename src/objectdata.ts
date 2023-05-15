import { readFileSync, existsSync, writeFileSync } from "fs";
import War3MapW3d from "mdx-m3-viewer-th/dist/cjs/parsers/w3x/w3d/file";
import War3MapW3u from "mdx-m3-viewer-th/dist/cjs/parsers/w3x/w3u/file";
import { ObjectData, ModificationFiles } from "war3-objectdata-th/dist/cjs";

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
   
    const w3uSkin = loadFile(`${mapDir}/war3mapSkin.w3u`, War3MapW3u);
    if (w3uSkin) {
      mapFiles.w3uSkin = w3uSkin;
    }

    // Load in the map item modifications if it has any.
    const w3t = loadFile(`${mapDir}/war3map.w3t`, War3MapW3u);
    if (w3t) {
      mapFiles.w3t = w3t;
    }

    const w3tSkin = loadFile(`${mapDir}/war3mapSkin.w3t`, War3MapW3u);
    if (w3tSkin) {
      mapFiles.w3tSkin = w3tSkin;
    }

    // Load in the map destructable modifications if it has any.
    const w3b = loadFile(`${mapDir}/war3map.w3b`, War3MapW3u);
    if (w3b) {
      mapFiles.w3b = w3b;
    }

    const w3bSkin = loadFile(`${mapDir}/war3mapSkin.w3b`, War3MapW3u);
    if (w3bSkin) {
      mapFiles.w3bSkin = w3bSkin;
    }

    // Load in the map doodad modifications if it has any.
    const w3d = loadFile(`${mapDir}/war3map.w3d`, War3MapW3d);
    if (w3d) {
      mapFiles.w3d = w3d;
    }

    const w3dSkin = loadFile(`${mapDir}/war3mapSkin.w3d`, War3MapW3d);
    if (w3dSkin) {
      mapFiles.w3dSkin = w3dSkin;
    }

    objectData.load(mapFiles);
  }

  return objectData;
}

export function saveObjectData(objectData: ObjectData, outputDir: string) {
  const { w3u, w3t, w3b, w3d, w3uSkin, w3tSkin, w3bSkin, w3dSkin } = objectData.save();

  if (w3u) {
    writeFileSync(`${outputDir}/war3map.w3u`, w3u.save());
  }

  if (w3uSkin) {
    writeFileSync(`${outputDir}/war3mapSkin.w3u`, w3uSkin.save());
  }

  if (w3t) {
    writeFileSync(`${outputDir}/war3map.w3t`, w3t.save());
  }

  if (w3tSkin) {
    writeFileSync(`${outputDir}/war3mapSkin.w3t`, w3tSkin.save());
  }

  if (w3b) {
    writeFileSync(`${outputDir}/war3map.w3b`, w3b.save());
  }

  if (w3bSkin) {
    writeFileSync(`${outputDir}/war3mapSkin.w3b`, w3bSkin.save());
  }

  if (w3d) {
    writeFileSync(`${outputDir}/war3map.w3d`, w3d.save());
  }

  if (w3dSkin) {
    writeFileSync(`${outputDir}/war3mapSkin.w3d`, w3dSkin.save());
  }
}
