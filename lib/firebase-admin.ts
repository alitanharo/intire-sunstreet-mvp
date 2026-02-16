import fs from "node:fs";
import path from "node:path";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

type ServiceAccountShape = {
  project_id?: string;
  client_email?: string;
  private_key?: string;
};

function readServiceAccountFromFile(): ServiceAccountShape | null {
  const candidates = ["serviceaccount.json", "serviceaccount-key.json"];

  for (const fileName of candidates) {
    const filePath = path.join(process.cwd(), fileName);
    if (!fs.existsSync(filePath)) continue;

    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw) as ServiceAccountShape;
  }

  return null;
}

function readServiceAccountFromEnv(): ServiceAccountShape | null {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  return {
    project_id: projectId,
    client_email: clientEmail,
    private_key: privateKey,
  };
}

function getServiceAccount(): Required<ServiceAccountShape> {
  const fromFile = readServiceAccountFromFile();
  const fromEnv = readServiceAccountFromEnv();
  const account = fromFile ?? fromEnv;

  if (!account?.project_id || !account?.client_email || !account?.private_key) {
    throw new Error(
      "Firebase Admin credentials are missing. Provide serviceaccount.json/serviceaccount-key.json or FIREBASE_PROJECT_ID/FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY.",
    );
  }

  return {
    project_id: account.project_id,
    client_email: account.client_email,
    private_key: account.private_key,
  };
}

function getFirebaseAdminApp() {
  if (getApps().length) return getApps()[0];

  const account = getServiceAccount();

  return initializeApp({
    credential: cert({
      projectId: account.project_id,
      clientEmail: account.client_email,
      privateKey: account.private_key,
    }),
  });
}

export function getAdminFirestore() {
  return getFirestore(getFirebaseAdminApp());
}
