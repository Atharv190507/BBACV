import { db } from './firebaseConfig';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  setDoc,
  doc,
  getDoc
} from "firebase/firestore";
import { CertificateData } from '../types';

class BlockchainService {
  
  // Simulate SHA-256 Hashing
  public async generateHash(data: Partial<CertificateData>): Promise<string> {
    // Sort keys to ensure deterministic hash for verification
    const sortedKeys = Object.keys(data).sort();
    const canonicalObj = sortedKeys.reduce((obj: any, key) => {
        obj[key] = (data as any)[key];
        return obj;
    }, {});

    const msgBuffer = new TextEncoder().encode(JSON.stringify(canonicalObj));
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  public async issueCertificate(cert: CertificateData): Promise<boolean> {
    try {
      // Check for duplicate ID in Firestore
      const q = query(collection(db, "certificates"), where("id", "==", cert.id));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        return false; // Duplicate exists
      }

      // Add to "certificates" collection
      // We use cert.id as the document ID for easier lookup
      await setDoc(doc(db, "certificates", cert.id), cert);
      return true;
    } catch (e) {
      console.error("Blockchain Error:", e);
      return false;
    }
  }

  public async getCertificate(id: string): Promise<CertificateData | undefined> {
    try {
       // Since we set the doc ID to the cert ID
       const docRef = doc(db, "certificates", id);
       const docSnap = await getDoc(docRef);
       
       if (docSnap.exists()) {
         return docSnap.data() as CertificateData;
       }
       
       // Fallback: case insensitive search using query (optional)
       return undefined;
    } catch (e) {
        console.error("Fetch Error:", e);
        // Fallback query by field
        try {
            const q = query(collection(db, "certificates"), where("id", "==", id));
            const snap = await getDocs(q);
            if (!snap.empty) return snap.docs[0].data() as CertificateData;
        } catch (err) {
            console.error("Fallback Query Error:", err);
        }
        return undefined;
    }
  }

  public async getCertificatesByStudent(studentId: string): Promise<CertificateData[]> {
    try {
      const q = query(collection(db, "certificates"), where("studentId", "==", studentId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as CertificateData);
    } catch (e) {
      console.error("Error fetching student certs:", e);
      return [];
    }
  }
}

export const blockchainService = new BlockchainService();