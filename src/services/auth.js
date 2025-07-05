import { db } from '../firebase/config';
import { doc, setDoc } from 'firebase/firestore';

/**
 * Save onboarding Q&A for a user in Firestore
 * @param {string} uid - User ID
 * @param {number} step - The onboarding step/question index
 * @param {string} question - The question text
 * @param {string} answer - The user's answer
 */
export async function saveOnboardingQA(uid, step, question, answer) {
  if (!uid) return;
  const docRef = doc(db, 'onboardingResponses', uid);
  // Save as a map of step: { question, answer }
  await setDoc(docRef, {
    [step]: { question, answer }
  }, { merge: true });
}
