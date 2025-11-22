import { auth, db } from './firebaseConfig';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail,
  AuthError
} from "firebase/auth";
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  updateDoc
} from "firebase/firestore";
import { User, UserRole } from '../types';

class AuthService {
  private otpStore: Map<string, string> = new Map();

  // --- Authentication ---

  async login(identifier: string, password: string): Promise<{ user?: User; error?: string }> {
    try {
      // 1. Login with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, identifier, password);
      const firebaseUser = userCredential.user;

      // 2. Fetch extra user details (Role, Name, Status) from Firestore
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Edge case: Auth exists but Firestore doc is missing
        await signOut(auth);
        return { error: "User profile not found. Please contact support." };
      }

      let userData = userDoc.data() as User;

      // --- SUPER ADMIN AUTO-PROMOTION ---
      // Ensure the specified email always gets ADMIN privileges
      if (userData.email && userData.email.toLowerCase() === 'atharvviralekar19@gmail.com') {
        if (userData.role !== UserRole.ADMIN || userData.status !== 'ACTIVE') {
          userData.role = UserRole.ADMIN;
          userData.status = 'ACTIVE';
          // Update Firestore immediately to reflect new role
          await updateDoc(userDocRef, { role: UserRole.ADMIN, status: 'ACTIVE' });
        }
      }
      // ----------------------------------

      // 3. Status Checks
      if (userData.role === UserRole.INSTITUTION && userData.status === 'PENDING') {
        await signOut(auth);
        return { error: 'Account pending approval. Please wait for Admin verification.' };
      }

      if (userData.status === 'REJECTED') {
        await signOut(auth);
        return { error: 'Account deactivated. Contact administrator.' };
      }

      return { user: { ...userData, id: firebaseUser.uid } };
    } catch (error: any) {
      console.error("Login Error:", error.code, error.message);
      
      let msg = "Login failed. Please check your connection.";
      
      // Map Firebase error codes to user-friendly messages
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        msg = "Invalid email or password. Please try again or register.";
      } else if (error.code === 'auth/too-many-requests') {
        msg = "Too many failed attempts. Please try again later.";
      } else if (error.code === 'auth/network-request-failed') {
        msg = "Network error. Please check your internet connection.";
      }

      return { error: msg };
    }
  }

  async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  }

  // --- Password Reset ---
  async resetPassword(identifier: string, type: 'INSTITUTION' | 'STUDENT'): Promise<{ success: boolean; message?: string }> {
    try {
      // Check if it looks like an email
      const isEmail = identifier.includes('@');
      
      if (isEmail) {
        // Use Firebase real password reset for emails
        await sendPasswordResetEmail(auth, identifier);
        return { success: true, message: `Password reset link sent to ${identifier}. Check your inbox.` };
      } 
      
      // Handle Mobile Number (Mock for Student)
      if (type === 'STUDENT' && !isEmail) {
        // In a real app, we would check if the number exists in DB first
        await new Promise(r => setTimeout(r, 1500)); // Simulate network delay
        return { success: true, message: `OTP sent to ${identifier}. (Demo: Use code 123456 to verify in next step)` };
      }
      
      return { success: false, message: "Please enter a valid email address." };
    } catch (error: any) {
      console.error("Reset Error", error);
      if (error.code === 'auth/user-not-found') return { success: false, message: "No account found with this email." };
      if (error.code === 'auth/invalid-email') return { success: false, message: "Invalid email format." };
      return { success: false, message: "Failed to process request. Try again." };
    }
  }

  // --- OTP Logic (Simulation for Non-Coder Simplicity) ---
  async sendOTP(mobileNumber: string): Promise<{ success: boolean; code?: string }> {
    await new Promise(r => setTimeout(r, 1000));
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.otpStore.set(mobileNumber, otp);
    console.log(`[SMS GATEWAY] OTP for ${mobileNumber}: ${otp}`);
    return { success: true, code: otp };
  }

  async verifyOTP(mobileNumber: string, code: string): Promise<boolean> {
    await new Promise(r => setTimeout(r, 500));
    const storedOtp = this.otpStore.get(mobileNumber);
    if (code === '123456') return true; // Master code for testing
    return storedOtp === code;
  }

  // --- Registration ---

  async registerInstitution(data: any): Promise<{ success: boolean; message?: string }> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const uid = userCredential.user.uid;

      // --- SUPER ADMIN CREATION CHECK ---
      // Automatically assign ADMIN role if this specific email registers
      const isSuperAdmin = data.email.toLowerCase() === 'atharvviralekar19@gmail.com';

      const newUser: User = {
        id: uid,
        name: data.institutionName,
        email: data.email,
        role: isSuperAdmin ? UserRole.ADMIN : UserRole.INSTITUTION,
        status: isSuperAdmin ? 'ACTIVE' : 'PENDING',
        institutionDetails: {
          website: data.website,
          foundedYear: data.foundedYear
        },
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.institutionName)}&background=random`
      };

      await setDoc(doc(db, "users", uid), newUser);
      await signOut(auth);

      return { success: true };
    } catch (error: any) {
      console.error("Reg Error:", error);
      if (error.code === 'auth/email-already-in-use') return { success: false, message: "Email is already registered." };
      if (error.code === 'auth/weak-password') return { success: false, message: "Password should be at least 6 characters." };
      return { success: false, message: "Registration failed. Please try again." };
    }
  }

  async registerStudent(data: any): Promise<{ success: boolean; message?: string }> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const uid = userCredential.user.uid;

      const newUser: User = {
        id: uid,
        name: data.name,
        email: data.email,
        studentId: `STU-${Math.floor(Math.random() * 100000)}`,
        mobileNumber: data.mobileNumber,
        role: UserRole.STUDENT,
        status: 'ACTIVE',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random`
      };

      await setDoc(doc(db, "users", uid), newUser);
      return { success: true };
    } catch (error: any) {
      console.error("Reg Error:", error);
      if (error.code === 'auth/email-already-in-use') return { success: false, message: "Email is already registered." };
      return { success: false, message: "Registration failed." };
    }
  }

  // --- Admin Functions ---

  async getPendingInstitutions(): Promise<User[]> {
    const q = query(collection(db, "users"), where("role", "==", "INSTITUTION"), where("status", "==", "PENDING"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as User);
  }

  async approveInstitution(email: string): Promise<void> {
    const q = query(collection(db, "users"), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (d) => {
      await updateDoc(doc(db, "users", d.id), { status: 'ACTIVE' });
    });
  }

  async rejectInstitution(email: string): Promise<void> {
    const q = query(collection(db, "users"), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (d) => {
      await updateDoc(doc(db, "users", d.id), { status: 'REJECTED' });
    });
  }
}

export const authService = new AuthService();