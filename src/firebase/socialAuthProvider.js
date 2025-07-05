// src/firebase/socialAuthProvider.js
import { 
    GoogleAuthProvider, 
    FacebookAuthProvider, 
    signInWithPopup,
    getAdditionalUserInfo
  } from "firebase/auth";
  import { auth, db } from './config';
  import { doc, getDoc, setDoc } from 'firebase/firestore';
  
  // Helper function to handle social authentication
  export const handleSocialAuth = async (provider, onSuccess, onError) => {
    try {
      // Create provider instance
      const authProvider = provider === 'google' 
        ? new GoogleAuthProvider() 
        : new FacebookAuthProvider();
      
      // Add appropriate scopes
      if (provider === 'google') {
        authProvider.addScope('profile');
        authProvider.addScope('email');
      } else {
        authProvider.addScope('email');
        authProvider.addScope('public_profile');
      }
      
      // Sign in with popup
      const result = await signInWithPopup(auth, authProvider);
      const userInfo = getAdditionalUserInfo(result);
      const user = result.user;
      
      // Check if this is a new user
      const isNewUser = userInfo.isNewUser;
      let redirectPath = '/onboarding';
      let needsProfileCompletion = false;
      
      // If new user, create basic document
      if (isNewUser) {
        // Create a basic user document
        await setDoc(doc(db, "users", user.uid), {
          fullName: user.displayName || '',
          emailPhone: user.email || '',
          provider: provider === 'google' ? 'Google' : 'Facebook',
          createdAt: new Date(),
          lastLogin: new Date(),
        });
        
        // New users need to complete profile
        needsProfileCompletion = true;
        redirectPath = '/signup';
      } else {
        // For existing users, check if they completed their profile
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Update last login time
          await setDoc(doc(db, "users", user.uid), {
            ...userData,
            lastLogin: new Date()
          }, { merge: true });
          
          // Check if user has completed profile
          if (!userData.gender) {
            needsProfileCompletion = true;
            redirectPath = '/signup';
          }
        } else {
          // Safety fallback - create user document if it doesn't exist
          await setDoc(doc(db, "users", user.uid), {
            fullName: user.displayName || '',
            emailPhone: user.email || '',
            provider: provider === 'google' ? 'Google' : 'Facebook',
            createdAt: new Date(),
            lastLogin: new Date(),
          });
          
          needsProfileCompletion = true;
          redirectPath = '/signup';
        }
      }
      
      // Call success callback with appropriate info
      onSuccess({
        user,
        needsProfileCompletion,
        redirectPath,
        provider: provider === 'google' ? 'Google' : 'Facebook'
      });
      
    } catch (error) {
      console.error(`${provider} auth error:`, error);
      
      let errorMessage = `Failed to authenticate with ${provider === 'google' ? 'Google' : 'Facebook'}.`;
      
      // Handle common errors
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = `Sign in was cancelled.`;
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = `An account already exists with the same email. Try another login method.`;
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = `Pop-up was blocked by your browser. Please enable pop-ups for this site.`;
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = `Sign in operation was cancelled.`;
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = `Network error. Please check your internet connection.`;
      }
      
      // Call error callback
      onError(errorMessage, error);
    }
  };
  
  export default handleSocialAuth;