/**
 * Helper method for searching through list of timestamps for an entry
 * that is closest to the provided target timestamp.
 * @param list List of timestamps.
 * @param timestamp Target timestamp to locate in the list.
 * @param fractional If the target timestamp is "between" two timestamps in the list,
 * return a corresponding fractional number instead of just an index.
 * @returns Index of the closest timestamp in the list, or a fractional number.
 */
export function findNearestTimestampIndex(list, timestamp, fractional = false) {
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
        }
        else {
            start = currentIndex;
        }
    }
    if (fractional && start < end) {
        // @ts-ignore
        return start + (timestamp - list[start]) / (list[end] - list[start]);
    }
    else {
        // @ts-ignore
        return (timestamp - list[start] < list[end] - timestamp) ? start : end;
    }
}
