"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveObjectData = exports.loadObjectData = void 0;
var fs_1 = require("fs");
var mappeddata_1 = require("mdx-m3-viewer/dist/cjs/utils/mappeddata");
var objectdata_1 = require("mdx-m3-viewer/dist/cjs/utils/w3x/objectdata/objectdata");
var file_1 = require("mdx-m3-viewer/dist/cjs/parsers/w3x/w3u/file");
function readTextFile(name) {
    // Using __dirname allows the file reads below to be relative to the transformer repo and not the repo using it (e.g. wc3-ts-template).
    // It might be nicer to import these files statically via some file loader - not sure, because there's A LOT of text data.
    return (0, fs_1.readFileSync)(__dirname + '../objectdata/' + name).toString();
}
function loadObjectData(mapDir) {
    // Field names for units and items.
    var unitAndItemMeta = new mappeddata_1.MappedData();
    unitAndItemMeta.load(readTextFile('unitmetadata.slk'));
    // Units data.
    var unitData = new mappeddata_1.MappedData();
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
    var itemData = new mappeddata_1.MappedData();
    itemData.load(readTextFile('itemdata.slk'));
    itemData.load(readTextFile('itemfunc.txt'));
    itemData.load(readTextFile('itemskin.txt'));
    itemData.load(readTextFile('itemabilityfunc.txt'));
    itemData.load(readTextFile('locale/itemabilitystrings.txt'));
    itemData.load(readTextFile('locale/itemskinstrings.txt'));
    itemData.load(readTextFile('locale/itemstrings.txt'));
    var objectData = new objectdata_1.ObjectData(unitAndItemMeta, unitData, itemData);
    if (mapDir) {
        var mapFiles = {};
        // Load in the map unit modifications if it has any.
        var filePath = mapDir + "/war3map.w3u";
        if ((0, fs_1.existsSync)(filePath)) {
            var w3u = new file_1.default();
            w3u.load((0, fs_1.readFileSync)(filePath));
            mapFiles.w3u = w3u;
        }
        // Load in the map item modifications if it has any.
        filePath = mapDir + "/war3map.w3t";
        if ((0, fs_1.existsSync)(filePath)) {
            var w3t = new file_1.default();
            w3t.load((0, fs_1.readFileSync)(filePath));
            mapFiles.w3u = w3t;
        }
        objectData.load(mapFiles);
    }
    return objectData;
}
exports.loadObjectData = loadObjectData;
function saveObjectData(objectData, outputDir) {
    var _a = objectData.save(), w3u = _a.w3u, w3t = _a.w3t;
    if (w3u) {
        (0, fs_1.writeFileSync)(outputDir + "/war3map.w3u", w3u.save());
    }
    if (w3t) {
        (0, fs_1.writeFileSync)(outputDir + "/war3map.w3t", w3t.save());
    }
}
exports.saveObjectData = saveObjectData;
