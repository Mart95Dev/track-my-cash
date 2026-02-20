// Corrige le mojibake : octets UTF-8 interprétés en Latin-1 par certains lecteurs XLSX
export function fixMojibake(str: string): string {
  try {
    const bytes = Uint8Array.from(str, (c) => c.charCodeAt(0));
    return new TextDecoder("utf-8").decode(bytes);
  } catch {
    return str;
  }
}

export function parseAmount(str: string): number {
  return parseFloat(
    str
      .replace(/\s/g, "")
      .replace(",", ".")
      .replace(/[^0-9.\-]/g, "")
  );
}

export function parseAmountMCB(str: string): number {
  if (!str) return 0;
  const cleaned = str.replace(/"/g, "").replace(/\s/g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
}

export function parseDateFR(str: string): string {
  const parts = str.split("/");
  if (parts.length !== 3) return str;
  return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
}

export function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

export function parseFRAmount(str: string): number {
  return parseFloat(str.replace(/\s/g, "").replace(",", "."));
}
