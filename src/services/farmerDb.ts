import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from './firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operation: OperationType, path: string): never {
  const err = error as { code?: string; message?: string };
  console.error(`Firestore error during ${operation} at ${path}:`, err);
  throw new Error(`Database error (${operation} on ${path}): ${err.message || 'Unknown error'}`);
}

export interface FarmerProfile {
  uid: string;
  name: string;
  phone?: string;
  state: string;
  district: string;
  village?: string;
  farmSizeAcres?: string;
  primaryCrops?: string;
  soilType?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface FarmerRecord {
  id: string;
  userId: string;
  recordType: 'soil_scan' | 'disease_diagnosis' | 'crop_advisory' | 'field_note';
  title: string;
  crop?: string;
  summary?: string;
  detailsJson?: string;
  imageUrl?: string;
  createdAt: string;
}

export interface CommunityFieldReport {
  id: string;
  userId: string;
  farmerName?: string;
  crop: string;
  issue: string;
  description?: string;
  state: string;
  district: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  timestamp: string;
}

// 1. Farmer Profile Operations
export async function getFarmerProfile(userId: string): Promise<FarmerProfile | null> {
  const path = `users/${userId}`;
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (snap.exists()) {
      return snap.data() as FarmerProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveFarmerProfile(profile: FarmerProfile): Promise<void> {
  const path = `users/${profile.uid}`;
  try {
    await setDoc(doc(db, 'users', profile.uid), {
      ...profile,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 2. Farmer Records Subcollection
export async function saveFarmerRecord(record: FarmerRecord): Promise<void> {
  const path = `users/${record.userId}/records/${record.id}`;
  try {
    // Clean null/undefined values to prevent Firestore rejection
    const sanitized: Record<string, any> = {
      id: record.id,
      userId: record.userId,
      recordType: record.recordType,
      title: record.title,
      createdAt: record.createdAt,
    };
    if (record.crop) sanitized.crop = record.crop;
    if (record.summary) sanitized.summary = record.summary.slice(0, 500);
    if (record.detailsJson) sanitized.detailsJson = record.detailsJson.slice(0, 10000);
    if (record.imageUrl) sanitized.imageUrl = record.imageUrl;

    await setDoc(doc(db, 'users', record.userId, 'records', record.id), sanitized);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function getFarmerRecords(userId: string): Promise<FarmerRecord[]> {
  const path = `users/${userId}/records`;
  try {
    const q = query(collection(db, 'users', userId, 'records'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    const records: FarmerRecord[] = [];
    snap.forEach((d) => {
      records.push(d.data() as FarmerRecord);
    });
    return records;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function deleteFarmerRecord(userId: string, recordId: string): Promise<void> {
  const path = `users/${userId}/records/${recordId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'records', recordId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 3. Community Reports Operations
export async function fetchFirestoreCommunityReports(): Promise<CommunityFieldReport[]> {
  const path = 'communityReports';
  try {
    const q = query(collection(db, path), orderBy('timestamp', 'desc'));
    const snap = await getDocs(q);
    const reports: CommunityFieldReport[] = [];
    snap.forEach((d) => {
      reports.push(d.data() as CommunityFieldReport);
    });
    return reports;
  } catch (error) {
    console.warn("Could not fetch firestore community reports, fallback to local:", error);
    return [];
  }
}

export async function postFirestoreCommunityReport(report: CommunityFieldReport): Promise<void> {
  const path = `communityReports/${report.id}`;
  try {
    await setDoc(doc(db, 'communityReports', report.id), report);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}
