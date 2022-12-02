/// import * as Autodesk from "@types/forge-viewer";
export class SensorHeatmapsPanel extends Autodesk.Viewing.UI.DockingPanel {
    constructor(viewer, id, title, options) {
        super(viewer.container, id, title, options);
        this.container.style.left = ((options === null || options === void 0 ? void 0 : options.x) || 0) + 'px';
        this.container.style.top = ((options === null || options === void 0 ? void 0 : options.y) || 0) + 'px';
        this.container.style.width = '300px';
        this.container.style.height = '150px';
        this.container.style.resize = 'none';
    }
    initialize() {
        this.title = this.createTitleBar(this.titleLabel || this.container.id);
        this.initializeMoveHandlers(this.title);
        this.container.appendChild(this.title);
        this.content = document.createElement('div');
        this.content.style.height = '100px';
        this.content.style.backgroundColor = '#333';
        this.content.style.color = '#eee';
        this.content.style.opacity = 0.9;
        this.content.innerHTML = `
            <div style="height: 50px; padding: 1em; box-sizing: border-box;">
                <label>Channel</label>
                <select id="iot-heatmap-channel">
                </select>
            </div>
            <div style="height: 50px">
                <canvas id="iot-heatmap-legend" width="300" height="50"></canvas>
            </div>
        `;
        this.container.appendChild(this.content);
        this.dropdown = document.getElementById('iot-heatmap-channel');
        this.canvas = document.getElementById('iot-heatmap-legend');
    }
    updateChannels(dataView) {
        if (!this.dropdown) {
            return;
        }
        this.dropdown.innerHTML = '';
        for (const [channelId, channel] of dataView.getChannels().entries()) {
            const option = document.createElement('option');
            option.value = channelId;
            option.innerText = channel.name;
            this.dropdown.appendChild(option);
        }
        this.dropdown.onchange = () => this.onDropdownChanged(dataView);
        this.onDropdownChanged(dataView);
    }
    onDropdownChanged(dataView) {
        if (!this.dropdown) {
            return;
        }
        const channel = dataView.getChannels().get(this.dropdown.value);
        if (!channel) {
            return;
        }
        const labels = [
            `${channel.min.toFixed(2)}${channel.unit}`,
            `${((channel.max + channel.min) / 2).toFixed(2)}${channel.unit}`,
            `${channel.max.toFixed(2)}${channel.unit}`
        ];
        const colorStops = ['blue', 'green', 'yellow', 'red']; // Default color stops of the DataViz heatmap extension
        this.updateLegend(labels, colorStops);
        if (this.onChannelChanged) {
            this.onChannelChanged(this.dropdown.value);
        }
    }
    updateLegend(labels, colorStops) {
        if (!this.canvas) {
            return;
        }
        const context = this.canvas.getContext('2d');
        let i, len;
        context.clearRect(0, 0, 300, 50);
        context.fillStyle = 'white';
        for (i = 0, len = labels.length; i < len; i++) {
            let x = 10 + 280 * i / (len - 1);
            if (i === len - 1) {
                x -= context.measureText(labels[i]).width;
            }
            else if (i > 0) {
                x -= 0.5 * context.measureText(labels[i]).width;
            }
            context.fillText(labels[i], x, 10);
        }
        const gradient = context.createLinearGradient(0, 0, 300, 0);
        for (i = 0, len = colorStops.length; i < len; i++) {
            gradient.addColorStop(i / (len - 1), colorStops[i]);
        }
        context.fillStyle = gradient;
        context.fillRect(10, 20, 280, 20);
    }
}
