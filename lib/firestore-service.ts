import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
  runTransaction,
  serverTimestamp,
  getDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { SpeechTopic, normalizeTopic, normalizeStudentNumber } from './types';

const SPEECH_TOPICS_COLLECTION = 'speechTopics';
const TOPIC_RESERVATIONS_COLLECTION = 'topicReservations';

/**
 * Real-time listener for the speech topics board.
 */
export function subscribeToSpeechTopics(
  onUpdate: (topics: SpeechTopic[]) => void,
  onError: (error: Error) => void
) {
  try {
    const q = query(
      collection(db, SPEECH_TOPICS_COLLECTION),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const topics: SpeechTopic[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const studentNum = data.studentNumber || data.userId || '';
          topics.push({
            id: docSnap.id,
            userId: studentNum,
            studentName: data.studentName || 'Anonymous Student',
            studentNumber: studentNum,
            studentEmail: data.studentEmail || '',
            studentPhotoURL: data.studentPhotoURL || '',
            topic: data.topic || '',
            normalizedTopic: data.normalizedTopic || normalizeTopic(data.topic || ''),
            section: data.section || '',
            createdAt: data.createdAt || null,
            updatedAt: data.updatedAt || null,
          });
        });
        onUpdate(topics);
      },
      (err) => {
        console.error('Error listening to speech topics:', err);
        // Fallback query if ordering index is building
        try {
          const fallbackQ = collection(db, SPEECH_TOPICS_COLLECTION);
          onSnapshot(
            fallbackQ,
            (fallbackSnap) => {
              const fallbackTopics: SpeechTopic[] = [];
              fallbackSnap.forEach((docSnap) => {
                const data = docSnap.data();
                const studentNum = data.studentNumber || data.userId || '';
                fallbackTopics.push({
                  id: docSnap.id,
                  userId: studentNum,
                  studentName: data.studentName || 'Anonymous Student',
                  studentNumber: studentNum,
                  studentEmail: data.studentEmail || '',
                  studentPhotoURL: data.studentPhotoURL || '',
                  topic: data.topic || '',
                  normalizedTopic: data.normalizedTopic || normalizeTopic(data.topic || ''),
                  section: data.section || '',
                  createdAt: data.createdAt || null,
                  updatedAt: data.updatedAt || null,
                });
              });
              onUpdate(fallbackTopics);
            },
            () => {
              onError(new Error('Unable to connect to the class topic board. Please check your connection.'));
            }
          );
        } catch {
          onError(err);
        }
      }
    );
  } catch (err) {
    onError(err instanceof Error ? err : new Error('Failed to subscribe to topics'));
    return () => {};
  }
}

/**
 * Registers a new speech presentation topic with Student Name & Number.
 * Uses atomic transaction to guarantee:
 * 1. Exactly 1 topic per student number
 * 2. Absolute uniqueness across the class (no two students can choose the same topic)
 */
export async function registerSpeechTopic(params: {
  studentName: string;
  studentNumber: string;
  topic: string;
  section?: string;
}): Promise<string> {
  const { studentName, studentNumber, topic, section } = params;

  const trimmedName = studentName.trim();
  const trimmedNumber = studentNumber.trim();
  const trimmedTopic = topic.trim();

  if (!trimmedName) {
    throw new Error('Please enter your full name.');
  }
  if (!trimmedNumber) {
    throw new Error('Please enter your student / phone / roll number.');
  }
  if (!trimmedTopic) {
    throw new Error('Please enter your speech presentation topic.');
  }

  const normalizedNum = normalizeStudentNumber(trimmedNumber);
  const normalizedTopicText = normalizeTopic(trimmedTopic);

  // Document ID derived from normalized student number (safely encoded)
  const docId = encodeURIComponent(normalizedNum);
  const userTopicRef = doc(db, SPEECH_TOPICS_COLLECTION, docId);
  const reservationRef = doc(db, TOPIC_RESERVATIONS_COLLECTION, encodeURIComponent(normalizedTopicText));

  await runTransaction(db, async (transaction) => {
    // 1. Check if this student number already registered a topic
    const existingUserDoc = await transaction.get(userTopicRef);
    if (existingUserDoc.exists()) {
      throw new Error(
        `A presentation topic has already been registered for number "${trimmedNumber}". You can find your topic on the board and edit it.`
      );
    }

    // 2. Check if this speech topic is already reserved
    const existingReservation = await transaction.get(reservationRef);
    if (existingReservation.exists()) {
      const resData = existingReservation.data();
      const resOwner = resData?.studentName ? ` by ${resData.studentName}` : '';
      throw new Error(
        `This topic has already been registered${resOwner}. Please choose another topic.`
      );
    }

    // 3. Atomically create topic reservation & student topic document
    transaction.set(reservationRef, {
      studentNumber: trimmedNumber,
      normalizedNumber: normalizedNum,
      studentName: trimmedName,
      topic: trimmedTopic,
      createdAt: serverTimestamp(),
    });

    transaction.set(userTopicRef, {
      studentName: trimmedName,
      studentNumber: trimmedNumber,
      normalizedNumber: normalizedNum,
      userId: normalizedNum,
      topic: trimmedTopic,
      normalizedTopic: normalizedTopicText,
      section: section ? section.trim() : '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });

  return normalizedNum;
}

/**
 * Updates an existing speech topic registered by the student.
 * Verifies topic uniqueness and releases old topic reservation if changed.
 */
export async function updateSpeechTopic(params: {
  id: string;
  studentName: string;
  studentNumber: string;
  topic: string;
  section?: string;
}): Promise<void> {
  const { id, studentName, studentNumber, topic, section } = params;

  const trimmedName = studentName.trim();
  const trimmedNumber = studentNumber.trim();
  const trimmedTopic = topic.trim();

  if (!trimmedName) {
    throw new Error('Please enter your full name.');
  }
  if (!trimmedNumber) {
    throw new Error('Please enter your student / phone / roll number.');
  }
  if (!trimmedTopic) {
    throw new Error('Please enter your speech presentation topic.');
  }

  const normalizedNum = normalizeStudentNumber(trimmedNumber);
  const newNormalizedTopic = normalizeTopic(trimmedTopic);
  const userTopicRef = doc(db, SPEECH_TOPICS_COLLECTION, id);

  await runTransaction(db, async (transaction) => {
    const userDoc = await transaction.get(userTopicRef);
    if (!userDoc.exists()) {
      throw new Error('Registration record not found.');
    }

    const currentData = userDoc.data();
    const docStudentNum = normalizeStudentNumber(currentData.studentNumber || currentData.userId || '');

    // Verify ownership via student number
    if (docStudentNum && docStudentNum !== normalizedNum) {
      throw new Error('Verification failed: The student / phone number does not match this registration.');
    }

    const oldNormalizedTopic = currentData.normalizedTopic || normalizeTopic(currentData.topic || '');
    const topicHasChanged = oldNormalizedTopic !== newNormalizedTopic;

    if (topicHasChanged) {
      const newReservationRef = doc(
        db,
        TOPIC_RESERVATIONS_COLLECTION,
        encodeURIComponent(newNormalizedTopic)
      );
      const newReservationDoc = await transaction.get(newReservationRef);
      if (
        newReservationDoc.exists() &&
        normalizeStudentNumber(newReservationDoc.data().studentNumber || '') !== normalizedNum
      ) {
        throw new Error(
          'Someone in your class has already registered this topic. Please choose another one.'
        );
      }

      // Release old reservation
      const oldReservationRef = doc(
        db,
        TOPIC_RESERVATIONS_COLLECTION,
        encodeURIComponent(oldNormalizedTopic)
      );
      transaction.delete(oldReservationRef);

      // Claim new reservation
      transaction.set(newReservationRef, {
        studentNumber: trimmedNumber,
        normalizedNumber: normalizedNum,
        studentName: trimmedName,
        topic: trimmedTopic,
        createdAt: serverTimestamp(),
      });
    }

    // Update speech topic record
    transaction.update(userTopicRef, {
      studentName: trimmedName,
      studentNumber: trimmedNumber,
      normalizedNumber: normalizedNum,
      topic: trimmedTopic,
      normalizedTopic: newNormalizedTopic,
      section: section ? section.trim() : '',
      updatedAt: serverTimestamp(),
    });
  });
}

/**
 * Deletes a student's own registration and frees the topic for others.
 */
export async function deleteSpeechTopic(id: string, verificationNumber?: string): Promise<void> {
  const userTopicRef = doc(db, SPEECH_TOPICS_COLLECTION, id);
  const userDoc = await getDoc(userTopicRef);
  if (!userDoc.exists()) return;

  const data = userDoc.data();

  // If verification number is provided, verify it matches
  if (verificationNumber) {
    const docStudentNum = normalizeStudentNumber(data.studentNumber || data.userId || '');
    const verifyNum = normalizeStudentNumber(verificationNumber);
    if (docStudentNum && docStudentNum !== verifyNum) {
      throw new Error('Verification failed: The student / phone number does not match this registration.');
    }
  }

  const normalizedTopicText = data.normalizedTopic || normalizeTopic(data.topic || '');
  const reservationRef = doc(
    db,
    TOPIC_RESERVATIONS_COLLECTION,
    encodeURIComponent(normalizedTopicText)
  );

  await deleteDoc(userTopicRef);
  try {
    await deleteDoc(reservationRef);
  } catch {
    // Reservation might have already been released
  }
}
