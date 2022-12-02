/// import * as Autodesk from "@types/forge-viewer";
/// import * as Chart from "@types/chart.js";
import { findNearestTimestampIndex } from './HistoricalDataView.js';
export class SensorDetailPanel extends Autodesk.Viewing.UI.DockingPanel {
    constructor(viewer, id, title, options) {
        super(viewer.container, id, title, options);
        this.container.style.left = ((options === null || options === void 0 ? void 0 : options.x) || 0) + 'px';
        this.container.style.top = ((options === null || options === void 0 ? void 0 : options.y) || 0) + 'px';
        this.container.style.width = ((options === null || options === void 0 ? void 0 : options.width) || 500) + 'px';
        this.container.style.height = ((options === null || options === void 0 ? void 0 : options.height) || 400) + 'px';
        this.container.style.resize = 'none';
        this._charts = [];
        this._lastHighlightedPointIndex = -1;
    }
    initialize() {
        this.title = this.createTitleBar(this.titleLabel || this.container.id);
        this.initializeMoveHandlers(this.title);
        this.container.appendChild(this.title);
        this.container.style.height = '350px';
        this.content = document.createElement('div');
        this.content.style.height = '300px';
        this.content.style.backgroundColor = '#333';
        this.content.style.opacity = 0.9;
        this.container.appendChild(this.content);
    }
    updateCharts(sensorId, dataView) {
        this.content.innerHTML = '';
        this._charts = [];
        const chartHeight = 200;
        let contentHeight = 0;
        let canvases = [];
        for (const [channelId, channel] of dataView.getChannels().entries()) {
            contentHeight += chartHeight;
            const top = 50 + canvases.length * chartHeight;
            canvases.push(`<canvas id="sensor-detail-chart-${channelId}" style="position: absolute; left: 0; top: ${top}px; width: 100%; height: ${chartHeight}px;"></canvas>`);
        }
        this.content.style.height = `${contentHeight}px`;
        this.container.style.height = `${contentHeight + 50}px`;
        this.content.innerHTML = canvases.join('\n');
        for (const [channelId, channel] of dataView.getChannels().entries()) {
            const canvas = document.getElementById(`sensor-detail-chart-${channelId}`);
            const samples = dataView.getSamples(sensorId, channelId);
            this._charts.push(this._createChart(canvas, (samples === null || samples === void 0 ? void 0 : samples.timestamps) || [], (samples === null || samples === void 0 ? void 0 : samples.values) || [], channel.min, channel.max, `${channel.name} (${channel.unit})`));
        }
    }
    _createChart(canvas, timestamps, values, min, max, title) {
        // @ts-ignore
        return new Chart(canvas.getContext('2d'), {
            type: 'line',
            data: {
                labels: timestamps.map(timestamp => timestamp.toLocaleDateString()),
                datasets: [{
                        label: title,
                        data: values,
                        radius: values.map(_ => 3),
                        fill: false,
                        borderColor: '#eee',
                        // @ts-ignore
                        color: '#eee',
                        tension: 0.1
                    }],
                options: {
                    scales: {
                        y: { min, max }
                    }
                }
            }
        });
    }
    updateCursor(sensorId, dataView, currentTime) {
        const defaultChannelID = dataView.getChannels().keys().next().value;
        if (!defaultChannelID) {
            return;
        }
        const samples = dataView.getSamples(sensorId, defaultChannelID);
        if (!samples) {
            return;
        }
        const sampleIndex = findNearestTimestampIndex(samples.timestamps, currentTime);
        if (sampleIndex !== this._lastHighlightedPointIndex) {
            for (const chart of this._charts) {
                // @ts-ignore
                const radii = chart.data.datasets[0].radius;
                for (let i = 0; i < radii.length; i++) {
                    radii[i] = (i === sampleIndex) ? 9 : 3;
                }
                chart.update();
            }
            this._lastHighlightedPointIndex = sampleIndex;
        }
    }
}
