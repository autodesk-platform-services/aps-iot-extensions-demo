/// import * as Autodesk from "@types/forge-viewer";
/// import * as Chart from "@types/chart.js";

class SensorDetailExtension extends BaseExtension {
    constructor(viewer, options) {
        super(viewer, options);
        this.panel = null;
        this.updateCharts = this.updateCharts.bind(this);
        this.updateCursor = this.updateCursor.bind(this);
    }

    onDataViewChanged(oldDataView, newDataView) {
        if (oldDataView) {
            oldDataView.removeEventListener(DataViewEvents.SENSORS_CHANGED, this.updateCharts);
            oldDataView.removeEventListener(DataViewEvents.HISTORICAL_DATA_CHANGED, this.updateCharts);
        }
        if (newDataView) {
            newDataView.addEventListener(DataViewEvents.SENSORS_CHANGED, this.updateCharts);
            newDataView.addEventListener(DataViewEvents.HISTORICAL_DATA_CHANGED, this.updateCharts);
        }
    }

    onCurrentTimeChanged(oldTime, newTime) {
        this.updateCursor();
    }

    onCurrentSensorChanged(oldSensorID, newSensorID) {
        this.updateCharts();
    }

    updateCharts() {
        const sensors = this.dataView.getSensors();
        const historicalData = this.dataView.getHistoricalData();
        const sensorID = this.currentSensorID || this.getDefaultSensorID();
        if (sensors && historicalData) {
            const sensor = sensors.get(sensorID);
            const data = historicalData.get(sensorID);
            this.panel.updateCharts(sensor, data);
            this.panel.setTitle(sensor ? `Sensor: ${sensor.name}` : 'Sensor Details');
        }
    }

    updateCursor() {
        const historicalData = this.dataView.getHistoricalData();
        const sensorID = this.currentSensorID || this.getDefaultSensorID();
        const sensorData = historicalData.get(sensorID);
        const sampleIndex = this.findNearestTimestampIndex(sensorData.timestamps, this.currentTime);
        this.panel.updateCursor(sampleIndex);
    }

    async load() {
        await super.load();
        this.panel = new SensorDetailPanel(this.viewer, 'iot-sensor-detail', 'Sensor Details');
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

    updateCursor(sampleIndex) {
        if (sampleIndex !== this._lastHighlightedPointIndex) {
            for (const chart of this._charts) {
                const radii = chart.data.datasets[0].radius;
                for (let i = 0; i < radii.length; i++) {
                    radii[i] = (i === sampleIndex) ? 9 : 3;
                }
                chart.update();
            }
            this._lastHighlightedPointIndex = sampleIndex;
        }
    }

    /**
     * 
     * @param {Sensor?} sensor
     * @param {HistoricalData?} data
     */
    updateCharts(sensor, data) {
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
}

Autodesk.Viewing.theExtensionManager.registerExtension('IoT.SensorDetail', SensorDetailExtension);
