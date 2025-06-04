import { NextResponse } from "next/server";
import { updateConfigValue } from "@/utils/configUpdater";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { value } = body;

    if (typeof value !== "number") {
      return NextResponse.json({ error: "Value must be a number between 0 and 1" }, { status: 400 });
    }

    await updateConfigValue("PROBABILITY_OF_OUTLIER_PRICE", value);

    return NextResponse.json({ success: true, value });
  } catch (error) {
    console.error("Error updating outlier probability:", error);
    return NextResponse.json({ error: "Failed to update configuration" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const configPath = path.join(process.cwd(), "..", "hardhat", "scripts", "oracle-bot", "config.json");
    const configContent = await fs.promises.readFile(configPath, "utf-8");
    const config = JSON.parse(configContent);

    return NextResponse.json({
      value: config.PROBABILITY_OF_OUTLIER_PRICE,
    });
  } catch (error) {
    console.error("Error reading outlier probability:", error);
    return NextResponse.json({ error: "Failed to read configuration" }, { status: 500 });
  }
}
