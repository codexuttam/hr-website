const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/api`;

export const analyzeResume = async (resumeText: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: resumeText }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error analyzing resume:', error);
    throw error;
  }
};

export const generateCoverLetter = async (jobDescription: string, resumeData: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}/cover-letter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobDescription,
        resumeData
      }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error generating cover letter:', error);
    throw error;
  }
};

export const prepareInterview = async (jobDescription: string, resumeData: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}/interview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobDescription,
        resumeData
      }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error preparing interview:', error);
    throw error;
  }
};

export const rephraseContent = async (content: string, tone: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/rephrase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: content,
        tone
      }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error rephrasing content:', error);
    throw error;
  }
};
