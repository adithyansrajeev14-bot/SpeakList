import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
  runTransaction,
  serverTimestamp,
  getDoc,
  where,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { SpeechTopic, normalizeTopic } from './types';

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
          topics.push({
            id: docSnap.id,
            userId: data.userId || docSnap.id,
            studentName: data.studentName || 'Anonymous Student',
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
                fallbackTopics.push({
                  id: docSnap.id,
                  userId: data.userId || docSnap.id,
                  studentName: data.studentName || 'Anonymous Student',
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
            (fallbackErr) => {
              onError(new Error('Unable to connect to the class topic board. Please check your internet or Firebase connection.'));
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
 * Registers a new speech presentation topic.
 * Uses atomic transaction to ensure no duplicates and 1 topic per student account.
 */
export async function registerSpeechTopic(params: {
  userId: string;
  studentName: string;
  studentEmail: string;
  studentPhotoURL?: string;
  topic: string;
  section?: string;
}): Promise<void> {
  const { userId, studentName, studentEmail, studentPhotoURL, topic, section } = params;

  const trimmedName = studentName.trim();
  const trimmedTopic = topic.trim();

  if (!trimmedName) {
    throw new Error('Please enter your full name.');
  }
  if (!trimmedTopic) {
    throw new Error('Please enter your speech presentation topic.');
  }

  const normalized = normalizeTopic(trimmedTopic);
  const userTopicRef = doc(db, SPEECH_TOPICS_COLLECTION, userId);
  const reservationRef = doc(db, TOPIC_RESERVATIONS_COLLECTION, encodeURIComponent(normalized));

  await runTransaction(db, async (transaction) => {
    // 1. Check if this student already registered a topic
    const existingUserDoc = await transaction.get(userTopicRef);
    if (existingUserDoc.exists()) {
      throw new Error(
        'You have already registered a topic. You can edit your registered topic directly on the board.'
      );
    }

    // 2. Check if the topic is already reserved
    const existingReservation = await transaction.get(reservationRef);
    if (existingReservation.exists()) {
      throw new Error(
        'Someone in your class has already registered this topic. Please choose another one.'
      );
    }

    // 3. Perform atomic reservation and document creation
    transaction.set(reservationRef, {
      userId,
      topic: trimmedTopic,
      studentName: trimmedName,
      createdAt: serverTimestamp(),
    });

    transaction.set(userTopicRef, {
      userId,
      studentName: trimmedName,
      studentEmail: studentEmail || '',
      studentPhotoURL: studentPhotoURL || '',
      topic: trimmedTopic,
      normalizedTopic: normalized,
      section: section ? section.trim() : '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
}

/**
 * Updates an existing speech topic registered by the user.
 * Revalidates uniqueness and releases old reservation if topic changed.
 */
export async function updateSpeechTopic(params: {
  userId: string;
  studentName: string;
  topic: string;
  section?: string;
}): Promise<void> {
  const { userId, studentName, topic, section } = params;

  const trimmedName = studentName.trim();
  const trimmedTopic = topic.trim();

  if (!trimmedName) {
    throw new Error('Please enter your full name.');
  }
  if (!trimmedTopic) {
    throw new Error('Please enter your speech presentation topic.');
  }

  const newNormalized = normalizeTopic(trimmedTopic);
  const userTopicRef = doc(db, SPEECH_TOPICS_COLLECTION, userId);

  await runTransaction(db, async (transaction) => {
    const userDoc = await transaction.get(userTopicRef);
    if (!userDoc.exists()) {
      throw new Error('Registration record not found.');
    }

    const currentData = userDoc.data();
    if (currentData.userId !== userId) {
      throw new Error('Unauthorized: You can only edit your own registered topic.');
    }

    const oldNormalized = currentData.normalizedTopic || normalizeTopic(currentData.topic || '');
    const topicHasChanged = oldNormalized !== newNormalized;

    if (topicHasChanged) {
      const newReservationRef = doc(db, TOPIC_RESERVATIONS_COLLECTION, encodeURIComponent(newNormalized));
      const newReservationDoc = await transaction.get(newReservationRef);
      if (newReservationDoc.exists() && newReservationDoc.data().userId !== userId) {
        throw new Error(
          'Someone in your class has already registered this topic. Please choose another one.'
        );
      }

      // Release old reservation
      const oldReservationRef = doc(db, TOPIC_RESERVATIONS_COLLECTION, encodeURIComponent(oldNormalized));
      transaction.delete(oldReservationRef);

      // Claim new reservation
      transaction.set(newReservationRef, {
        userId,
        topic: trimmedTopic,
        studentName: trimmedName,
        createdAt: serverTimestamp(),
      });
    }

    // Update student topic document
    transaction.update(userTopicRef, {
      studentName: trimmedName,
      topic: trimmedTopic,
      normalizedTopic: newNormalized,
      section: section ? section.trim() : '',
      updatedAt: serverTimestamp(),
    });
  });
}

/**
 * Deletes a student's own registration and frees the topic.
 */
export async function deleteSpeechTopic(userId: string): Promise<void> {
  const userTopicRef = doc(db, SPEECH_TOPICS_COLLECTION, userId);
  const userDoc = await getDoc(userTopicRef);
  if (!userDoc.exists()) return;

  const data = userDoc.data();
  if (data.userId !== userId) {
    throw new Error('Unauthorized: You can only remove your own topic.');
  }

  const normalized = data.normalizedTopic || normalizeTopic(data.topic || '');
  const reservationRef = doc(db, TOPIC_RESERVATIONS_COLLECTION, encodeURIComponent(normalized));

  await deleteDoc(userTopicRef);
  try {
    await deleteDoc(reservationRef);
  } catch {
    // Reservation might have already been removed
  }
}
