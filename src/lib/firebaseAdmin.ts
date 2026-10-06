import 'server-only';

import { applicationDefault, cert, getApps, initializeApp, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function getAdminApp() {
  const existingApp = getApps()[0];
  if (existingApp) return existingApp;

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (serviceAccountJson) {
    let serviceAccount: ServiceAccount;
    try {
      serviceAccount = JSON.parse(serviceAccountJson) as ServiceAccount;
    } catch {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON.');
    }
    return initializeApp({ credential: cert(serviceAccount), projectId });
  }

  return initializeApp({ credential: applicationDefault(), projectId });
}

export function getAdminFirestore() {
  return getFirestore(getAdminApp());
}

export async function verifyGoogleUser(request: Request) {
  const authorization = request.headers.get('authorization');
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!token) throw new Error('AUTH_REQUIRED');

  const decoded = await getAuth(getAdminApp()).verifyIdToken(token);
  if (decoded.firebase?.sign_in_provider !== 'google.com') throw new Error('GOOGLE_SIGN_IN_REQUIRED');
  return { uid: decoded.uid, name: typeof decoded.name === 'string' ? decoded.name.slice(0, 80) : 'Player' };
}

export function serverUnavailable(error: unknown) {
  console.error('Firebase Admin operation failed:', error);
  return Response.json(
    { error: 'Server-side Firebase credentials are not configured or the service is unavailable.' },
    { status: 503 },
  );
}
