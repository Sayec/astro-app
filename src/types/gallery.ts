export interface GalleryItem {
    id: string;
    title: string;
    object: string;          // e.g. "M42 Orion Nebula"
    description: string;
    date: string;            // date photo was taken
    imageUrl: string;        // Cloudinary full URL
    thumbnailUrl: string;    // Cloudinary thumbnail URL
    tags?: string[];         // e.g. ["Mgławice", "Widefield"]
    gear?: string;           // telescope, camera
    exposure?: string;       // e.g. "120x30s"
    iso?: string;
    createdAt: string;       // upload timestamp
}
