import { NextResponse } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const listingId = body?.listingId;

    if (!listingId) {
      return NextResponse.json({ error: "Missing listingId" }, { status: 400 });
    }

    const listingRef = doc(db, "listings", listingId);
    const snap = await getDoc(listingRef);

    if (!snap.exists()) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const listing = snap.data() as any;
    const photos = Array.isArray(listing?.photos) ? listing.photos : [];

    const deleted: string[] = [];
    const skipped: any[] = [];
    const failed: any[] = [];

    for (const p of photos) {
      const storagePath = p?.storagePath;
      if (!storagePath) {
        skipped.push({ reason: "missing storagePath", photo: p });
        continue;
      }

      try {
        await deleteObject(ref(storage, storagePath));
        deleted.push(storagePath);
      } catch (err: any) {
        failed.push({ storagePath, error: err?.message || String(err) });
      }
    }

    return NextResponse.json({
      ok: true,
      listingId,
      totals: { photos: photos.length, deleted: deleted.length, skipped: skipped.length, failed: failed.length },
      deleted,
      skipped,
      failed,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
