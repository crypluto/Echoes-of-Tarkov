/* eslint-disable @typescript-eslint/naming-convention */
import type { NewItemFromCloneDetails } from "@spt/models/spt/mod/NewItemDetails";
import type { ConfigItem } from "./references/configConsts";
import { traderIDs } from "./references/configConsts";
import { currencyIDs } from "./references/configConsts";
import { inventorySlots } from "./references/configConsts";
import { ItemMap } from "./references/items";
import { ItemBaseClassMap } from "./references/itemBaseClasses";
import { ItemHandbookCategoryMap } from "./references/itemHandbookCategories";
import { LogTextColor } from "@spt/models/spt/logging/LogTextColor";
import fs from "node:fs";
import path from "node:path";
import type { WTTInstanceManager } from "./WTTInstanceManager";
import type { IDatabaseTables } from "@spt/models/spt/server/IDatabaseTables";
import type { ILocation } from "@spt/models/eft/common/ILocation";
import type { IPreset } from "@spt/models/eft/common/IGlobals";
import type { IItem } from "@spt/models/eft/common/tables/IItem";
import type { IInventory } from "@spt/models/eft/common/tables/IBotType";
import type { IProps } from "@spt/models/eft/common/tables/ITemplateItem";

export class CustomItemService {
    private instanceManager: WTTInstanceManager;

    public preSptLoad(instanceManager: WTTInstanceManager): void {
        this.instanceManager = instanceManager;
    }

    public postDBLoad(): void {
        const configPath = path.join(__dirname, "../db/Items");
        const configFiles = fs
            .readdirSync(configPath)
            .filter((file) => !file.includes("BaseItemReplacement"));

        let numItemsAdded = 0;

        for (const file of configFiles) {
            const filePath = path.join(configPath, file);

            try {
                const fileContents = fs.readFileSync(filePath, "utf-8");
                const config = JSON.parse(fileContents) as ConfigItem;

                for (const itemId in config) {
                    const itemConfig = config[itemId];

                    try {
                        const { exampleCloneItem, finalItemTplToClone } =
                            this.createExampleCloneItem(itemConfig, itemId);

                        if (this.instanceManager.debug) {
                            console.log(`Processing file: ${file}, Item ID: ${itemId}`);
                            console.log(
                                `Prefab Path: ${exampleCloneItem.overrideProperties?.Prefab.path}`
                            );
                        }

                        this.instanceManager.customItem.createItemFromClone(exampleCloneItem);

                        this.processStaticLootContainers(itemConfig, itemId);
                        this.processModSlots(itemConfig, finalItemTplToClone, itemId);
                        this.processInventorySlots(itemConfig, itemId);
                        this.processMasterySections(itemConfig, itemId);
                        this.processWeaponPresets(itemConfig, itemId);
                        this.processTraders(itemConfig, itemId);
                        this.addtoHallofFame(itemConfig, itemId);
                        this.addtoSpecialSlots(itemConfig, itemId);

                        numItemsAdded++;
                    } catch (itemError) {
                        console.error(`Error processing item ID: ${itemId} in file: ${file}`);
                        console.error(itemError);
                    }
                }
            } catch (fileError) {
                console.error(`Error processing config file: ${file}`);
                console.error(fileError);
            }
        }



        // Post-item processing (e.g., bot inventories, quest modifications)
        for (const file of configFiles) {
            const filePath = path.join(configPath, file);

            try {
                const fileContents = fs.readFileSync(filePath, "utf-8");
                const config = JSON.parse(fileContents) as ConfigItem;

                for (const itemId in config) {
                    const itemConfig = config[itemId];
                    this.processBotInventories(itemConfig, itemConfig.itemTplToClone, itemId);
                }
            } catch (fileError) {
                console.error(`Error processing bot inventories for file: ${file}`);
                console.error(fileError);
            }
        }
    }

    /**
   * Creates an example clone item with the provided item configuration and item ID.
   *
   * @param {any} itemConfig - The configuration of the item to clone.
   * @param {string} itemId - The ID of the item.
   * @return {{ exampleCloneItem: NewItemFromCloneDetails, finalItemTplToClone: string }} The created example clone item and the final item template to clone.
   */
    private createExampleCloneItem(
        itemConfig: ConfigItem[string],
        itemId: string
    ): {
        exampleCloneItem: NewItemFromCloneDetails;
        finalItemTplToClone: string;
    } {
        const itemTplToCloneFromMap =
            ItemMap[itemConfig.itemTplToClone] || itemConfig.itemTplToClone;
        const finalItemTplToClone = itemTplToCloneFromMap;

        const parentIdFromMap =
            ItemBaseClassMap[itemConfig.parentId] || itemConfig.parentId;
        const finalParentId = parentIdFromMap;

        const handbookParentIdFromMap =
            ItemHandbookCategoryMap[itemConfig.handbookParentId] ||
            itemConfig.handbookParentId;
        const finalHandbookParentId = handbookParentIdFromMap;

        const itemPrefabPath = `customItems/${itemId}.bundle`;

        const exampleCloneItem: NewItemFromCloneDetails = {
            itemTplToClone: finalItemTplToClone,
            overrideProperties: itemConfig.overrideProperties
                ? {
                    ...itemConfig.overrideProperties,
                    Prefab: {
                        path:
                            itemConfig.overrideProperties.Prefab?.path || itemPrefabPath,
                        rcid: ""
                    }
                }
                : undefined,
            parentId: finalParentId,
            newId: itemId,
            fleaPriceRoubles: itemConfig.fleaPriceRoubles,
            handbookPriceRoubles: itemConfig.handbookPriceRoubles,
            handbookParentId: finalHandbookParentId,
            locales: itemConfig.locales
        };
        if (this.instanceManager.debug) {
            console.log(`Cloning item ${finalItemTplToClone} for itemID: ${itemId}`);
        }
        return { exampleCloneItem, finalItemTplToClone };
    }

    /**
     * Adds an item to a static loot container with a given probability.
     *
     * @param {string} containerID - The ID of the loot container.
     * @param {string} itemToAdd - The item to add to the loot container.
     * @param {number} probability - The probability of the item being added.
     * @return {void} This function does not return anything.
     */
    private addToStaticLoot(
        containerID: string,
        itemToAdd: string,
        probability: number
    ): void {
        const locations = this.instanceManager.database.locations;

        for (const locationID in locations) {
            if (!Object.prototype.hasOwnProperty.call(locations, locationID)) {
                continue; // Skip invalid locations
            }

            const location: ILocation = locations[locationID];
            if (!location.staticLoot) {
                if (this.instanceManager.debug) {
                    console.warn(`Warning: No static loot found in location: ${locationID}`);
                }
                continue;
            }

            const staticLoot = location.staticLoot;
            if (!Object.prototype.hasOwnProperty.call(staticLoot, containerID)) {
                if (this.instanceManager.debug) {
                    console.log(`Error: Loot container ID ${containerID} not found in location: ${locationID}`);
                }
                continue;
            }

            const lootContainer = staticLoot[containerID];
            if (!lootContainer) {
                if (this.instanceManager.debug) {
                    console.log(`Error: Loot container ID ${containerID} is null in location: ${locationID}`);
                }
                continue;
            }

            const templateFromMap = ItemMap[itemToAdd];
            const finalTemplate = templateFromMap || itemToAdd;

            const newLoot = [
                {
                    tpl: finalTemplate,
                    relativeProbability: probability,
                },
            ];

            lootContainer.itemDistribution.push(...newLoot);
            if (this.instanceManager.debug) {
                console.log(`Added ${itemToAdd} to loot container: ${containerID} in location: ${locationID}`);
            }
        }
    }


    /**
   * Processes the static loot containers for a given item.
   *
   * @param {any} itemConfig - The configuration object for the item.
   * @param {string} itemId - The ID of the item.
   * @return {void} This function does not return a value.
   */
    private processStaticLootContainers(itemConfig: ConfigItem[string], itemId: string): void {
        if (itemConfig.addtoStaticLootContainers) {
            if (this.instanceManager.debug) {
                console.log("Processing static loot containers for item:", itemId);
            }
            if (Array.isArray(itemConfig.StaticLootContainers)) {
                if (this.instanceManager.debug) {
                    console.log("Adding item to multiple static loot containers:");
                }
                for (const container of itemConfig.StaticLootContainers) {
                    const staticLootContainer =
                        ItemMap[container.ContainerName] || container.ContainerName;

                    this.addToStaticLoot(
                        staticLootContainer,
                        itemId,
                        container.Probability
                    );

                    if (this.instanceManager.debug) {
                        console.log(
                            ` - Added to container '${staticLootContainer}' with probability ${container.Probability}`
                        );
                    }
                }
            }
            else {
                const staticLootContainer =
                    ItemMap[itemConfig.StaticLootContainers] ||
                    itemConfig.StaticLootContainers;
                this.addToStaticLoot(
                    staticLootContainer,
                    itemId,
                    itemConfig.Probability
                );
                if (this.instanceManager.debug) {
                    console.log(`Added to container '${staticLootContainer}' with probability ${itemConfig.Probability}`);
                }
            }
        }
    }

    /**
   * Processes the mod slots of an item.
   *
   * @param {any} itemConfig - The configuration of the item.
   * @param {string[]} finalItemTplToClone - The final item template to clone.
   * @param {string} itemId - The ID of the item.
   * @returns {void}
   */
    private processModSlots(
        itemConfig: ConfigItem[string],
        finalItemTplToClone: string,
        itemId: string
    ): void {
        const tables = this.instanceManager.database;

        const moddableItemWhitelistIds = Array.isArray(
            itemConfig.ModdableItemWhitelist
        )
            ? itemConfig.ModdableItemWhitelist.map((shortname) => ItemMap[shortname])
            : itemConfig.ModdableItemWhitelist
                ? [ItemMap[itemConfig.ModdableItemWhitelist]]
                : [];

        const moddableItemBlacklistIds = Array.isArray(
            itemConfig.ModdableItemBlacklist
        )
            ? itemConfig.ModdableItemBlacklist.map((shortname) => ItemMap[shortname])
            : itemConfig.ModdableItemBlacklist
                ? [ItemMap[itemConfig.ModdableItemBlacklist]]
                : [];

        const modSlots = Array.isArray(itemConfig.modSlot)
            ? itemConfig.modSlot
            : itemConfig.modSlot
                ? [itemConfig.modSlot]
                : [];

        const lowercaseModSlots = modSlots.map((modSlotName) =>
            modSlotName.toLowerCase()
        );

        if (itemConfig.addtoModSlots) {
            if (this.instanceManager.debug) {
                console.log("Processing mod slots for item:", itemId);
            }
            for (const parentItemId in tables.templates.items) {
                const parentItem = tables.templates.items[parentItemId];

                if (!parentItem._props.Slots) {
                    continue;
                }

                const isBlacklisted = moddableItemBlacklistIds.includes(parentItemId);
                const isWhitelisted = moddableItemWhitelistIds.includes(parentItemId);

                if (isBlacklisted) {
                    continue;
                }

                let addToModSlots = false;

                if (isWhitelisted && itemConfig.modSlot) {
                    addToModSlots = true;
                }
                else if (!isBlacklisted && itemConfig.modSlot) {
                    for (const modSlot of parentItem._props.Slots) {
                        if (
                            modSlot._props.filters?.[0].Filter.some((filterItem) =>
                                finalItemTplToClone.includes(filterItem)
                            )
                        ) {
                            if (lowercaseModSlots.includes(modSlot._name.toLowerCase())) {
                                addToModSlots = true;
                                break;
                            }
                        }
                    }
                }

                if (addToModSlots) {
                    for (const modSlot of parentItem._props.Slots) {
                        if (lowercaseModSlots.includes(modSlot._name.toLowerCase())) {
                            if (!modSlot._props.filters[0].Filter.includes(itemId) && modSlot._props.filters?.[0]?.Filter?.includes(finalItemTplToClone)) {
                                modSlot._props.filters[0].Filter.push(itemId);
                                if (this.instanceManager.debug) {
                                    console.log(`Successfully added item ${itemId} to the filter of mod slot ${modSlot._name} for parent item ${parentItemId}`);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    /**
   * Processes the inventory slots for a given item.
   *
   * @param {any} itemConfig - The configuration object for the item.
   * @param {string} itemId - The ID of the item.
   * @param {any} defaultInventorySlots - The default inventory slots.
   * @return {void} This function does not return a value.
   */
    private processInventorySlots(
        itemConfig: ConfigItem[string],
        itemId: string
    ): void {
        const tables = this.instanceManager.database;

        if (itemConfig.addtoInventorySlots) {
            if (this.instanceManager.debug) {
                console.log("Processing inventory slots for item:", itemId);
            }
            const defaultInventorySlots =
                tables.templates.items["55d7217a4bdc2d86028b456d"]._props.Slots;

            const allowedSlots = Array.isArray(itemConfig.addtoInventorySlots)
                ? itemConfig.addtoInventorySlots
                : [itemConfig.addtoInventorySlots];

            // Iterate over the slots and push the item into the filters per the config
            for (const slot of defaultInventorySlots) {
                const slotName = inventorySlots[slot._name];
                const slotId = Object.keys(inventorySlots).find(
                    (key) => inventorySlots[key] === slot._name
                );

                if (
                    allowedSlots.includes(slot._name) ||
                    allowedSlots.includes(slotName) ||
                    allowedSlots.includes(slotId)
                ) {
                    if (!slot._props.filters[0].Filter.includes(itemId)) {
                        slot._props.filters[0].Filter.push(itemId);
                        if (this.instanceManager.debug) {
                            console.log(`Successfully added item ${itemId} to the filter of slot ${slot._name}`);
                        }
                    }
                }
            }
        }
    }

    /**
   * Processes the mastery sections for an item.
   *
   * @param {any} itemConfig - The configuration object for the item.
   * @param {string} itemId - The ID of the item.
   * @param {any} tables - The tables object containing global configuration.
   * @return {void} This function does not return a value.
   */
    private processMasterySections(
        itemConfig: ConfigItem[string],
        itemId: string
    ): void {
        const tables = this.instanceManager.database;
        if (itemConfig.masteries) {
            if (this.instanceManager.debug) {
                console.log("Processing mastery sections for item:", itemId);
            }
            const masterySections = Array.isArray(itemConfig.masterySections)
                ? itemConfig.masterySections
                : [itemConfig.masterySections];

            for (const mastery of masterySections) {
                const existingMastery = tables.globals.config.Mastering.find(
                    (existing) => existing.Name === mastery.Name
                );
                if (existingMastery) {
                    existingMastery.Templates.push(...mastery.Templates);
                    if (this.instanceManager.debug) {
                        console.log(` - Adding to existing mastery section for item: ${itemId}`);
                    }
                }
                else {
                    tables.globals.config.Mastering.push(mastery);
                    if (this.instanceManager.debug) {
                        console.log(` - Adding new mastery section for item: ${itemId}`);
                    }
                }
            }
        }
    }

    /**
   * Processes weapon presets based on the provided item configuration and tables.
   *
   * @param {any} itemConfig - The item configuration.
   * @return {void} This function does not return anything.
   */
    private processWeaponPresets(
        itemConfig: ConfigItem[string],
        itemId: string
    ): void {
        const tables = this.instanceManager.database;
        const { addweaponpreset, weaponpresets } = itemConfig;
        const itemPresets = tables.globals.ItemPresets;

        if (addweaponpreset) {
            if (this.instanceManager.debug) {
                console.log("Processing weapon presets for item:", itemId);
            }
            for (const presetData of weaponpresets) {
                const preset: IPreset = {
                    _changeWeaponName: presetData._changeWeaponName,
                    _encyclopedia: presetData._encyclopedia || undefined,
                    _id: presetData._id,
                    _items: presetData._items.map((itemData: IItem) => {
                        const item: IItem = {
                            _id: itemData._id,
                            _tpl: itemData._tpl
                        };

                        // Add parentId and slotId only if they are present in itemData
                        if (itemData.parentId) {
                            item.parentId = itemData.parentId;
                        }
                        if (itemData.slotId) {
                            item.slotId = itemData.slotId;
                        }

                        return item;
                    }),
                    _name: presetData._name,
                    _parent: presetData._parent,
                    _type: "Preset"
                };

                itemPresets[preset._id] = preset;

                if (this.instanceManager.debug) {
                    console.log(` - Added weapon preset: ${preset._name}`);
                    console.log(` - Preset: ${JSON.stringify(preset)}`);
                }
            }
        }
    }

    /**
   * Processes traders based on the item configuration.
   *
   * @param {any} itemConfig - The configuration of the item.
   * @param {string} itemId - The ID of the item.
   * @return {void} This function does not return a value.
   */
    private processTraders(
        itemConfig: ConfigItem[string],
        itemId: string
    ): void {
        const tables = this.instanceManager.database;
        if (!itemConfig.addtoTraders) {
            return;
        }

        const { traderId, traderItems, barterScheme } = itemConfig;

        const traderIdFromMap = traderIDs[traderId];
        const finalTraderId = traderIdFromMap || traderId;
        const trader = tables.traders[finalTraderId];

        if (!trader) {
            return;
        }

        for (const item of traderItems) {
            if (this.instanceManager.debug) {
                console.log("Processing traders for item:", itemId);
            }
            const newItem = {
                _id: itemId,
                _tpl: itemId,
                parentId: "hideout",
                slotId: "hideout",
                upd: {
                    UnlimitedCount: item.unlimitedCount,
                    StackObjectsCount: item.stackObjectsCount
                }
            };

            trader.assort.items.push(newItem);
            if (this.instanceManager.debug) {
                console.log(`Successfully added item ${itemId} to the trader ${traderId}`);
            }
        }

        trader.assort.barter_scheme[itemId] = [];

        for (const scheme of barterScheme) {
            if (this.instanceManager.debug) {
                console.log("Processing trader barter scheme for item:", itemId);
            }
            const count = scheme.count;
            const tpl = currencyIDs[scheme._tpl] || ItemMap[scheme._tpl];

            if (!tpl) {
                throw new Error(
                    `Invalid _tpl value in barterScheme for item: ${itemId}`
                );
            }

            trader.assort.barter_scheme[itemId].push([
                {
                    count: count,
                    _tpl: tpl
                }
            ]);
            if (this.instanceManager.debug) {
                console.log(`Successfully added item ${itemId} to the barter scheme of trader ${traderId}`);
            }
        }

        trader.assort.loyal_level_items[itemId] = itemConfig.loyallevelitems;
    }

    private addtoHallofFame(itemConfig: ConfigItem[string], itemId: string) {
        const hallofFame1 = this.instanceManager.database.templates.items["63dbd45917fff4dee40fe16e"];
        const hallofFame2 = this.instanceManager.database.templates.items["65424185a57eea37ed6562e9"];
        const hallofFame3 = this.instanceManager.database.templates.items["6542435ea57eea37ed6562f0"];

        // Add to Hall of Fame filters
        if (itemConfig.addtoHallOfFame) {
            const hallOfFames = [hallofFame1, hallofFame2, hallofFame3];
            for (const hall of hallOfFames) {
                for (const slot of hall._props.Slots) {
                    for (const filter of slot._props.filters) {
                        if (!filter.Filter.includes(itemId)) {
                            filter.Filter.push(itemId);

                            if (this.instanceManager.debug) {
                                console.log(`Added item ${itemId} to filter Hall of Fame ${hall._name}`);
                            }
                        }
                    }
                }
            }
        }
    }

    private addtoSpecialSlots(itemConfig: ConfigItem[string], itemId: string) {
        const tables = this.instanceManager.database;
        if (itemConfig.addtoSpecialSlots) {
            const pockets = tables.templates.items["627a4e6b255f7527fb05a0f6"];
            for (const slot of pockets._props.Slots) {
                if (!slot._props.filters[0].Filter.includes(itemId)) {
                    slot._props.filters[0].Filter.push(itemId);
                }
            }
        }
    }

    /**
     * Processes the bot inventories based on the given item configuration.
     *
     * @param {ConfigItem[string]} itemConfig - The item configuration.
     * @param {string} finalItemTplToClone - The final item template to clone.
     * @param {string} itemId - The item ID.
     * @return {void} This function does not return anything.
     */
    private processBotInventories(
        itemConfig: ConfigItem[string],
        finalItemTplToClone: string,
        itemId: string
    ): void {
        const tables = this.instanceManager.database;

        if (!itemConfig.addtoBots) return;

        if (this.instanceManager.debug) {
            console.log("Processing bot inventories for item:", itemId);
        }

        // Iterate through bot types
        for (const botId in tables.bots.types) {
            const botType = botId;
            const botInventory = tables.bots.types[botId].inventory;

            botInventory.Ammo = botInventory.Ammo || {};

            // Process items and equipment
            this.processInventoryType(botInventory.items, finalItemTplToClone, itemId, botType, "items");
            this.processInventoryType(botInventory.equipment, finalItemTplToClone, itemId, botType, "equipment");

            // Process mods if applicable
            if (itemConfig.addtoModSlots && itemConfig.modSlot) {
                this.processBotModSlots(finalItemTplToClone, itemId, botType, itemConfig.modSlot);
            }


        }
    }

    /**
     * Processes inventory type (items or equipment) and gathers mods based on Slots.
     *
     * @param {any} inventoryType - The inventory type to process.
     * @param {string} finalTplToClone - The final item template to clone.
     * @param {string} itemId - The item ID.
     * @param {string} botType - The bot type identifier.
     * @param {string} typeLabel - Label indicating items or equipment.
     * @return {void} This function does not return anything.
     */
    private processInventoryType(
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        inventoryType: any,
        finalTplToClone: string,
        itemId: string,
        botType: string,
        typeLabel: string
    ): void {
        const tables = this.instanceManager.database;
        if (typeLabel === "equipment" && (
            (inventoryType.FirstPrimaryWeapon?.[finalTplToClone]) ||
            (inventoryType.SecondPrimaryWeapon?.[finalTplToClone]) ||
            (inventoryType.Holster?.[finalTplToClone])
        )) {
            if (!this.ensureValidWeaponPreset(itemId)) {
                return;
            }
            this.processAmmoAndChambers(tables.bots.types[botType].inventory, tables.templates.items[itemId]._props, itemId, botType);
        }

        for (const lootSlot in inventoryType) {
            const items = inventoryType[lootSlot];
            if (items && items[finalTplToClone] !== undefined) {
                const weight = items[finalTplToClone];
                if (this.instanceManager.debug) {
                    console.log(` - Adding item to bot ${typeLabel} for bot type: ${botType} in loot slot: ${lootSlot} with weight: ${weight}`);
                }
                items[itemId] = weight;

                this.addModsToItem(tables, itemId, botType);
            }
        }
    }

    /**
     * Adds mods to an item based on its Slots configuration.
     *
     * @param {any} tables - The database tables.
     * @param {string} itemId - The item ID.
     * @param {string} botType - The bot type identifier.
     * @return {void} This function does not return anything.
     */
    private addModsToItem(tables: IDatabaseTables, itemId: string, botType: string): void {
        const itemProps = tables.templates.items[itemId]._props;
        if (itemProps?.Slots) {
            for (const slot of itemProps.Slots) {
                const slotName = slot._name;
                const filters = slot._props.filters;
                if (filters && filters.length > 0) {
                    for (const filter of filters) {
                        for (const modId of filter.Filter) {
                            if (modId && tables.templates.items[modId]) {
                                tables.bots.types[botType].inventory.mods[itemId] = tables.bots.types[botType].inventory.mods[itemId] || {};
                                tables.bots.types[botType].inventory.mods[itemId][slotName] = tables.bots.types[botType].inventory.mods[itemId][slotName] || [];
                                if (!tables.bots.types[botType].inventory.mods[itemId][slotName].includes(modId)) {
                                    tables.bots.types[botType].inventory.mods[itemId][slotName].push(modId);
                                    if (tables.templates.items[modId]._props) {
                                        if (tables.templates.items[modId]._props.Slots.length > 0) {
                                            this.addModsToItem(tables, modId, botType);
                                        }
                                    }
                                }
                                if (this.instanceManager.debug) {
                                    console.log(` - Added mod ${modId} to ${itemId}'s ${slotName} of bot type ${botType}`);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     * Processes mod slots and adds itemId to specified slots if finalItemTplToClone is present.
     *
     * @param {any} mods - The mods inventory.
     * @param {string} finalItemTplToClone - The final item template to clone.
     * @param {string} itemId - The item ID.
     * @param {string} botType - The bot type identifier.
     * @param {string[]} modSlots - The list of mod slots to process.
     * @return {void} This function does not return anything.
     */
    private processBotModSlots(
        finalItemTplToClone: string,
        itemId: string,
        botType: string,
        modSlots: string[]
    ): void {
        const mods = this.instanceManager.database.bots.types[botType].inventory.mods;
        for (const item in mods) {
            const itemMods = mods[item];

            for (const modSlot of modSlots) {
                if (itemMods[modSlot]?.includes(finalItemTplToClone)) {
                    itemMods[modSlot].push(itemId);
                    if (this.instanceManager.debug) {
                        console.log(` - Added item ${itemId} to mod slot ${modSlot} for bot type ${botType} in item ${item}`);
                    }

                    // Adding nested mods for the new item
                    this.addModsToItem(this.instanceManager.database, itemId, botType);
                }
            }
        }
    }

    /**
     * Processes ammo and chambers, adding calibers and chamber filters if needed.
     *
     * @param {any} botInventory - The bot's inventory.
     * @param {any} itemProps - The properties of the item.
     * @param {string} itemId - The item ID.
     * @param {string} botType - The bot type identifier.
     * @return {void} This function does not return anything.
     */
    private processAmmoAndChambers(
        botInventory: IInventory,
        itemProps: IProps,
        itemId: string,
        botType: string
    ): void {
        const ammoCaliber = itemProps.ammoCaliber;
        if (!ammoCaliber) return;

        botInventory.Ammo[ammoCaliber] = botInventory.Ammo[ammoCaliber] || {};

        if (this.instanceManager.debug) {
            console.log(` - Added new caliber ${ammoCaliber} to bot inventory for bot type ${botType}`);
        }

        if (itemProps.Chambers) {
            for (const chamber of itemProps.Chambers) {
                const filters = chamber._props.filters;
                if (filters && filters.length > 0) {
                    for (const filter of filters) {
                        for (const filterItem of filter.Filter) {
                            botInventory.Ammo[ammoCaliber][filterItem] = botInventory.Ammo[ammoCaliber][filterItem] || 0;
                            if (this.instanceManager.debug) {
                                console.log(` - Added filter item ${filterItem} to caliber ${ammoCaliber} in bot inventory for bot type ${botType}`);
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     * Ensures the weapon has a valid preset in the global ItemPresets.
     *
     * @param {string} itemId - The item ID.
     * @return {boolean} True if the weapon has a valid preset, false otherwise.
     */
    private ensureValidWeaponPreset(itemId: string): boolean {
        const db = this.instanceManager.database;
        const presets: Record<string, IPreset> = db.globals.ItemPresets;
        for (const presetObj of Object.values(presets)) {
            if (presetObj._items[0]._tpl === itemId) {
                if (this.instanceManager.debug) {
                    console.log(` - Valid preset found for item ${itemId}`);
                }
                return true;
            }
        }
        if (this.instanceManager.debug) {
            console.warn(`No valid preset found for item ${itemId} in globals.ItemPresets`);
        }
        return false;
    }

}
