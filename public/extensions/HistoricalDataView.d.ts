export declare type SensorID = string;
export declare type ChannelID = string;
export declare type ChannelDataType = 'double';
/**
 * IoT sensor description.
 */
export interface Sensor {
    /** Sensor display name. */
    name: string;
    /** Optional sensor description. */
    description?: string;
    /** Optional group the sensor belongs to. */
    groupName?: string;
    /** Sensor location. */
    location: {
        x: number;
        y: number;
        z: number;
    };
    /** Optional ID of object to be shaded with heatmaps. */
    objectId?: number;
}
/**
 * IoT sensor channel description.
 */
export interface Channel {
    /** Sensor channel display name. */
    name: string;
    /** Sensor channel description. */
    description?: string;
    /** Sensor channel data type. */
    type: ChannelDataType;
    /** Sensor channel data unit. */
    unit: string;
    /** Sensor channel minimum data value. */
    min: number;
    /** Sensor channel maximum data value. */
    max: number;
}
/**
 * Collection of historical data for specific sensor and channel.
 */
export interface Samples {
    /** Number of data samples. */
    count: number;
    timestamps: Date[];
    /** Data sample values. */
    values: number[];
}
/**
 * Subset of historical data for specific sensors, channels, and timerange.
 */
export interface HistoricalDataView {
    /**
     * Gets the map of sensors available in this data view, indexed by their IDs.
     */
    getSensors(): Readonly<Map<SensorID, Sensor>>;
    /**
     * Gets the map of channels available in this data view, indexed by their IDs.
     */
    getChannels(): Readonly<Map<ChannelID, Channel>>;
    /**
     * Gets the timerange captured by this data view.
     */
    getTimerange(): [Date, Date];
    /**
     * Gets the data samples for specific sensor and channel in this data view.
     * @param sensorId Target sensor ID.
     * @param channelId Target channel ID.
     */
    getSamples(sensorId: SensorID, channelId: ChannelID): Readonly<Samples> | undefined;
}
/**
 * Helper method for searching through list of timestamps for an entry
 * that is closest to the provided target timestamp.
 * @param list List of timestamps.
 * @param timestamp Target timestamp to locate in the list.
 * @param fractional If the target timestamp is "between" two timestamps in the list,
 * return a corresponding fractional number instead of just an index.
 * @returns Index of the closest timestamp in the list, or a fractional number.
 */
export declare function findNearestTimestampIndex(list: Date[], timestamp: Date, fractional?: boolean): number;
