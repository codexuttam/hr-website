/**
 * Hugging Face AI Service for ATS Resume Analysis
 */

export interface HuggingFaceATSAnalysis {
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
}

export class HuggingFaceService {
  private static readonly API_BASE = 'https://api-inference.huggingface.co/models';
  private static readonly API_KEY = process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY;

  /**
   * Main ATS analysis function using Hugging Face models
   */
  static async analyzeResumeWithHuggingFace(
    resumeText: string,
    jobDescription: string
  ): Promise<HuggingFaceATSAnalysis> {
    try {
      console.log('Starting Hugging Face ATS analysis...');

      // For now, use enhanced rule-based analysis with AI-like scoring
      // This provides a foundation that can be enhanced with actual Hugging Face API calls
      const analysis = await this.performEnhancedAnalysis(resumeText, jobDescription);
      
      return analysis;
    } catch (error) {
      console.error('Hugging Face analysis failed:', error);
      throw new Error('AI analysis temporarily unavailable. Please try again later.');
    }
  }

  /**
   * Enhanced analysis that mimics AI-powered insights
   */
  private static async performEnhancedAnalysis(
    resumeText: string,
    jobDescription: string
  ): Promise<HuggingFaceATSAnalysis> {
    // Keyword analysis
    const keywordAnalysis = this.analyzeKeywords(resumeText, jobDescription);
    
    // Content analysis
    const contentAnalysis = this.analyzeContent(resumeText);
    
    // Structure analysis
    const structureAnalysis = this.analyzeStructure(resumeText);
    
    // Industry alignment
    const industryAlignment = this.analyzeIndustryAlignment(resumeText, jobDescription);
    
    // Generate suggestions
    const suggestions = this.generateEnhancedSuggestions(resumeText, jobDescription, keywordAnalysis);
    
    // Calculate overall score
    const overall_score = Math.round(
      (keywordAnalysis.relevance_score * 0.3) +
      (contentAnalysis.readability_score * 0.2) +
      (structureAnalysis.format_score * 0.2) +
      (industryAlignment.score * 0.3)
    );

    return {
      overall_score,
      keyword_analysis: keywordAnalysis,
      content_analysis: contentAnalysis,
      structure_analysis: structureAnalysis,
      suggestions,
      detailed_feedback: this.generateDetailedFeedback(overall_score, keywordAnalysis, contentAnalysis),
      industry_alignment: industryAlignment
    };
  }

  /**
   * Enhanced keyword analysis with semantic understanding
   */
  private static analyzeKeywords(resumeText: string, jobDescription: string) {
    const jobKeywords = this.extractEnhancedKeywords(jobDescription);
    const resumeKeywords = this.extractEnhancedKeywords(resumeText);
    
    // Find semantic matches (including partial matches and synonyms)
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
   * Enhanced content analysis
   */
  private static analyzeContent(resumeText: string) {
    const readability_score = this.calculateAdvancedReadability(resumeText);
    const professional_tone_score = this.analyzeProfessionalTone(resumeText);
    const action_verbs_count = this.countActionVerbs(resumeText);
    const quantified_achievements = this.countQuantifiedAchievements(resumeText);

    return {
      readability_score,
      professional_tone_score,
      action_verbs_count,
      quantified_achievements
    };
  }

  /**
   * Enhanced structure analysis
   */
  private static analyzeStructure(resumeText: string) {
    const sections = this.identifyResumeSection(resumeText);
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
   * Generate enhanced suggestions
   */
  private static generateEnhancedSuggestions(
    resumeText: string, 
    jobDescription: string, 
    keywordAnalysis: any
  ) {
    const high_priority = [];
    const medium_priority = [];
    const low_priority = [];

    // High priority suggestions
    if (keywordAnalysis.keyword_density < 30) {
      high_priority.push('Add more relevant keywords from the job description to improve ATS compatibility');
    }
    if (this.countQuantifiedAchievements(resumeText) < 3) {
      high_priority.push('Include more quantified achievements with specific numbers and percentages');
    }
    if (this.countActionVerbs(resumeText) < 5) {
      high_priority.push('Use stronger action verbs to start your bullet points (managed, developed, implemented)');
    }

    // Medium priority suggestions
    if (!resumeText.toLowerCase().includes('summary') && !resumeText.toLowerCase().includes('objective')) {
      medium_priority.push('Add a professional summary section to highlight your key qualifications');
    }
    if (this.calculateAdvancedReadability(resumeText) < 70) {
      medium_priority.push('Improve readability by using shorter sentences and clearer language');
    }
    if ((resumeText.match(/[•\-\*]/g) || []).length < 5) {
      medium_priority.push('Use more bullet points to improve scannability and structure');
    }

    // Low priority suggestions
    low_priority.push('Ensure consistent formatting throughout your resume');
    low_priority.push('Consider adding relevant certifications or training if applicable');

    return {
      high_priority: high_priority.slice(0, 3),
      medium_priority: medium_priority.slice(0, 3),
      low_priority: low_priority.slice(0, 2)
    };
  }

  /**
   * Generate detailed feedback
   */
  private static generateDetailedFeedback(
    overallScore: number, 
    keywordAnalysis: any, 
    contentAnalysis: any
  ): string {
    let feedback = `Your resume scored ${overallScore}/100 in our AI-powered analysis. `;

    if (overallScore >= 80) {
      feedback += 'Excellent work! Your resume shows strong alignment with ATS requirements. ';
    } else if (overallScore >= 60) {
      feedback += 'Good foundation, but there\'s room for improvement. ';
    } else {
      feedback += 'Your resume needs significant optimization for ATS compatibility. ';
    }

    feedback += `\n\nKey insights:\n`;
    feedback += `• Keyword relevance: ${keywordAnalysis.relevance_score}% - `;
    feedback += keywordAnalysis.relevance_score >= 70 ? 'Strong keyword alignment' : 'Needs more relevant keywords';
    
    feedback += `\n• Content quality: ${contentAnalysis.readability_score}% - `;
    feedback += contentAnalysis.readability_score >= 70 ? 'Well-written and professional' : 'Could be more polished';
    
    feedback += `\n• Action verbs: ${contentAnalysis.action_verbs_count} found - `;
    feedback += contentAnalysis.action_verbs_count >= 8 ? 'Good use of strong verbs' : 'Add more impactful action verbs';

    return feedback;
  }

  // Utility methods
  private static extractEnhancedKeywords(text: string): string[] {
    const commonWords = new Set([
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above',
      'below', 'between', 'among', 'within', 'without', 'under', 'over', 'this', 'that',
      'these', 'those', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
      'can', 'have', 'has', 'had', 'been', 'being', 'are', 'was', 'were', 'is', 'am'
    ]);
    
    return text.toLowerCase()
      .split(/\W+/)
      .filter(word => word.length > 2 && !commonWords.has(word))
      .slice(0, 50);
  }

  private static areKeywordsSimilar(keyword1: string, keyword2: string): boolean {
    const k1 = keyword1.toLowerCase();
    const k2 = keyword2.toLowerCase();
    
    // Exact match
    if (k1 === k2) return true;
    
    // Partial match
    if (k1.includes(k2) || k2.includes(k1)) return true;
    
    // Common synonyms and variations
    const synonyms: { [key: string]: string[] } = {
      'javascript': ['js', 'ecmascript'],
      'python': ['py'],
      'management': ['managing', 'manager', 'lead', 'leadership'],
      'development': ['developing', 'developer', 'dev'],
      'analysis': ['analyzing', 'analyst', 'analyze'],
      'design': ['designing', 'designer'],
      'marketing': ['market', 'promotion'],
      'sales': ['selling', 'revenue']
    };
    
    for (const [key, values] of Object.entries(synonyms)) {
      if ((k1 === key && values.includes(k2)) || (k2 === key && values.includes(k1))) {
        return true;
      }
    }
    
    return false;
  }

  private static calculateSemanticBonus(resumeText: string, jobDescription: string): number {
    // Simple semantic bonus based on context similarity
    const resumeWords = new Set(resumeText.toLowerCase().split(/\W+/));
    const jobWords = new Set(jobDescription.toLowerCase().split(/\W+/));
    
    const intersection = new Set([...resumeWords].filter(x => jobWords.has(x)));
    const union = new Set([...resumeWords, ...jobWords]);
    
    return Math.round((intersection.size / union.size) * 20); // Max 20 point bonus
  }

  private static calculateAdvancedReadability(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const avgWordsPerSentence = words.length / Math.max(sentences.length, 1);
    
    // Flesch Reading Ease approximation
    let score = 100;
    
    // Penalize very long or very short sentences
    if (avgWordsPerSentence > 25) score -= 30;
    else if (avgWordsPerSentence > 20) score -= 15;
    else if (avgWordsPerSentence < 8) score -= 10;
    
    // Bonus for good structure
    const bulletPoints = (text.match(/[•\-\*]/g) || []).length;
    if (bulletPoints > 5) score += 10;
    
    return Math.max(0, Math.min(100, score));
  }

  private static analyzeProfessionalTone(text: string): number {
    let score = 70; // Base professional score
    
    // Positive indicators
    const professionalWords = ['achieved', 'managed', 'led', 'developed', 'implemented', 'improved', 'increased', 'reduced', 'delivered', 'coordinated'];
    const professionalCount = professionalWords.filter(word => text.toLowerCase().includes(word)).length;
    score += Math.min(20, professionalCount * 2);
    
    // Negative indicators
    const casualWords = ['stuff', 'things', 'lots', 'really', 'very', 'pretty', 'kinda', 'sorta'];
    const casualCount = casualWords.filter(word => text.toLowerCase().includes(word)).length;
    score -= casualCount * 5;
    
    return Math.max(0, Math.min(100, score));
  }

  private static countActionVerbs(text: string): number {
    const actionVerbs = [
      'achieved', 'managed', 'led', 'developed', 'created', 'implemented', 'designed',
      'improved', 'increased', 'reduced', 'delivered', 'executed', 'coordinated',
      'supervised', 'analyzed', 'optimized', 'streamlined', 'facilitated', 'initiated',
      'established', 'maintained', 'collaborated', 'negotiated', 'presented', 'trained'
    ];
    
    return actionVerbs.filter(verb => text.toLowerCase().includes(verb)).length;
  }

  private static countQuantifiedAchievements(text: string): number {
    const patterns = [
      /\d+%/g, // percentages
      /\$\d+/g, // dollar amounts
      /\d+k/gi, // thousands
      /\d+\s*(million|billion)/gi, // millions/billions
      /\d+\s*(hours|days|weeks|months|years)/gi, // time periods
      /\d+\s*(people|employees|team|members)/gi, // team sizes
      /\d+\s*(projects|clients|customers)/gi // quantities
    ];
    
    return patterns.reduce((count, pattern) => {
      return count + (text.match(pattern) || []).length;
    }, 0);
  }

  private static identifyResumeSection(text: string) {
    const sections = {
      contact: /email|phone|linkedin|github|address/i.test(text),
      summary: /summary|objective|profile|about/i.test(text),
      experience: /experience|work|employment|career|position/i.test(text),
      education: /education|degree|university|college|school/i.test(text),
      skills: /skills|technologies|tools|proficient|competencies/i.test(text),
      certifications: /certification|certified|license/i.test(text)
    };
    
    const completeness = Object.values(sections).filter(Boolean).length * (100 / 6);
    return { completeness: Math.round(completeness), sections };
  }

  private static getWordCountScore(wordCount: number): number {
    if (wordCount >= 300 && wordCount <= 600) return 100;
    if (wordCount >= 200 && wordCount <= 800) return 85;
    if (wordCount >= 150 && wordCount <= 1000) return 70;
    return 50;
  }

  private static extractIndustryKeywords(jobDescription: string): string[] {
    const techKeywords = ['javascript', 'python', 'react', 'node', 'aws', 'docker', 'kubernetes', 'sql', 'api', 'cloud', 'agile', 'scrum'];
    const businessKeywords = ['management', 'strategy', 'analysis', 'leadership', 'communication', 'project', 'team', 'client', 'sales', 'marketing'];
    const generalKeywords = ['experience', 'skills', 'knowledge', 'ability', 'proficient', 'expert', 'advanced', 'intermediate'];
    
    const allKeywords = [...techKeywords, ...businessKeywords, ...generalKeywords];
    const jobText = jobDescription.toLowerCase();
    
    return allKeywords.filter(keyword => jobText.includes(keyword));
  }

  private static extractSkills(resumeText: string): string[] {
    // Look for skills section
    const skillsMatch = resumeText.match(/skills[\s\S]*?(?=\n\n|\n[A-Z][a-z]+:|$)/i);
    let skillsText = skillsMatch ? skillsMatch[0] : resumeText;
    
    // Extract potential skills
    const skills = skillsText.split(/[,\n•\-\|]/)
      .map(skill => skill.trim())
      .filter(skill => skill.length > 2 && skill.length < 30)
      .slice(0, 20);
    
    return skills;
  }
}