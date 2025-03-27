export interface ResumeSection {
  sectionName: string;
  content: string;
  confidenceScore: number;
}

export interface ConversionResult {
  text: string;
  sections: ResumeSection[];
  metadata: {
    name?: string;
    email?: string;
    phone?: string;
    skills?: string[];
    experience?: string[];
    education?: string[];
    original_filename: string;
    file_type: string;
    conversion_time: number;
    text_length: number;
  };
}