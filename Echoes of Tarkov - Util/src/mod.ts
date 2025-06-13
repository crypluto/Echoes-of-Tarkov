/* eslint-disable @typescript-eslint/naming-convention */

import * as fs from "fs";
import * as path from "path";
import { DependencyContainer } from "tsyringe";
import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { IpreSptLoadMod } from "@spt/models/external/IpreSptLoadMod";
import { LogTextColor } from "@spt/models/spt/logging/LogTextColor";
import { ImageRouter } from "@spt-aki/routers/ImageRouter";

class BGReplace implements IpreSptLoadMod, IPostDBLoadMod {
    public postDBLoad(container: DependencyContainer): void {
        const imageRouter = container.resolve<ImageRouter>("ImageRouter");
        const logger = container.resolve<ILogger>("WinstonLogger");

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
            logger.log(`Overriding launcher background with randomly selected: ${selectedFile}`, LogTextColor.MAGENTA);
            imageRouter.addRoute("/files/launcher/bg", selectedPath);
        } else {
            logger.warning(`Selected background not found: ${selectedPath}`);
        }
    }
}

module.exports = { mod: new BGReplace() };
