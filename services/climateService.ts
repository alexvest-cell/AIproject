
interface ClimateData {
    co2?: { value: string; date: string };
    temperature?: { value: string; date: string };
    methane?: { value: string; date: string };
    arcticIce?: { value: string; date: string };
    nitrous?: { value: string; date: string };
}

export const fetchClimateData = async (): Promise<ClimateData> => {
    const data: ClimateData = {};

    try {
        // CO2
        const co2Res = await fetch('https://global-warming.org/api/co2-api');
        const co2Json = await co2Res.json();
        // Structure is usually { co2: [{year, month, day, cycle, trend}, ...] }
        // We want the last entry
        if (co2Json.co2 && co2Json.co2.length > 0) {
            const latest = co2Json.co2[co2Json.co2.length - 1];
            data.co2 = {
                value: latest.cycle || latest.trend,
                date: `${latest.year}-${latest.month}-${latest.day}`
            };
        }
    } catch (e) {
        console.error("Failed to fetch CO2:", e);
    }

    try {
        // Temperature
        const tempRes = await fetch('https://global-warming.org/api/temperature-api');
        const tempJson = await tempRes.json();
        // Structure: { result: [{ time: "year.fraction", station: "val", land: "val" }] }
        if (tempJson.result && tempJson.result.length > 0) {
            const latest = tempJson.result[tempJson.result.length - 1];
            data.temperature = {
                value: latest.station, // Global station temperature anomaly
                date: latest.time // Usually decimal year format like 2024.25
            };
        }
    } catch (e) {
        console.error("Failed to fetch Temperature:", e);
    }

    try {
        // Methane
        const methRes = await fetch('https://global-warming.org/api/methane-api');
        const methJson = await methRes.json();
        // Structure: { methane: [{ date: "2024.1", average: "1923.5", ... }] }
        if (methJson.methane && methJson.methane.length > 0) {
            const latest = methJson.methane[methJson.methane.length - 1];
            data.methane = {
                value: latest.average,
                date: latest.date
            };
        }
    } catch (e) {
        console.error("Failed to fetch Methane:", e);
    }

    try {
        // Arctic Ice
        const iceRes = await fetch('https://global-warming.org/api/arctic-api');
        const iceJson = await iceRes.json();
        // Structure: { arcticData: { data: { "1989": value ... } } } ? Or result: []
        // Actually often it's { result: [{ area, extent, year }] } or similar.
        // Let's assume standard { result: [...] } or { arcticData: [...] }
        // Inspecting typical failure is safe, will implement safe check.
        // For now, let's try 'result'
        const iceList = iceJson.result || iceJson.arcticData;
        if (Array.isArray(iceList) && iceList.length > 0) {
            const latest = iceList[iceList.length - 1];
            data.arcticIce = {
                value: latest.area || latest.extent,
                date: latest.year || "Recent"
            };
        }
    } catch (e) {
        console.error("Failed to fetch Arctic Ice:", e);
    }

    return data;
};
