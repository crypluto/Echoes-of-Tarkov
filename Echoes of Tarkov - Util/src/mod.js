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
const LogTextColor_1 = require("C:/snapshot/project/obj/models/spt/logging/LogTextColor");
class BGReplace {
    postDBLoad(container) {
        const imageRouter = container.resolve("ImageRouter");
        const logger = container.resolve("WinstonLogger");
        const options = [
            { filename: "bg.png", weight: 40 },
            { filename: "bg_alt_wood.png", weight: 40 },
            { filename: "title-card.png", weight: 10 }
        ];
        // Compute total weight
        const totalWeight = options.reduce((sum, option) => sum + option.weight, 0);
        // Generate weighted random choice
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
        const selectedPath = path.resolve(__dirname, "res", selectedFile);
        if (fs.existsSync(selectedPath)) {
            logger.log(`Overriding launcher background with randomly selected: ${selectedFile}`, LogTextColor_1.LogTextColor.MAGENTA);
            imageRouter.addRoute("/files/launcher/bg", selectedPath);
        }
        else {
            logger.warning(`Selected background not found: ${selectedPath}`);
        }
        console.log(`\x1b[94m[Echoes of Tarkov] \x1b[93m Loaded              | \x1b[91mA\x1b[0m\x1b[93m \x1b[0m\x1b[92mM\x1b[0m\x1b[96mo\x1b[0m\x1b[94md\x1b[0m\x1b[95m \x1b[0m\x1b[91mb\x1b[0m\x1b[93my\x1b[0m\x1b[92m \x1b[0m\x1b[96mR\x1b[0m\x1b[94mh\x1b[0m\x1b[95me\x1b[0m\x1b[91md\x1b[0m\x1b[93d\x1b[0m\x1b[92mE\x1b[0m\x1b[96ml\x1b[0m\x1b[94mB\x1b[0m\x1b[95mo\x1b[0m\x1b[91mz\x1b[0m\x1b[93mo\x1b[0m\x1b[92m,\x1b[0m \x1b[96mE\x1b[0m\x1b[94mu\x1b[0m\x1b[95mk\x1b[0m\x1b[91my\x1b[0m\x1b[93mr\x1b[0m\x1b[92me\x1b[0m\x1b[96m,\x1b[0m \x1b[94ma\x1b[0m\x1b[95mn\x1b[0m\x1b[91md\x1b[0m \x1b[93mP\x1b[0m\x1b[92mi\x1b[0m\x1b[96mg\x1b[0m\x1b[94me\x1b[0m\x1b[95mo\x1b[0m\x1b[91mn\x1b[0m`);
    }
}
module.exports = { mod: new BGReplace() };
//# sourceMappingURL=mod.js.map