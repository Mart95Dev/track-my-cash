import { EMAIL_COLORS } from "./styles";

export function renderHeading(text: string, level: 2 | 3 = 2): string {
  const size = level === 2 ? "22px" : "16px";
  return `<h${level} style="margin: 0 0 ${level === 2 ? "16px" : "12px"}; font-size: ${size}; color: ${EMAIL_COLORS.dark};">${text}</h${level}>`;
}

export function renderSubtitle(text: string): string {
  return `<p style="margin: 0 0 24px; color: ${EMAIL_COLORS.textMuted}; font-size: 14px;">${text}</p>`;
}

export function renderParagraph(text: string, color: string = EMAIL_COLORS.textSecondary): string {
  return `<p style="margin: 0 0 12px; color: ${color}; line-height: 1.6;">${text}</p>`;
}

export function renderNote(text: string): string {
  return `<p style="margin: 24px 0 0; color: ${EMAIL_COLORS.textMuted}; font-size: 13px; line-height: 1.5;">${text}</p>`;
}

export function renderCTA(
  label: string,
  href: string,
  variant: "dark" | "primary" = "dark",
): string {
  const bg = variant === "primary" ? EMAIL_COLORS.primary : EMAIL_COLORS.dark;
  const radius = variant === "primary" ? "8px" : "6px";
  const weight = variant === "primary" ? "700" : "600";

  return `<div style="text-align: center; margin: 32px 0;">
      <a
        href="${href}"
        style="
          display: inline-block;
          background-color: ${bg};
          color: ${EMAIL_COLORS.white};
          text-decoration: none;
          padding: 14px 28px;
          border-radius: ${radius};
          font-weight: ${weight};
          font-size: 15px;
        "
      >
        ${label}
      </a>
    </div>`;
}

export interface SummaryRow {
  label: string;
  value: string;
  valueColor?: string;
  highlight?: boolean;
}

export function renderSummaryTable(rows: SummaryRow[]): string {
  const rowsHtml = rows
    .map((row) => {
      const bg = row.highlight ? `background: ${EMAIL_COLORS.bgLight};` : "";
      const radiusLeft = row.highlight ? "border-radius: 4px 0 0 4px;" : "";
      const radiusRight = row.highlight ? "border-radius: 0 4px 4px 0;" : "";
      const valueColor = row.valueColor ?? EMAIL_COLORS.text;
      const valueWeight = row.valueColor ? "font-weight: 700; font-size: 16px;" : "font-size: 14px;";

      return `<tr>
        <td style="padding: 10px 12px; ${bg} ${radiusLeft} color: ${EMAIL_COLORS.textSecondary}; font-size: 14px;">${row.label}</td>
        <td style="padding: 10px 12px; ${bg} ${radiusRight} color: ${valueColor}; ${valueWeight} text-align: right;">${row.value}</td>
      </tr>`;
    })
    .join("");

  return `<table style="width: 100%; border-collapse: collapse; margin: 0 0 24px;">${rowsHtml}</table>`;
}

export interface DataTableColumn {
  header: string;
  align?: "left" | "right";
}

export function renderDataTable(
  columns: DataTableColumn[],
  rows: string[][],
): string {
  const headerHtml = columns
    .map(
      (col) =>
        `<th style="padding: 8px 12px; text-align: ${col.align ?? "left"}; font-size: 12px; color: ${EMAIL_COLORS.textMuted}; text-transform: uppercase;">${col.header}</th>`,
    )
    .join("");

  const rowsHtml = rows
    .map(
      (cells) =>
        `<tr>${cells
          .map(
            (cell, i) =>
              `<td style="padding: 8px 12px; color: ${i === 0 ? EMAIL_COLORS.textSecondary : EMAIL_COLORS.text}; font-size: 14px; text-align: ${columns[i]?.align ?? "left"};">${cell}</td>`,
          )
          .join("")}</tr>`,
    )
    .join("");

  return `<table style="width: 100%; border-collapse: collapse; margin: 0 0 24px;">
      <tr style="border-bottom: 1px solid ${EMAIL_COLORS.border};">${headerHtml}</tr>
      ${rowsHtml}
    </table>`;
}

export function renderProgressBar(percentage: number, color: string): string {
  const pct = Math.min(Math.round(percentage), 100);
  return `<div style="background: ${EMAIL_COLORS.border}; border-radius: 4px; height: 8px; overflow: hidden; margin-bottom: 24px;">
      <div style="background: ${color}; width: ${pct}%; height: 100%; border-radius: 4px;"></div>
    </div>`;
}
