/// import * as Autodesk from "@types/forge-viewer";

import { SensorListExtension } from './extensions/SensorListExtension.js';
import { SensorDetailExtension } from './extensions/SensorDetailExtension.js';
import { SensorSpritesExtension } from './extensions/SensorSpritesExtension.js';
import { SensorHeatmapsExtension } from './extensions/SensorHeatmapsExtension.js';

export const SensorListExtensionID = 'IoT.SensorList';
export const SensorDetailExtensionID = 'IoT.SensorDetail';
export const SensorSpritesExtensionID = 'IoT.SensorSprites';
export const SensorHeatmapsExtensionID = 'IoT.SensorHeatmaps';

Autodesk.Viewing.theExtensionManager.registerExtension(SensorListExtensionID, SensorListExtension);
Autodesk.Viewing.theExtensionManager.registerExtension(SensorDetailExtensionID, SensorDetailExtension);
Autodesk.Viewing.theExtensionManager.registerExtension(SensorSpritesExtensionID, SensorSpritesExtension);
Autodesk.Viewing.theExtensionManager.registerExtension(SensorHeatmapsExtensionID, SensorHeatmapsExtension);

async function getAccessToken(callback) {
    try {
        const resp = await fetch('/auth/token');
        if (!resp.ok) {
            throw new Error(await resp.text());
        }
        const { access_token, expires_in } = await resp.json();
        callback(access_token, expires_in);
    } catch (err) {
        alert('Could not obtain access token. See the console for more details.');
        console.error(err);
    }
}

export function initViewer(container, extensions) {
    return new Promise(function (resolve, reject) {
        Autodesk.Viewing.Initializer({ getAccessToken }, function () {
            const viewer = new Autodesk.Viewing.GuiViewer3D(container, { extensions });
            viewer.start();
            resolve(viewer);
        });
    });
}

export function loadModel(viewer, urn, guid) {
    return new Promise(function (resolve, reject) {
        function onDocumentLoadSuccess(doc) {
            const viewable = guid ? doc.getRoot().findByGuid(guid) : doc.getRoot().getDefaultGeometry();
            resolve(viewer.loadDocumentNode(doc, viewable));
        }
        function onDocumentLoadFailure(code, message, errors) {
            reject({ code, message, errors });
        }
        Autodesk.Viewing.Document.load('urn:' + urn, onDocumentLoadSuccess, onDocumentLoadFailure);
    });
}

export function adjustPanelStyle(panel, { left, right, top, bottom, width, height }) {
    const style = panel.container.style;
    style.setProperty('left', left ? left : 'unset');
    style.setProperty('right', right ? right : 'unset');
    style.setProperty('top', top ? top : 'unset');
    style.setProperty('bottom', bottom ? bottom : 'unset');
    style.setProperty('width', width ? width : 'unset');
    style.setProperty('height', height ? height : 'unset');
}
