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
        console.log(`\x1b[94m[Echoes of Tarkov] \x1b[93m Loaded              | \x1b[91mA\x1b[0m\x1b[93m \x1b[0m\x1b[92mM\x1b[0m\x1b[96mo\x1b[0m\x1b[94md\x1b[0m\x1b[95m \x1b[0m\x1b[91mb\x1b[0m\x1b[93my\x1b[0m\x1b[92m \x1b[0m\x1b[96mR\x1b[0m\x1b[94mh\x1b[0m\x1b[95me\x1b[0m\x1b[91md\x1b[0m\x1b[93md\x1b[0m\x1b[92mE\x1b[0m\x1b[96ml\x1b[0m\x1b[94mB\x1b[0m\x1b[95mo\x1b[0m\x1b[91mz\x1b[0m\x1b[93mo\x1b[0m\x1b[92m,\x1b[0m \x1b[96mE\x1b[0m\x1b[94mu\x1b[0m\x1b[95mk\x1b[0m\x1b[91my\x1b[0m\x1b[93mr\x1b[0m\x1b[92me\x1b[0m\x1b[96m,\x1b[0m \x1b[94ma\x1b[0m\x1b[95mn\x1b[0m\x1b[91md\x1b[0m \x1b[93mP\x1b[0m\x1b[92mi\x1b[0m\x1b[96mg\x1b[0m\x1b[94me\x1b[0m\x1b[95mo\x1b[0m\x1b[91mn\x1b[0m`
        )
    }
}

		)
	}
}

module.exports = { mod: new BGReplace() };
