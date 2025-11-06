// src/types.ts
// Roh-DTOs aus der API – exakt/näherungsweise anhand Backend-Modelle & Seeder

export type ClientSettingsDto = {
    id?: number;
    primary_color?: string;
    secondary_color?: string;
    primary_font?: {
        name?: string | null;
        media_id?: number | null;
        url?: string | null;
    } | null;
    secondary_font?: {
        name?: string | null;
        media_id?: number | null;
        url?: string | null;
    } | null;
    background?: {
        type: "none" | "image" | "video";
        media_id?: number | null;
        url?: string | null;
        fit?: string;
        position?: string;
        overlay?: string;
    } | null;
};
