"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveObjectData = exports.loadObjectData = void 0;
var fs_1 = require("fs");
var file_1 = require("mdx-m3-viewer-th/dist/cjs/parsers/w3x/w3d/file");
var file_2 = require("mdx-m3-viewer-th/dist/cjs/parsers/w3x/w3u/file");
var cjs_1 = require("war3-objectdata-th/dist/cjs");
function loadFile(path, ContainerClass) {
    if ((0, fs_1.existsSync)(path)) {
        var file = new ContainerClass();
        file.load((0, fs_1.readFileSync)(path));
        return file;
    }
}
function loadObjectData(mapDir) {
    var objectData = new cjs_1.ObjectData();
    if (mapDir) {
        var mapFiles = {};
        // Load in the map unit modifications if it has any.
        var w3u = loadFile("".concat(mapDir, "/war3map.w3u"), file_2.default);
        if (w3u) {
            mapFiles.w3u = w3u;
        }
        var w3uSkin = loadFile("".concat(mapDir, "/war3mapSkin.w3u"), file_2.default);
        if (w3uSkin) {
            mapFiles.w3uSkin = w3uSkin;
        }
        // Load in the map item modifications if it has any.
        var w3t = loadFile("".concat(mapDir, "/war3map.w3t"), file_2.default);
        if (w3t) {
            mapFiles.w3t = w3t;
        }
        var w3tSkin = loadFile("".concat(mapDir, "/war3mapSkin.w3t"), file_2.default);
        if (w3tSkin) {
            mapFiles.w3tSkin = w3tSkin;
        }
        // Load in the map destructable modifications if it has any.
        var w3b = loadFile("".concat(mapDir, "/war3map.w3b"), file_2.default);
        if (w3b) {
            mapFiles.w3b = w3b;
        }
        var w3bSkin = loadFile("".concat(mapDir, "/war3mapSkin.w3b"), file_2.default);
        if (w3bSkin) {
            mapFiles.w3bSkin = w3bSkin;
        }
        // Load in the map doodad modifications if it has any.
        var w3d = loadFile("".concat(mapDir, "/war3map.w3d"), file_1.default);
        if (w3d) {
            mapFiles.w3d = w3d;
        }
        var w3dSkin = loadFile("".concat(mapDir, "/war3mapSkin.w3d"), file_1.default);
        if (w3dSkin) {
            mapFiles.w3dSkin = w3dSkin;
        }
        objectData.load(mapFiles);
    }
    return objectData;
}
exports.loadObjectData = loadObjectData;
function saveObjectData(objectData, outputDir) {
    var _a = objectData.save(), w3u = _a.w3u, w3t = _a.w3t, w3b = _a.w3b, w3d = _a.w3d, w3uSkin = _a.w3uSkin, w3tSkin = _a.w3tSkin, w3bSkin = _a.w3bSkin, w3dSkin = _a.w3dSkin;
    if (w3u) {
        (0, fs_1.writeFileSync)("".concat(outputDir, "/war3map.w3u"), w3u.save());
    }
    if (w3uSkin) {
        (0, fs_1.writeFileSync)("".concat(outputDir, "/war3mapSkin.w3u"), w3uSkin.save());
    }
    if (w3t) {
        (0, fs_1.writeFileSync)("".concat(outputDir, "/war3map.w3t"), w3t.save());
    }
    if (w3tSkin) {
        (0, fs_1.writeFileSync)("".concat(outputDir, "/war3mapSkin.w3t"), w3tSkin.save());
    }
    if (w3b) {
        (0, fs_1.writeFileSync)("".concat(outputDir, "/war3map.w3b"), w3b.save());
    }
    if (w3bSkin) {
        (0, fs_1.writeFileSync)("".concat(outputDir, "/war3mapSkin.w3b"), w3bSkin.save());
    }
    if (w3d) {
        (0, fs_1.writeFileSync)("".concat(outputDir, "/war3map.w3d"), w3d.save());
    }
    if (w3dSkin) {
        (0, fs_1.writeFileSync)("".concat(outputDir, "/war3mapSkin.w3d"), w3dSkin.save());
    }
}
exports.saveObjectData = saveObjectData;
