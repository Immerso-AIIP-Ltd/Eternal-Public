import { db } from '../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { generateExpansionReport } from './gpt'; // adjust path if needed

// Fetch all Q&A for a user from Firestore
export async function fetchUserQA(userId) {
  const q = query(collection(db, 'userChats'), where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data());
}

// Generate section content using AI based on Q&A (now returns the full expansion report)
export async function generateSectionContent(soulPath, qaList) {
  // soulPath: string, qaList: array of {question, answer}
  return await generateExpansionReport({ soulPath, qaHistory: qaList });
}

// Generates a full soul report based on all user Q&A and section names
export async function generateFullSoulReport(userId, soulPath) {
  const qaListRaw = await fetchUserQA(userId);
  const qaList = Array.isArray(qaListRaw) ? qaListRaw : [];
  if (qaList.length === 0) {
    return "No chat answers found. Please answer some questions first.";
  }
  // soulPath: string, qaList: array of {question, answer}
  return await generateExpansionReport({ soulPath, qaHistory: qaList });
} 