/// import * as Autodesk from "@types/forge-viewer";
/// import * as Chart from "@types/chart.js";

class SensorDetailExtension extends BaseExtension {
    constructor(viewer, options) {
        super(viewer, options);
        this.panel = null;
    }

    onDataChange({ sensors, historicalData, currentSensorID, currentChannelID, currentTimestamp }) {
        // TODO: only update what needs to be updated
        if (sensors || historicalData || currentSensorID) {
            if (this._sensors && this._historicalData && this._currentSensorID) {
                const sensor = this._sensors.get(this._currentSensorID);
                const data = this._historicalData.get(this._currentSensorID);
                this.panel.updateData(sensor, data);
                this.panel.setTitle(`Sensor Detail (${sensor.name})`);
            }
        }
        if (currentTimestamp) {
            const data = this._historicalData.get(this._currentSensorID);
            this.panel.updateTimestamp(data, this._currentTimestamp);
        }
    }

    async load() {
        await super.load();
        this.panel = new SensorDetailPanel(this.viewer, 'sensor-detail', 'Sensor Detail');
        console.log('IoT.SensorDetail extension loaded.');
        return true;
    }

    unload() {
        super.unload();
        this.panel.uninitialize();
        this.panel = null;
        console.log('IoT.SensorDetail extension unloaded.');
        return true;
    }

    activate() {
        super.activate();
        this.panel.setVisible(true);
    }

    deactivate() {
        super.deactivate();
        this.panel.setVisible(false);
    }

    onToolbarCreated() {
        this._createToolbarUI('iot-sensor-detail-btn', 'IoT Sensor Detail', 'https://img.icons8.com/ios-filled/50/000000/show-property.png'); // <a href="https://icons8.com/icon/10255/show-property">Show Property icon by Icons8</a>
    }
}

class SensorDetailPanel extends Autodesk.Viewing.UI.DockingPanel {
    constructor(viewer, id, title, options) {
        super(viewer.container, id, title, options);
        this.viewer = viewer;
        this.container.style.left = (options?.x || 0) + 'px';
        this.container.style.top = (options?.y || 0) + 'px';
        this.container.style.width = (options?.width || 500) + 'px';
        this.container.style.height = (options?.height || 400) + 'px';
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

    updateTimestamp(data, timestamp) {
        const currentIndex = this._findNearestTimestampIndex(data.timestamps, timestamp);
        if (currentIndex !== this._lastHighlightedPointIndex) {
            for (const chart of this._charts) {
                const radii = chart.data.datasets[0].radius;
                for (let i = 0; i < radii.length; i++) {
                    radii[i] = (i === currentIndex) ? 9 : 3;
                }
                chart.update();
            }
            this._lastHighlightedPointIndex = currentIndex;
        }
    }

    /**
     * 
     * @param {Sensor?} sensor
     * @param {HistoricalData?} data
     */
    updateData(sensor, data) {
        this.content.innerHTML = '';
        this._charts = [];
        if (!sensor || !data) {
            return;
        }
        const numCharts = data.values.size;
        const chartHeight = 200;
        this.content.style.height = `${numCharts * chartHeight}px`;
        this.container.style.height = `${50 + numCharts * chartHeight}px`;
        let html = [];
        for (const channelId of data.values.keys()) {
            const top = 50 + html.length * chartHeight;
            html.push(`<canvas id="sensor-detail-chart-${channelId}" style="position: absolute; left: 0; top: ${top}px; width: 100%; height: ${chartHeight}px;"></canvas>`);
        }
        this.content.innerHTML = html.join('\n');
        for (const [channelId, values] of data.values.entries()) {
            const channel = sensor.model.channels.get(channelId);
            const canvas = document.getElementById(`sensor-detail-chart-${channelId}`);
            this._charts.push(this._createChart(canvas, data.timestamps, values, `${channel.name} (${channel.unit})`));
        }
    }

    _createChart(canvas, timestamps, values, title) {
        return new Chart(canvas.getContext('2d'), {
            type: 'line', // See https://www.chartjs.org/docs/latest for all the supported types of charts
            data: {
                labels: timestamps.map(timestamp => timestamp.toLocaleDateString()),
                datasets: [{
                    label: title,
                    data: values,
                    radius: values.map(_ => 3),
                    fill: false,
                    borderColor: '#eee',
                    color: '#eee',
                    tension: 0.1
                }],
                options: {
                    maintainAspectRatio: false,
                }
            }
        });
    }

    _findNearestTimestampIndex(list, timestamp) {
        let start = 0;
        let end = list.length - 1;
        if (timestamp <= list[0]) {
            return 0;
        }
        if (timestamp >= list[end]) {
            return end;
        }
        while (end - start > 1) {
            let currentIndex = start + Math.floor(0.5 * (end - start));
            if (timestamp < list[currentIndex]) {
                end = currentIndex;
            } else {
                start = currentIndex;
            }
        }
        return (timestamp - list[start] < list[end] - timestamp) ? start : end;
    }
}

Autodesk.Viewing.theExtensionManager.registerExtension('IoT.SensorDetail', SensorDetailExtension);
