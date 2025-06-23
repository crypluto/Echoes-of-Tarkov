"use strict";
/* eslint-disable @typescript-eslint/naming-convention */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class BGReplace {
    configPath = path.resolve(__dirname, "..", "config", "config.json");
    config = {
        weatherPatchEnabled: true,
        debugLogging: false
    };
    printRainbowLog() {
        console.log(`\x1b[94m[Echoes of Tarkov] \x1b[93m Loaded              | \x1b[91mA\x1b[0m\x1b[93m \x1b[0m\x1b[92mM\x1b[0m\x1b[96mo\x1b[0m\x1b[94md\x1b[0m\x1b[95m \x1b[0m\x1b[91mb\x1b[0m\x1b[93my\x1b[0m\x1b[92m \x1b[0m\x1b[96mR\x1b[0m\x1b[94mh\x1b[0m\x1b[95me\x1b[0m\x1b[91md\x1b[0m\x1b[93md\x1b[0m\x1b[92mE\x1b[0m\x1b[96ml\x1b[0m\x1b[94mB\x1b[0m\x1b[95mo\x1b[0m\x1b[91mz\x1b[0m\x1b[93mo\x1b[0m\x1b[92m,\x1b[0m \x1b[96mE\x1b[0m\x1b[94mu\x1b[0m\x1b[95mk\x1b[0m\x1b[91my\x1b[0m\x1b[93mr\x1b[0m\x1b[92me\x1b[0m\x1b[96m,\x1b[0m \x1b[94ma\x1b[0m\x1b[95mn\x1b[0m\x1b[91md\x1b[0m \x1b[93mP\x1b[0m\x1b[92mi\x1b[0m\x1b[96mg\x1b[0m\x1b[94me\x1b[0m\x1b[95mo\x1b[0m\x1b[91mn\x1b[0m`);
    }
    postDBLoad(container) {
        this.printRainbowLog(); // Rainbow log now prints first
        const imageRouter = container.resolve("ImageRouter");
        const logger = container.resolve("WinstonLogger");
        this.loadConfig(logger);
        const debugLog = (msg) => {
            if (this.config.debugLogging) {
                logger.debug(`[Echoes of Tarkov] ${msg}`);
            }
        };
        const options = [
            { filename: "bg.png", weight: 10 },
            { filename: "bg_1.png", weight: 10 },
            { filename: "bg_2.png", weight: 10 },
            { filename: "bg_3.png", weight: 10 },
            { filename: "bg_4.png", weight: 10 },
            { filename: "bg_5.png", weight: 10 },
            { filename: "bg_6.png", weight: 10 },
            { filename: "bg_7.png", weight: 10 },
            { filename: "bg_8.png", weight: 10 },
            { filename: "bg_9.png", weight: 10 }
        ];
        const totalWeight = options.reduce((sum, option) => sum + option.weight, 0);
        const rand = Math.random() * totalWeight;
        let cumulative = 0;
        let selectedFile = "";
        for (const option of options) {
            cumulative += option.weight;
            if (rand < cumulative) {
                selectedFile = option.filename;
                break;
            }
        }
        const selectedPath = path.resolve(__dirname, "..", "res", selectedFile);
        if (fs.existsSync(selectedPath)) {
            console.log(`\x1b[94m[Echoes of Tarkov] \x1b[93m Utility             | Overriding launcher background with ${selectedFile}`);
            imageRouter.addRoute("/files/launcher/bg", selectedPath);
        }
        else {
            logger.warning(`Selected background not found: ${selectedPath}`);
        }
        const db = container.resolve("DatabaseServer");
        const tables = db.getTables();
        const botTypes = tables.bots.types;
        const customNames = ["RheddElBozo", "Pigeon", "Pijinski", "eukyre"];
        const factions = ["usec", "bear"];
        for (const faction of factions) {
            const botType = botTypes[faction];
            if (botType?.firstName) {
                for (const name of customNames) {
                    if (!botType.firstName.includes(name)) {
                        botType.firstName.push(name);
                    }
                }
                debugLog(`Added custom ${faction.toUpperCase()} names: ${customNames.join(", ")}`);
            }
            else {
                logger.warning(`Could not find ${faction} firstName array.`);
            }
        }
        if (tables.globals?.config?.RagFair) {
            const oldLevel = tables.globals.config.RagFair.minUserLevel;
            tables.globals.config.RagFair.minUserLevel = 30;
            debugLog(`Raised Ragfair min level from ${oldLevel} to 30`);
        }
        else {
            logger.warning("Could not locate config.RagFair.minUserLevel in globals.");
        }
        if (!this.config.weatherPatchEnabled) {
            debugLog("Weather patch disabled via config.");
            return;
        }
        const weatherPath = this.findWeatherJson(__dirname);
        if (!weatherPath) {
            logger.error("Could not find weather.json in any parent directory.");
            return;
        }
        const weatherData = JSON.parse(fs.readFileSync(weatherPath, "utf-8"));
        const presets = [
            {
                name: "hurricane",
                weight: 50,
                apply: (seasonConfig) => {
                    seasonConfig.clouds.weights = seasonConfig.clouds.values.map((_, i, arr) => i === arr.length - 1 ? 1 : 0);
                    seasonConfig.rain.weights = seasonConfig.rain.values.map((_, i, arr) => i === arr.length - 1 ? 1 : 0);
                    seasonConfig.fog.weights = seasonConfig.fog.values.map((_, i, arr) => i === arr.length - 1 ? 1 : 0);
                    seasonConfig.windSpeed.values = [0, 1, 2, 3, 4, 5, 6];
                    seasonConfig.windSpeed.weights = [0, 0, 0, 0, 0, 0, 1];
                }
            },
            {
                name: "ClearSkies",
                weight: 20,
                apply: (seasonConfig) => {
                    seasonConfig.clouds.weights = seasonConfig.clouds.values.map((_, i) => i === 0 ? 1 : 0);
                    seasonConfig.rain.weights = seasonConfig.rain.values.map(() => 0);
                    seasonConfig.fog.weights = seasonConfig.fog.values.map(() => 0);
                    seasonConfig.windSpeed.values = [0, 1, 2, 3, 4];
                    seasonConfig.windSpeed.weights = [1, 0, 0, 0, 0];
                }
            },
            {
                name: "LightRain",
                weight: 15,
                apply: (seasonConfig) => {
                    seasonConfig.clouds.weights = seasonConfig.clouds.values.map((_, i) => i === seasonConfig.clouds.values.length - 2 ? 1 : 0);
                    seasonConfig.rain.weights = seasonConfig.rain.values.map((_, i) => i === 0 ? 1 : 0);
                    seasonConfig.fog.weights = seasonConfig.fog.values.map((_, i) => i === 1 ? 1 : 0);
                    seasonConfig.windSpeed.values = [0, 1, 2, 3, 4];
                    seasonConfig.windSpeed.weights = [0, 1, 0, 0, 0];
                }
            },
            {
                name: "HeavyWind",
                weight: 15,
                apply: (seasonConfig) => {
                    seasonConfig.clouds.weights = seasonConfig.clouds.values.map((_, i) => i === seasonConfig.clouds.values.length - 2 ? 1 : 0);
                    seasonConfig.rain.weights = seasonConfig.rain.values.map(() => 0);
                    seasonConfig.fog.weights = seasonConfig.fog.values.map((_, i) => i === 2 ? 1 : 0);
                    seasonConfig.windSpeed.values = [0, 1, 2, 3, 4, 5, 6];
                    seasonConfig.windSpeed.weights = [0, 0, 0, 0, 0, 1, 0];
                }
            }
        ];
        const totalPresetWeight = presets.reduce((sum, p) => sum + p.weight, 0);
        let presetRand = Math.random() * totalPresetWeight;
        let selectedPreset = null;
        for (const p of presets) {
            if (presetRand < p.weight) {
                selectedPreset = p;
                break;
            }
            presetRand -= p.weight;
        }
        if (!selectedPreset) {
            selectedPreset = presets[0];
        }
        console.log(`\x1b[94m[Echoes of Tarkov] \x1b[93m Utility             | Applying weather preset: ${selectedPreset.name}`);
        for (const season in weatherData.weather.seasonValues) {
            selectedPreset.apply(weatherData.weather.seasonValues[season]);
        }
        fs.writeFileSync(weatherPath, JSON.stringify(weatherData, null, 4));
        debugLog("Weather config patched.");
    }
    findWeatherJson(startDir) {
        let dir = startDir;
        for (let i = 0; i < 10; i++) {
            const testPath = path.join(dir, "SPT_Data", "Server", "configs", "weather.json");
            if (fs.existsSync(testPath)) {
                return testPath;
            }
            const parent = path.dirname(dir);
            if (parent === dir)
                break;
            dir = parent;
        }
        return null;
    }
    loadConfig(logger) {
        if (fs.existsSync(this.configPath)) {
            try {
                const raw = fs.readFileSync(this.configPath, "utf-8");
                const parsed = JSON.parse(raw);
                this.config.weatherPatchEnabled = parsed.weatherPatchEnabled ?? true;
                this.config.debugLogging = parsed.debugLogging ?? false;
                if (this.config.debugLogging) {
                    logger.debug("[Echoes of Tarkov] Config loaded: weatherPatchEnabled=" + this.config.weatherPatchEnabled + ", debugLogging=" + this.config.debugLogging);
                }
            }
            catch (e) {
                logger.error("[Echoes of Tarkov] Failed to parse config.json, using defaults.");
            }
        }
        else {
            logger.warning("[Echoes of Tarkov] Config file not found at " + this.configPath + ", using defaults.");
        }
    }
}
module.exports = { mod: new BGReplace() };
//# sourceMappingURL=mod.js.map