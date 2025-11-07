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
    brand_name?: string | null;
    brand_subtitle?: string | null;
};

export type GalleryItem = {
    id: number;
    title: string;
    slug: string;
    description?: string | null;
    is_published: number | boolean;
    created_at: string;
    images_count: number;
};

export type GalleryShowResponse = {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    is_published: number | boolean;
    created_at: string;
    updated_at: string;
    images: Array<{
        id: number;
        media: {
            id: number;
            uuid: string;
            title: string;
            current_version: {
                path: string; // z.B. "media/.../v1/original.png"
                width: number;
                height: number;
                mime_type: string;
            };
        };
    }>;
};
