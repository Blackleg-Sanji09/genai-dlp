const SENSITIVE_MARKER = "WALLED_SENSITIVE";

export function containsSensitiveMarker(text: string): boolean {
  return text.includes(SENSITIVE_MARKER);
}