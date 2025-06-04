import fs from "fs";
import path from "path";

const CONFIG_PATH = path.join(process.cwd(), "..", "hardhat", "scripts", "oracle-bot", "config.json");

export type ConfigKey = "PROBABILITY_OF_SKIPPING_REPORT" | "PROBABILITY_OF_OUTLIER_PRICE";

export async function updateConfigValue(key: ConfigKey, value: number): Promise<void> {
  try {
    // Read the current config
    const configContent = await fs.promises.readFile(CONFIG_PATH, "utf-8");
    const config = JSON.parse(configContent);

    // Validate the value
    if (typeof value !== "number" || value < 0 || value > 1) {
      throw new Error("Value must be a number between 0 and 1");
    }

    // Update the specified key
    config[key] = value;

    // Write back to file with proper formatting
    await fs.promises.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error("Error updating config:", error);
    throw error;
  }
}
