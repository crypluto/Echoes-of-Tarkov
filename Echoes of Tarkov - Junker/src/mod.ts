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


	public postDBLoad(container: DependencyContainer): void {
		this.ref.postDBLoad(container)
		const traderConfig: ITraderConfig = this.ref.configServer.getConfig<ITraderConfig>(ConfigTypes.TRADER)
		const traderUtils = new TraderUtils()
		const traderData = new TraderData(traderConfig, this.ref, traderUtils)


		traderData.pushTrader()
		this.ref.tables.traders[baseJson._id].questassort = questAssort;

		traderData.addTraderToLocales(this.ref.tables,
			baseJson.name, "Junker",
			baseJson.nickname,
			baseJson.location,
			"A blunt, sardonic former trauma surgeon turned black market medical trader, Junker uses his unmatched skills and sharp wit to keep the desperate alive in the ruins of Tarkov—for a price."
		)

		console.log(`\x1b[94m[Echoes of Tarkov] \x1b[93m Junker Loaded       | Get me some fucking vodka you knob`
		)
	}
}

module.exports = { mod: new TraderTemplate() }
