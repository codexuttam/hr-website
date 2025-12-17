/**
 * Supabase-integrated ATS Service using Hugging Face ResumeATS model
 * Uses the specific model: girishwangikar/ResumeATS
 */

import { supabase } from '@/lib/supabase';

export interface SupabaseATSAnalysis {
  overall_score: number;
  keyword_analysis: {
    matching_keywords: string[];
    missing_keywords: string[];
    keyword_density: number;
    relevance_score: number;
  };
  content_analysis: {
    readability_score: number;
    professional_tone_score: number;
    action_verbs_count: number;
    quantified_achievements: number;
  };
  structure_analysis: {
    format_score: number;
    sections_completeness: number;
    length_appropriateness: number;
    bullet_point_usage: number;
  };
  suggestions: {
    high_priority: string[];
    medium_priority: string[];
    low_priority: string[];
  };
  detailed_feedback: string;
  industry_alignment: {
    score: number;
    relevant_skills: string[];
    trending_keywords: string[];
  };
  model_prediction?: any; // Raw model output
}

export class SupabaseATSService {
  private static readonly SUPABASE_URL = 'https://hrlncrvcwhvymwsfmyxi.supabase.co';
  private static readonly HF_MODEL_URL = 'https://api-inference.huggingface.co/models/girishwangikar/ResumeATS';
  private static readonly HF_API_KEY = process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY;

  /**
   * Test the Hugging Face API connection
   */
  static async testAPIConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      if (!this.HF_API_KEY) {
        return {
          success: false,
          message: 'Hugging Face API key not configured'
        };
      }

      console.log('Testing Hugging Face API connection...');
      
      const response = await fetch(this.HF_MODEL_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: {
            resume: 'Test resume content',
            job_description: 'Test job description'
          }
        }),
      });

      if (response.ok) {
        return {
          success: true,
          message: 'API connection successful',
          details: { status: response.status }
        };
      } else {
        const errorText = await response.text().catch(() => 'Unknown error');
        return {
          success: false,
          message: `API connection failed: ${response.status}`,
          details: { status: response.status, error: errorText }
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error: error instanceof Error ? error.message : error }
      };
    }
  }

  /**
   * Main ATS analysis function using Supabase and Hugging Face ResumeATS model
   */
  static async analyzeResumeWithSupabaseATS(
    resumeText: string,
    jobDescription: string,
    userId?: number
  ): Promise<SupabaseATSAnalysis> {
    console.log('Starting Supabase ATS analysis with ResumeATS model...');

    try {
      // Step 1: Call Hugging Face ResumeATS model
      console.log('Step 1: Calling ResumeATS model...');
      const modelPrediction = await this.callResumeATSModel(resumeText, jobDescription);
      
      // Step 2: Process and enhance the model output
      console.log('Step 2: Processing model output...');
      const enhancedAnalysis = await this.processModelOutput(modelPrediction, resumeText, jobDescription);
      
      // Step 3: Store analysis in Supabase for future reference
      if (userId) {
        console.log('Step 3: Storing analysis in Supabase...');
        try {
          await this.storeAnalysisInSupabase(enhancedAnalysis, resumeText, jobDescription, userId);
        } catch (storageError) {
          console.warn('Failed to store analysis in Supabase, but continuing with results:', storageError);
          // Don't fail the entire analysis if storage fails
        }
      }

      console.log('ResumeATS analysis completed successfully');
      return enhancedAnalysis;
    } catch (error) {
      console.error('Supabase ATS analysis failed:', error);
      
      // Provide more specific error information
      let errorMessage = 'ResumeATS model analysis failed';
      if (error instanceof Error) {
        if (error.message.includes('Network error')) {
          errorMessage = 'Network connection issue with Hugging Face API';
        } else if (error.message.includes('API key')) {
          errorMessage = 'Hugging Face API key configuration issue';
        } else if (error.message.includes('loading')) {
          errorMessage = 'ResumeATS model is starting up (this can take 30-60 seconds)';
        } else {
          errorMessage = error.message;
        }
      }
      
      console.log(`Falling back to enhanced rule-based analysis due to: ${errorMessage}`);
      
      // Fallback to enhanced rule-based analysis
      const fallbackResult = await this.fallbackAnalysis(resumeText, jobDescription);
      
      // Add a note about the fallback in the feedback
      fallbackResult.detailed_feedback = `⚠️ Note: Using enhanced rule-based analysis (${errorMessage})\n\n${fallbackResult.detailed_feedback}`;
      
      return fallbackResult;
    }
  }

  /**
   * Call the specific Hugging Face ResumeATS model
   */
  private static async callResumeATSModel(resumeText: string, jobDescription: string): Promise<any> {
    if (!this.HF_API_KEY) {
      console.error('Hugging Face API key not configured');
      throw new Error('Hugging Face API key not configured');
    }

    console.log('Calling ResumeATS model...', {
      modelUrl: this.HF_MODEL_URL,
      hasApiKey: !!this.HF_API_KEY,
      resumeLength: resumeText.length,
      jobDescLength: jobDescription.length
    });

    // Prepare input for the ResumeATS model
    const input = {
      resume: resumeText.substring(0, 2000), // Limit text length for API
      job_description: jobDescription.substring(0, 1500)
    };

    const requestBody = {
      inputs: input,
      parameters: {
        return_full_text: false,
        max_length: 512,
        temperature: 0.7
      }
    };

    console.log('Request payload:', JSON.stringify(requestBody, null, 2));

    try {
      const response = await fetch(this.HF_MODEL_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.HF_API_KEY}`,
          'Content-Type': 'application/json',
          'User-Agent': 'ResumeATS-Client/1.0'
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status, response.statusText);

      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
          console.error('ResumeATS model error response:', errorText);
        } catch (textError) {
          console.error('Could not read error response:', textError);
        }
        
        // Handle specific error cases
        if (response.status === 503) {
          throw new Error('ResumeATS model is currently loading. Please wait a moment and try again.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        } else if (response.status === 401) {
          throw new Error('Invalid Hugging Face API key. Please check your configuration.');
        } else {
          throw new Error(`ResumeATS model failed: ${response.status} - ${errorText || response.statusText}`);
        }
      }

      const result = await response.json();
      console.log('ResumeATS model response received:', result);
      
      return result;
    } catch (fetchError) {
      console.error('Fetch error details:', fetchError);
      
      if (fetchError instanceof TypeError && fetchError.message.includes('Failed to fetch')) {
        throw new Error('Network error: Unable to connect to Hugging Face API. Please check your internet connection and try again.');
      }
      
      throw fetchError;
    }
  }

  /**
   * Process and enhance the model output
   */
  private static async processModelOutput(
    modelOutput: any,
    resumeText: string,
    jobDescription: string
  ): Promise<SupabaseATSAnalysis> {
    console.log('Processing model output...');

    // Extract or calculate scores from model output
    let overallScore = 75; // Default score
    
    // Try to extract score from model output
    if (modelOutput && Array.isArray(modelOutput) && modelOutput.length > 0) {
      const firstResult = modelOutput[0];
      if (firstResult.score) {
        overallScore = Math.round(firstResult.score * 100);
      } else if (firstResult.generated_text) {
        // Try to extract score from generated text
        const scoreMatch = firstResult.generated_text.match(/score[:\s]*(\d+)/i);
        if (scoreMatch) {
          overallScore = parseInt(scoreMatch[1]);
        }
      }
    }

    // Perform detailed analysis
    const keywordAnalysis = this.analyzeKeywords(resumeText, jobDescription);
    const contentAnalysis = this.analyzeContent(resumeText);
    const structureAnalysis = this.analyzeStructure(resumeText);
    const industryAlignment = this.analyzeIndustryAlignment(resumeText, jobDescription);
    const suggestions = this.generateSuggestions(resumeText, jobDescription, keywordAnalysis, overallScore);

    // Adjust overall score based on detailed analysis
    const calculatedScore = Math.round(
      (keywordAnalysis.relevance_score * 0.3) +
      (contentAnalysis.readability_score * 0.2) +
      (structureAnalysis.format_score * 0.2) +
      (industryAlignment.score * 0.3)
    );

    // Use the higher of model score or calculated score
    const finalScore = Math.max(overallScore, calculatedScore);

    return {
      overall_score: finalScore,
      keyword_analysis: keywordAnalysis,
      content_analysis: contentAnalysis,
      structure_analysis: structureAnalysis,
      suggestions,
      detailed_feedback: this.generateDetailedFeedback(finalScore, keywordAnalysis, contentAnalysis, modelOutput),
      industry_alignment: industryAlignment,
      model_prediction: modelOutput
    };
  }

  /**
   * Store analysis results in Supabase
   */
  private static async storeAnalysisInSupabase(
    analysis: SupabaseATSAnalysis,
    resumeText: string,
    jobDescription: string,
    userId: number
  ): Promise<void> {
    try {
      console.log('Storing analysis in Supabase...');

      const { error } = await supabase
        .from('ats_analysis_history')
        .insert([
          {
            user_id: userId,
            resume_text: resumeText.substring(0, 5000), // Limit storage size
            job_description: jobDescription.substring(0, 3000),
            overall_score: analysis.overall_score,
            analysis_data: {
              keyword_analysis: analysis.keyword_analysis,
              content_analysis: analysis.content_analysis,
              structure_analysis: analysis.structure_analysis,
              industry_alignment: analysis.industry_alignment,
              model_prediction: analysis.model_prediction
            },
            suggestions: analysis.suggestions,
            detailed_feedback: analysis.detailed_feedback,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) {
        console.error('Failed to store analysis in Supabase:', error);
        // Don't throw error, just log it
      } else {
        console.log('Analysis stored successfully in Supabase');
      }
    } catch (error) {
      console.error('Supabase storage error:', error);
      // Don't throw error, just log it
    }
  }

  /**
   * Retrieve analysis history from Supabase
   */
  static async getAnalysisHistory(userId: number, limit: number = 10): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('ats_analysis_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Failed to retrieve analysis history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error retrieving analysis history:', error);
      return [];
    }
  }

  /**
   * Enhanced keyword analysis
   */
  private static analyzeKeywords(resumeText: string, jobDescription: string) {
    const jobKeywords = this.extractKeywords(jobDescription);
    const resumeKeywords = this.extractKeywords(resumeText);
    
    // Find semantic matches
    const matching_keywords = jobKeywords.filter(jobKeyword => 
      resumeKeywords.some(resumeKeyword => 
        this.areKeywordsSimilar(jobKeyword, resumeKeyword)
      )
    );

    const missing_keywords = jobKeywords.filter(keyword => 
      !matching_keywords.some(match => this.areKeywordsSimilar(keyword, match))
    ).slice(0, 15);

    const keyword_density = Math.round((matching_keywords.length / Math.max(jobKeywords.length, 1)) * 100);
    const relevance_score = Math.min(100, keyword_density + this.calculateSemanticBonus(resumeText, jobDescription));

    return {
      matching_keywords: matching_keywords.slice(0, 20),
      missing_keywords,
      keyword_density,
      relevance_score
    };
  }

  /**
   * Content analysis
   */
  private static analyzeContent(resumeText: string) {
    return {
      readability_score: this.calculateReadability(resumeText),
      professional_tone_score: this.analyzeProfessionalTone(resumeText),
      action_verbs_count: this.countActionVerbs(resumeText),
      quantified_achievements: this.countQuantifiedAchievements(resumeText)
    };
  }

  /**
   * Structure analysis
   */
  private static analyzeStructure(resumeText: string) {
    const sections = this.identifySections(resumeText);
    const bulletPoints = (resumeText.match(/[•\-\*]/g) || []).length;
    const wordCount = resumeText.split(/\s+/).length;
    
    const format_score = Math.min(100, 
      (sections.completeness * 0.4) +
      (Math.min(bulletPoints / 10, 1) * 30) +
      (this.getWordCountScore(wordCount) * 0.3)
    );

    return {
      format_score: Math.round(format_score),
      sections_completeness: sections.completeness,
      length_appropriateness: this.getWordCountScore(wordCount),
      bullet_point_usage: Math.min(bulletPoints, 20)
    };
  }

  /**
   * Industry alignment analysis
   */
  private static analyzeIndustryAlignment(resumeText: string, jobDescription: string) {
    const industryKeywords = this.extractIndustryKeywords(jobDescription);
    const resumeSkills = this.extractSkills(resumeText);
    
    const alignment = industryKeywords.filter(keyword =>
      resumeSkills.some(skill => 
        skill.toLowerCase().includes(keyword.toLowerCase()) ||
        keyword.toLowerCase().includes(skill.toLowerCase())
      )
    );

    return {
      score: Math.round((alignment.length / Math.max(industryKeywords.length, 1)) * 100),
      relevant_skills: alignment.slice(0, 10),
      trending_keywords: industryKeywords.slice(0, 15)
    };
  }

  /**
   * Generate prioritized suggestions
   */
  private static generateSuggestions(
    resumeText: string,
    jobDescription: string,
    keywordAnalysis: any,
    overallScore: number
  ) {
    const high_priority = [];
    const medium_priority = [];
    const low_priority = [];

    // High priority suggestions based on score
    if (overallScore < 60) {
      high_priority.push('Your resume needs significant optimization for ATS compatibility');
    }
    if (keywordAnalysis.keyword_density < 30) {
      high_priority.push('Add more relevant keywords from the job description');
    }
    if (this.countQuantifiedAchievements(resumeText) < 3) {
      high_priority.push('Include more quantified achievements with specific numbers');
    }

    // Medium priority suggestions
    if (this.countActionVerbs(resumeText) < 5) {
      medium_priority.push('Use stronger action verbs to start bullet points');
    }
    if (!resumeText.toLowerCase().includes('summary')) {
      medium_priority.push('Add a professional summary section');
    }
    if (this.calculateReadability(resumeText) < 70) {
      medium_priority.push('Improve readability with shorter, clearer sentences');
    }

    // Low priority suggestions
    low_priority.push('Ensure consistent formatting throughout');
    low_priority.push('Consider adding relevant certifications');

    return {
      high_priority: high_priority.slice(0, 3),
      medium_priority: medium_priority.slice(0, 3),
      low_priority: low_priority.slice(0, 2)
    };
  }

  /**
   * Generate detailed feedback incorporating model output
   */
  private static generateDetailedFeedback(
    overallScore: number,
    keywordAnalysis: any,
    contentAnalysis: any,
    modelOutput: any
  ): string {
    let feedback = `🤖 AI-POWERED ATS ANALYSIS (ResumeATS Model)\n\n`;
    feedback += `Your resume scored ${overallScore}/100 using our specialized ATS model. `;

    if (overallScore >= 80) {
      feedback += 'Excellent! Your resume is well-optimized for ATS systems. ';
    } else if (overallScore >= 60) {
      feedback += 'Good foundation with room for improvement. ';
    } else {
      feedback += 'Significant optimization needed for better ATS compatibility. ';
    }

    feedback += `\n\n📊 DETAILED BREAKDOWN:\n`;
    feedback += `• Keyword Relevance: ${keywordAnalysis.relevance_score}%\n`;
    feedback += `• Content Quality: ${contentAnalysis.readability_score}%\n`;
    feedback += `• Professional Tone: ${contentAnalysis.professional_tone_score}%\n`;
    feedback += `• Action Verbs: ${contentAnalysis.action_verbs_count} found\n`;
    feedback += `• Quantified Results: ${contentAnalysis.quantified_achievements} found\n`;

    // Add model-specific insights if available
    if (modelOutput && Array.isArray(modelOutput) && modelOutput.length > 0) {
      const modelResult = modelOutput[0];
      if (modelResult.generated_text) {
        feedback += `\n🎯 AI MODEL INSIGHTS:\n${modelResult.generated_text}`;
      }
    }

    return feedback;
  }

  /**
   * Fallback analysis when model fails
   */
  private static async fallbackAnalysis(
    resumeText: string,
    jobDescription: string
  ): Promise<SupabaseATSAnalysis> {
    console.log('Using fallback analysis...');

    const keywordAnalysis = this.analyzeKeywords(resumeText, jobDescription);
    const contentAnalysis = this.analyzeContent(resumeText);
    const structureAnalysis = this.analyzeStructure(resumeText);
    const industryAlignment = this.analyzeIndustryAlignment(resumeText, jobDescription);

    const overall_score = Math.round(
      (keywordAnalysis.relevance_score * 0.3) +
      (contentAnalysis.readability_score * 0.2) +
      (structureAnalysis.format_score * 0.2) +
      (industryAlignment.score * 0.3)
    );

    const suggestions = this.generateSuggestions(resumeText, jobDescription, keywordAnalysis, overall_score);

    return {
      overall_score,
      keyword_analysis: keywordAnalysis,
      content_analysis: contentAnalysis,
      structure_analysis: structureAnalysis,
      suggestions,
      detailed_feedback: this.generateDetailedFeedback(overall_score, keywordAnalysis, contentAnalysis, null),
      industry_alignment: industryAlignment
    };
  }

  // Utility methods (similar to HuggingFaceService but optimized for ResumeATS model)
  private static extractKeywords(text: string): string[] {
    const commonWords = new Set([
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after'
    ]);
    
    return text.toLowerCase()
      .split(/\W+/)
      .filter(word => word.length > 2 && !commonWords.has(word))
      .slice(0, 50);
  }

  private static areKeywordsSimilar(keyword1: string, keyword2: string): boolean {
    const k1 = keyword1.toLowerCase();
    const k2 = keyword2.toLowerCase();
    
    if (k1 === k2) return true;
    if (k1.includes(k2) || k2.includes(k1)) return true;
    
    // Common synonyms for ATS
    const synonyms: { [key: string]: string[] } = {
      'javascript': ['js', 'ecmascript', 'node'],
      'python': ['py', 'django', 'flask'],
      'management': ['managing', 'manager', 'lead', 'leadership'],
      'development': ['developing', 'developer', 'dev', 'coding'],
      'analysis': ['analyzing', 'analyst', 'analyze', 'analytics']
    };
    
    for (const [key, values] of Object.entries(synonyms)) {
      if ((k1 === key && values.includes(k2)) || (k2 === key && values.includes(k1))) {
        return true;
      }
    }
    
    return false;
  }

  private static calculateSemanticBonus(resumeText: string, jobDescription: string): number {
    const resumeWords = new Set(resumeText.toLowerCase().split(/\W+/));
    const jobWords = new Set(jobDescription.toLowerCase().split(/\W+/));
    
    const intersection = new Set([...resumeWords].filter(x => jobWords.has(x)));
    const union = new Set([...resumeWords, ...jobWords]);
    
    return Math.round((intersection.size / union.size) * 20);
  }

  private static calculateReadability(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const avgWordsPerSentence = words.length / Math.max(sentences.length, 1);
    
    let score = 100;
    if (avgWordsPerSentence > 25) score -= 30;
    else if (avgWordsPerSentence > 20) score -= 15;
    else if (avgWordsPerSentence < 8) score -= 10;
    
    const bulletPoints = (text.match(/[•\-\*]/g) || []).length;
    if (bulletPoints > 5) score += 10;
    
    return Math.max(0, Math.min(100, score));
  }

  private static analyzeProfessionalTone(text: string): number {
    let score = 70;
    
    const professionalWords = ['achieved', 'managed', 'led', 'developed', 'implemented', 'improved'];
    const professionalCount = professionalWords.filter(word => text.toLowerCase().includes(word)).length;
    score += Math.min(20, professionalCount * 3);
    
    const casualWords = ['stuff', 'things', 'lots', 'really', 'very'];
    const casualCount = casualWords.filter(word => text.toLowerCase().includes(word)).length;
    score -= casualCount * 5;
    
    return Math.max(0, Math.min(100, score));
  }

  private static countActionVerbs(text: string): number {
    const actionVerbs = [
      'achieved', 'managed', 'led', 'developed', 'created', 'implemented', 'designed',
      'improved', 'increased', 'reduced', 'delivered', 'executed', 'coordinated',
      'supervised', 'analyzed', 'optimized', 'streamlined', 'facilitated'
    ];
    
    return actionVerbs.filter(verb => text.toLowerCase().includes(verb)).length;
  }

  private static countQuantifiedAchievements(text: string): number {
    const patterns = [
      /\d+%/g,
      /\$\d+/g,
      /\d+k/gi,
      /\d+\s*(million|billion)/gi,
      /\d+\s*(hours|days|weeks|months|years)/gi,
      /\d+\s*(people|employees|team)/gi
    ];
    
    return patterns.reduce((count, pattern) => {
      return count + (text.match(pattern) || []).length;
    }, 0);
  }

  private static identifySections(text: string) {
    const sections = {
      contact: /email|phone|linkedin|github/i.test(text),
      summary: /summary|objective|profile/i.test(text),
      experience: /experience|work|employment/i.test(text),
      education: /education|degree|university/i.test(text),
      skills: /skills|technologies|tools/i.test(text)
    };
    
    const completeness = Object.values(sections).filter(Boolean).length * 20;
    return { completeness, sections };
  }

  private static getWordCountScore(wordCount: number): number {
    if (wordCount >= 300 && wordCount <= 600) return 100;
    if (wordCount >= 200 && wordCount <= 800) return 85;
    return 60;
  }

  private static extractIndustryKeywords(jobDescription: string): string[] {
    const keywords = [
      'javascript', 'python', 'react', 'node', 'aws', 'docker', 'sql', 'api',
      'management', 'leadership', 'analysis', 'communication', 'project', 'team'
    ];
    
    return keywords.filter(keyword => 
      jobDescription.toLowerCase().includes(keyword)
    );
  }

  private static extractSkills(resumeText: string): string[] {
    const skillsMatch = resumeText.match(/skills[\s\S]*?(?=\n\n|\n[A-Z]|$)/i);
    const skillsText = skillsMatch ? skillsMatch[0] : resumeText;
    
    return skillsText.split(/[,\n•\-]/)
      .map(skill => skill.trim())
      .filter(skill => skill.length > 2 && skill.length < 30)
      .slice(0, 20);
  }
}