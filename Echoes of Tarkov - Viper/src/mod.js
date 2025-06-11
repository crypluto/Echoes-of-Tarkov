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
    lockPeaceKeeper(database) {
        const traders = database.traders;
        const peaceKeeper = traders["5935c25fb3acc3127c3d8cd9"].base;
        peaceKeeper.unlockedByDefault = false;
    }
    lockPrapor(database) {
        const traders = database.traders;
        const prapor = traders["54cb50c76803fa8b248b4571"].base;
        prapor.unlockedByDefault = false;
    }
    lockTherapist(database) {
        const traders = database.traders;
        const therapist = traders["54cb57776803fa99248b456e"].base;
        therapist.unlockedByDefault = false;
    }
    lockSkier(database) {
        const traders = database.traders;
        const skier = traders["58330581ace78e27b8b10cee"].base;
        skier.unlockedByDefault = false;
    }
    lockMechanic(database) {
        const traders = database.traders;
        const mechanic = traders["5a7c2eca46aef81a7ca2145d"].base;
        mechanic.unlockedByDefault = false;
    }
    lockRagman(database) {
        const traders = database.traders;
        const Ragman = traders["5ac3b934156ae10c4430e83c"].base;
        Ragman.unlockedByDefault = false;
    }
    postDBLoad(container) {
        this.ref.postDBLoad(container);
        const traderConfig = this.ref.configServer.getConfig(ConfigTypes_1.ConfigTypes.TRADER);
        const traderUtils = new Utils_1.TraderUtils();
        const traderData = new TraderTemplate_1.TraderData(traderConfig, this.ref, traderUtils);
        this.lockPrapor(this.ref.tables);
        this.lockMechanic(this.ref.tables);
        this.lockRagman(this.ref.tables);
        this.lockTherapist(this.ref.tables);
        this.lockSkier(this.ref.tables);
        this.lockPeaceKeeper(this.ref.tables);
        traderData.pushTrader();
        this.ref.tables.traders[baseJson._id].questassort = questAssort;
        traderData.addTraderToLocales(this.ref.tables, baseJson.name, "Viper", baseJson.nickname, baseJson.location, "Christopher “Viper” Odenkirk, a former BORTAC officer from El Paso, was dishonorably discharged and sentenced to 10 years in prison after killing a surrendering mall shooter in a fit of rage. While incarcerated, he was recruited by a United Security-linked guard who saw potential in his service record and offered him a role as a hired gun. Taking the name “Viper,” he joined an elite USEC unit known as The Goons, carrying out covert and violent operations with a cold, goal-driven mindset.");
        console.log(`\x1b[94m[Echoes of Tarkov] \x1b[93m Viper Loaded        | When you get to hell, tell em Viper sent you`);
    }
}
module.exports = { mod: new TraderTemplate() };
//# sourceMappingURL=mod.js.map