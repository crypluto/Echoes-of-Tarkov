"use strict";
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
const ConfigTypes_1 = require("C:/snapshot/project/obj/models/enums/ConfigTypes");
const Traders_1 = require("C:/snapshot/project/obj/models/enums/Traders");
const References_1 = require("./Refs/References");
const TraderTemplate_1 = require("./Trader/TraderTemplate");
const Utils_1 = require("./Refs/Utils");
const baseJson = __importStar(require("../db/base.json"));
const questAssort = __importStar(require("../db/questassort.json"));
class TraderTemplate {
    ref = new References_1.References();
    constructor() { }
    preSptLoad(container) {
        this.ref.preSptLoad(container);
        const ragfair = this.ref.configServer.getConfig(ConfigTypes_1.ConfigTypes.RAGFAIR);
        const traderConfig = this.ref.configServer.getConfig(ConfigTypes_1.ConfigTypes.TRADER);
        const traderUtils = new Utils_1.TraderUtils();
        const traderData = new TraderTemplate_1.TraderData(traderConfig, this.ref, traderUtils);
        traderData.registerProfileImage();
        traderData.setupTraderUpdateTime();
        Traders_1.Traders[baseJson._id] = baseJson._id;
        ragfair.traders[baseJson._id] = true;
    }
    postDBLoad(container) {
        this.ref.postDBLoad(container);
        const traderConfig = this.ref.configServer.getConfig(ConfigTypes_1.ConfigTypes.TRADER);
        const traderUtils = new Utils_1.TraderUtils();
        const traderData = new TraderTemplate_1.TraderData(traderConfig, this.ref, traderUtils);
        traderData.pushTrader();
        this.ref.tables.traders[baseJson._id].questassort = questAssort;
        traderData.addTraderToLocales(this.ref.tables, baseJson.name, "Junker", baseJson.nickname, baseJson.location, "A blunt, sardonic former trauma surgeon turned black market medical trader, Junker uses his unmatched skills and sharp wit to keep the desperate alive in the ruins of Tarkov—for a price.");
        console.log(`\x1b[94m[Echoes of Tarkov] \x1b[93m Junker Loaded       | Get me some fucking vodka you knob`);
    }
}
module.exports = { mod: new TraderTemplate() };
//# sourceMappingURL=mod.js.map