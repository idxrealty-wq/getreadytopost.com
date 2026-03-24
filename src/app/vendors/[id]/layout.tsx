import { Metadata } from "next";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function initAdmin() {
  if (!getApps().length) {
    const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (json) {
      const sa: any = JSON.parse(json);
      sa.private_key = sa.private_key.replace(/\\n/g, "\n");
      initializeApp({ credential: cert(sa) });
    } else {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
      });
    }
  }
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  try {
    initAdmin();
    const db = getFirestore();
    const doc = await db.collection("vendors").doc(params.id).get();

    if (!doc.exists) {
      return {
        title: "Vendor Not Found",
        description: "This vendor profile does not exist.",
      };
    }

    const d = doc.data();

    if (d?.status !== "active" && d?.status !== "approved") {
      return {
        title: "Vendor Not Found",
        description: "This vendor profile does not exist.",
      };
    }

    const businessName = d?.businessName || "Vendor";
    const description =
      d?.shortDescription ||
      `${businessName} - Find trusted services on GetReadyToPost.`;
    const logoUrl = d?.logoUrl || "";
    const adGraphicUrl = d?.adGraphicUrl || "";
    const ogImage = adGraphicUrl || logoUrl || "";

    return {
      title: `${businessName} | GetReadyToPost`,
      description: description,
      openGraph: {
        title: businessName,
        description: description,
        type: "website",
        url: `https://getreadytopost.com/vendors/${params.id}`,
        images: ogImage
          ? [
              {
                url: ogImage,
                width: 1200,
                height: 630,
                alt: businessName,
              },
            ]
          : [],
      },
      twitter: {
        card: "summary_large_image",
        title: businessName,
        description: description,
        images: ogImage ? [ogImage] : [],
      },
    };
  } catch (err) {
    return {
      title: "Vendor Profile",
      description: "View vendor profile on GetReadyToPost.",
    };
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
