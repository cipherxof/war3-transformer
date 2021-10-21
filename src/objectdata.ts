import { readFileSync, existsSync, writeFileSync } from "fs";
import { MappedData } from 'mdx-m3-viewer/dist/cjs/utils/mappeddata';
import { ModificationFiles, ObjectData } from 'mdx-m3-viewer/dist/cjs/utils/w3x/objectdata/objectdata';
import War3MapW3u from "mdx-m3-viewer/dist/cjs/parsers/w3x/w3u/file";

function readTextFile(name: string) {
  // Using __dirname allows the file reads below to be relative to the transformer repo and not the repo using it (e.g. wc3-ts-template).
  // It might be nicer to import these files statically via some file loader - not sure, because there's A LOT of text data.
  return readFileSync(__dirname + '../objectdata/' + name).toString();
}

export function loadObjectData(mapDir?: string) {
  // Field names for units and items.
  const unitAndItemMeta = new MappedData();
  unitAndItemMeta.load(readTextFile('unitmetadata.slk'));

  // Units data.
  const unitData = new MappedData();
  unitData.load(readTextFile('unitdata.slk'));
  unitData.load(readTextFile('unitbalance.slk'));
  unitData.load(readTextFile('unitabilities.slk'));
  unitData.load(readTextFile('unitskin.txt'));
  unitData.load(readTextFile('unitskinstrings.txt'));
  unitData.load(readTextFile('unitui.slk'));
  unitData.load(readTextFile('unitweapons.slk'));
  unitData.load(readTextFile('unitweaponsfunc.txt'));
  unitData.load(readTextFile('unitweaponsskin.txt'));
  unitData.load(readTextFile('humanunitfunc.txt'));
  unitData.load(readTextFile('orcunitfunc.txt'));
  unitData.load(readTextFile('undeadunitfunc.txt'));
  unitData.load(readTextFile('nightelfunitfunc.txt'));
  unitData.load(readTextFile('neutralunitfunc.txt'));
  unitData.load(readTextFile('locale/humanunitstrings.txt'));
  unitData.load(readTextFile('locale/orcunitstrings.txt'));
  unitData.load(readTextFile('locale/undeadunitstrings.txt'));
  unitData.load(readTextFile('locale/nightelfunitstrings.txt'));
  unitData.load(readTextFile('locale/neutralunitstrings.txt'));
  unitData.load(readTextFile('locale/unitskinstrings.txt'));
  unitData.load(readTextFile('locale/campaignunitstrings.txt'));

  // Items data.
  const itemData = new MappedData();
  itemData.load(readTextFile('itemdata.slk'));
  itemData.load(readTextFile('itemfunc.txt'));
  itemData.load(readTextFile('itemskin.txt'));
  itemData.load(readTextFile('itemabilityfunc.txt'));
  itemData.load(readTextFile('locale/itemabilitystrings.txt'));
  itemData.load(readTextFile('locale/itemskinstrings.txt'));
  itemData.load(readTextFile('locale/itemstrings.txt'));

  const objectData = new ObjectData(unitAndItemMeta, unitData, itemData);

  if (mapDir) {
    const mapFiles: ModificationFiles = {};

    // Load in the map unit modifications if it has any.
    let filePath = `${mapDir}/war3map.w3u`;
    if (existsSync(filePath)) {
      const w3u = new War3MapW3u();

      w3u.load(readFileSync(filePath));

      mapFiles.w3u = w3u;
    }

    // Load in the map item modifications if it has any.
    filePath = `${mapDir}/war3map.w3t`;
    if (existsSync(filePath)) {
      const w3t = new War3MapW3u();

      w3t.load(readFileSync(filePath));

      mapFiles.w3u = w3t;
    }

    objectData.load(mapFiles);
  }

  return objectData;
}

export function saveObjectData(objectData, outputDir) {
  const { w3u, w3t } = objectData.save();

  if (w3u) {
    writeFileSync(`${outputDir}/war3map.w3u`, w3u.save());
  }

  if (w3t) {
    writeFileSync(`${outputDir}/war3map.w3t`, w3t.save());
  }
}
