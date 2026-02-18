/**
 * REAPER Plugin Parameter Mapping System
 * Allows dynamic definition of OSC paths and parameter indexes.
 */

export interface ParamMapping {
    path: string;       // OSC Path: /fxparam
    track: number;      // Current Track index
    fx: number;         // FX Slot (usually 1-indexed)
    paramIndex: number; // Parameter ID in Reaper
    label: string;      // Human-readable label
}

export interface PluginDefinition {
    name: string;
    parameters: {
        [key: string]: number; // Maps local label to Reaper param index
    };
}

export const PluginMap: Record<string, PluginDefinition> = {
    "ReaEQ": {
        name: "ReaEQ",
        parameters: {
            "band1_freq": 0,
            "band1_gain": 1,
            "band1_q": 2,
            "band2_freq": 3,
            "band2_gain": 4,
            "band2_q": 5,
            "band3_freq": 6,
            "band3_gain": 7,
            "band3_q": 8,
            "band4_freq": 9,
            "band4_gain": 10,
            "band4_q": 11,
        }
    }
};

/**
 * Resolves a parameter index for a given plugin and key.
 */
export const resolveParamIndex = (pluginName: string, paramKey: string): number | null => {
    const plugin = PluginMap[pluginName];
    if (!plugin) return null;
    return plugin.parameters[paramKey] ?? null;
};
