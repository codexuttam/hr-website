export async function createFeedback({ interviewId, userId, transcript, feedbackId }: {
  interviewId: string;
  userId: string;
  transcript: { role: string; content: string }[];
  feedbackId?: string;
}) {
  // Placeholder implementation – in a real app you would store the feedback in your DB.
  console.log('Creating feedback for interview', interviewId, 'user', userId);
  console.log('Transcript length:', transcript.length);

  // Simulate async DB write with a small delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  return {
    success: true,
    // Return existing feedbackId if provided, otherwise generate a mock one.
    feedbackId: feedbackId ?? `fb_${Date.now()}`,
  };
}
