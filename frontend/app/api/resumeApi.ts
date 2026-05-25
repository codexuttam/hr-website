import axios from "axios";

const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/api`;

export const uploadResume = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await axios.post(`${BASE_URL}/upload`, formData);
  return data.parsedText;
};

export const analyzeResume = async (resumeText: string, jobDescription: string, withJD: boolean) => {
  const { data } = await axios.post(`${BASE_URL}/analyze`, { resumeText, jobDescription, withJD });
  return data.result;
};

export const generateCoverLetter = async (resumeText: string, jobDescription: string) => {
  const { data } = await axios.post(`${BASE_URL}/cover-letter`, { resumeText, jobDescription });
  return data.result;
};

export const generateInterviewQuestions = async (jobDescription: string) => {
  const { data } = await axios.post(`${BASE_URL}/interview`, { jobDescription });
  return data.result;
};
