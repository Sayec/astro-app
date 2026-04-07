import { NextRequest, NextResponse } from 'next/server';
import { deleteImage } from '@/lib/cloudinary';
import { deleteGalleryItem } from '@/lib/gallery';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const adminKey = request.headers.get('x-admin-key');
    if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const publicId = decodeURIComponent(id);

        // Delete from Cloudinary and KV in parallel
        await Promise.all([
            deleteImage(publicId),
            deleteGalleryItem(publicId),
        ]);

        return NextResponse.json({ success: true, id: publicId });
    } catch (error) {
        console.error('[Gallery DELETE] Error:', error);
        return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
    }
}
