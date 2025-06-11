import { DependencyContainer } from "tsyringe"
import { IDatabaseTables } from "@spt/models/spt/server/IDatabaseTables"

import { IPreSptLoadMod } from "@spt/models/external/IPreSptLoadMod"
import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod"
import { ConfigTypes } from "@spt/models/enums/ConfigTypes"
import { ITraderConfig } from "@spt/models/spt/config/ITraderConfig"
import { Traders } from "@spt/models/enums/Traders"
import { References } from "./Refs/References"
import { TraderData } from "./Trader/TraderTemplate"
import { TraderUtils } from "./Refs/Utils"

import * as baseJson from "../db/base.json"
import * as questAssort from "../db/questassort.json";


class TraderTemplate implements IPreSptLoadMod, IPostDBLoadMod {
	private ref: References = new References()

	constructor() { }

	public preSptLoad(container: DependencyContainer): void {
		this.ref.preSptLoad(container)
		const ragfair = this.ref.configServer.getConfig(ConfigTypes.RAGFAIR)
		const traderConfig: ITraderConfig = this.ref.configServer.getConfig<ITraderConfig>(ConfigTypes.TRADER)
		const traderUtils = new TraderUtils()
		const traderData = new TraderData(traderConfig, this.ref, traderUtils)

		traderData.registerProfileImage()
		traderData.setupTraderUpdateTime()

		Traders[baseJson._id] = baseJson._id
		ragfair.traders[baseJson._id] = true
	}
	public lockPeaceKeeper(database: IDatabaseTables): void {
		const traders = database.traders;
		const peaceKeeper = traders["5935c25fb3acc3127c3d8cd9"].base;
		peaceKeeper.unlockedByDefault = false;
	} public lockPrapor(database: IDatabaseTables): void {
		const traders = database.traders;
		const prapor = traders["54cb50c76803fa8b248b4571"].base;
		prapor.unlockedByDefault = false;
	} public lockTherapist(database: IDatabaseTables): void {
		const traders = database.traders;
		const therapist = traders["54cb57776803fa99248b456e"].base;
		therapist.unlockedByDefault = false;
	}public lockSkier(database: IDatabaseTables): void {
		const traders = database.traders;
		const skier = traders["58330581ace78e27b8b10cee"].base;
		skier.unlockedByDefault = false;
	} public lockMechanic(database: IDatabaseTables): void {
		const traders = database.traders;
		const mechanic = traders["5a7c2eca46aef81a7ca2145d"].base;
		mechanic.unlockedByDefault = false;
	} public lockRagman(database: IDatabaseTables): void {
		const traders = database.traders;
		const Ragman = traders["5ac3b934156ae10c4430e83c"].base;
		Ragman.unlockedByDefault = false;
	}

	public postDBLoad(container: DependencyContainer): void {
		this.ref.postDBLoad(container)
		const traderConfig: ITraderConfig = this.ref.configServer.getConfig<ITraderConfig>(ConfigTypes.TRADER)
		const traderUtils = new TraderUtils()
		const traderData = new TraderData(traderConfig, this.ref, traderUtils)
		this.lockPrapor(this.ref.tables);
		this.lockMechanic(this.ref.tables);
		this.lockRagman(this.ref.tables);
		this.lockTherapist(this.ref.tables);
		this.lockSkier(this.ref.tables);
		this.lockPeaceKeeper(this.ref.tables);

		traderData.pushTrader()
		this.ref.tables.traders[baseJson._id].questassort = questAssort;

		traderData.addTraderToLocales(this.ref.tables,
			baseJson.name, "Viper",
			baseJson.nickname,
			baseJson.location,
			"Christopher “Viper” Odenkirk, a former BORTAC officer from El Paso, was dishonorably discharged and sentenced to 10 years in prison after killing a surrendering mall shooter in a fit of rage. While incarcerated, he was recruited by a United Security-linked guard who saw potential in his service record and offered him a role as a hired gun. Taking the name “Viper,” he joined an elite USEC unit known as The Goons, carrying out covert and violent operations with a cold, goal-driven mindset."
		)

		console.log(`\x1b[94m[Echoes of Tarkov] \x1b[93m Viper Loaded        | When you get to hell, tell em Viper sent you`
		)
	}
}

module.exports = { mod: new TraderTemplate() }
