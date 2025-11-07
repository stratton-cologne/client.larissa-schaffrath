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

export type PortfolioDto = {
    id?: number;
    name?: string;
    tagline?: string | null;
    location?: string | null;
    about?: string | null;
    is_published?: boolean;
    avatar_media_id?: number | null;
    socials?: {
        instagram?: string | null;
        flickr?: string | null;
        facebook?: string | null;
        twitter?: string | null;
    } | null;
    avatar?: {
        id: number;
        currentVersion?: {
            id: number;
            version: number;
            original_name: string;
            path: string;
            mime_type?: string | null;
            width?: number | null;
            height?: number | null;
        } | null;
    } | null;
};

export type ContactDto = {
    id?: number;
    email?: string | null;
    phone?: string | null;
    headline?: string | null;
    subline?: string | null;
    interest_label?: string | null;
    interests?: string[] | null;
    is_published?: boolean;
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
