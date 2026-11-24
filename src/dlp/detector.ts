import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

const SENSITIVE_MARKER = "WALLED_SENSITIVE";

export function containsSensitiveMarker(text: string): boolean {
    return text.includes(SENSITIVE_MARKER);
}

export async function scanImageForSensitiveMarker(
    imagePath: string,
): Promise<{ detected: boolean; extractedText: string }> {
    try {
        const { stdout } = await execFileAsync("tesseract", [imagePath, "stdout"], {
            timeout: 15000,
        });

        const extractedText = stdout.trim();

        return {
            detected: containsSensitiveMarker(extractedText),
            extractedText,
        };
    } catch (error) {
        console.error("OCR scanning failed:", error);

        return {
            detected: false,
            extractedText: "",
        };
    }
}
