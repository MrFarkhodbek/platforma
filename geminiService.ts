
import { GoogleGenAI, Type } from "@google/genai";
import { SyllabusResult, GeneratedContent, DifficultyLevel, AppLanguage, AcademicLevel } from "./types";

const cleanJsonResponse = (text: string) => {
  if (!text) return '{}';
  let cleaned = text.trim();
  // Markdown kod bloklarini olib tashlash
  cleaned = cleaned.replace(/^```json\s*/, '').replace(/```$/, '');
  
  // Ba'zan model JSON atrofida ortiqcha matn qoldiradi, birinchi { va oxirgi } ni topamiz
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return cleaned.trim();
};

const getDifficultyDescription = (level: DifficultyLevel, lang: AppLanguage) => {
  const descriptions = {
    uz: {
      beginner: "Boshlang'ich daraja (asosiy tushunchalar, sodda tushuntirishlar)",
      intermediate: "O'rta daraja (chuqurroq tahlil, amaliy qo'llanilishi)",
      advanced: "Yuqori daraja (murakkab nazariyalar, ilmiy tadqiqot elementlari, professional darajadagi tahlil)"
    },
    en: {
      beginner: "Beginner level (basic concepts, simple explanations)",
      intermediate: "Intermediate level (deeper analysis, practical application)",
      advanced: "Advanced level (complex theories, scientific research elements, professional analysis)"
    },
    ru: {
      beginner: "Начальный уровень (базовые понятия, простые объяснения)",
      intermediate: "Средний уровень (более глубокий анализ, практическое применение)",
      advanced: "Продвинутый уровень (сложные теории, элементы научных исследований, профессиональный анализ)"
    }
  };
  return descriptions[lang][level] || descriptions[lang].intermediate;
};

export const generateSyllabus = async (subject: string, topicCount: number, difficulty: DifficultyLevel, lang: AppLanguage): Promise<SyllabusResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Task: Act as an elite academic curriculum designer. 
    Subject: "${subject}".
    Difficulty: ${getDifficultyDescription(difficulty, lang)}.
    Number of topics: Exactly ${topicCount}.
    
    INSTRUCTIONS:
    1. Research real-world syllabuses from top universities (MIT, Stanford, Harvard, Oxford, etc.) for this subject using Google Search.
    2. Model your syllabus structure based on their academic rigor.
    3. You MUST provide at least 3-5 specific source URLs from these universities in the "sources" field.
    4. Output MUST be a valid JSON object.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            topics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  week: { type: Type.NUMBER }
                },
                required: ["id", "title", "description", "week"]
              }
            },
            sources: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  university: { type: Type.STRING },
                  url: { type: Type.STRING },
                  title: { type: Type.STRING }
                },
                required: ["university", "url", "title"]
              }
            }
          },
          required: ["subject", "difficulty", "topics", "sources"]
        }
      },
    });

    const jsonStr = cleanJsonResponse(response.text || '{}');
    const data = JSON.parse(jsonStr);
    
    // Google Search manbalarini tekshirish va qo'shish
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
       const chunks = response.candidates[0].groundingMetadata.groundingChunks;
       const webSources = chunks
         .filter((c: any) => c.web)
         .map((c: any) => ({
           university: c.web.title?.split('-')[0]?.trim() || "Academic Resource",
           url: c.web.uri,
           title: c.web.title || "Syllabus Source"
         }));
       
       if (!data.sources || data.sources.length === 0) {
         data.sources = webSources.slice(0, 5);
       }
    }
    
    // Agar topics bo'sh bo'lsa xato deb hisoblaymiz
    if (!data.topics || data.topics.length === 0) {
      throw new Error("No topics generated");
    }

    return data;
  } catch (error) {
    console.error("Detailed Syllabus Error:", error);
    throw error;
  }
};

export const generateDetailedContent = async (topicTitle: string, subject: string, difficulty: DifficultyLevel, lang: AppLanguage, academicLevel: AcademicLevel): Promise<GeneratedContent> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const languageName = lang === 'uz' ? 'O\'zbek' : lang === 'ru' ? 'Russian' : 'English';
  
  const prompt = `
    Act as a high-level academic professor. Generate comprehensive and detailed lecture materials for:
    Subject: "${subject}", Topic: "${topicTitle}".
    Level: ${academicLevel}, Complexity: ${difficulty}.
    Language: ${languageName}.

    STRICT CONTENT REQUIREMENTS:
    1. LECTURE NOTE: Full academic text in HTML format, minimum 4000 words. Include headings, sub-headings, and deep theoretical analysis.
    
    2. EDUCATIONAL CASES: Generate EXACTLY 2 pedagogical cases. Each case MUST follow this exact sequence:
       - Title: Catchy academic title.
       - Problem statement: Clearly define the issue.
       - Essence of the problem: Core underlying conflict/challenge.
       - Scale: Impact and boundaries of the problem.
       - Student Questions: 3-5 challenging logical questions to provoke critical thinking.
       - Resolution Paths: Step-by-step logical approach to solving the case.
       - Recommendations: Final pedagogical and professional advice or proposed solutions.

    3. KAZUS (Scenario Analysis): Generate EXACTLY 2 scenario-based analyses. Each kazus MUST follow the same exact sequence as Educational Cases:
       - Title, Problem, Essence, Scale, 3-5 Student Questions, Step-by-step Resolution Paths, Recommendations/Solutions.

    4. QUESTIONS: Generate EXACTLY 20 high-level logical and analytical questions to evaluate students' mastery of the topic.

    5. TESTS: Generate EXACTLY 30 multiple-choice questions (A, B, C, D) with one correct answer specified.

    6. GLOSSARY: Generate EXACTLY 20 key terms. 
       - TERMS MUST BE WRITTEN IN **BOLD** (e.g., "**Term Name**").
       - Each definition must be highly detailed and contextually relevant.

    OUTPUT FORMAT: Return a valid JSON object matching the requested schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            lectureNote: { type: Type.STRING },
            educationalCases: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT, 
                properties: { 
                  title: { type: Type.STRING }, 
                  problem: { type: Type.STRING }, 
                  essence: { type: Type.STRING }, 
                  scale: { type: Type.STRING }, 
                  questions: { type: Type.ARRAY, items: { type: Type.STRING } },
                  steps: { type: Type.ARRAY, items: { type: Type.STRING } },
                  recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["title", "problem", "essence", "scale", "questions", "steps", "recommendations"]
              } 
            },
            kazus: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT, 
                properties: { 
                  title: { type: Type.STRING }, 
                  problem: { type: Type.STRING }, 
                  essence: { type: Type.STRING }, 
                  scale: { type: Type.STRING }, 
                  questions: { type: Type.ARRAY, items: { type: Type.STRING } },
                  steps: { type: Type.ARRAY, items: { type: Type.STRING } },
                  recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["title", "problem", "essence", "scale", "questions", "steps", "recommendations"]
              } 
            },
            questions: { type: Type.ARRAY, items: { type: Type.STRING } },
            tests: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswer: { type: Type.STRING }
                },
                required: ["question", "options", "correctAnswer"]
              }
            },
            glossary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: { term: { type: Type.STRING }, definition: { type: Type.STRING } },
                required: ["term", "definition"]
              }
            }
          },
          required: ["lectureNote", "educationalCases", "kazus", "questions", "tests", "glossary"]
        },
        thinkingConfig: { thinkingBudget: 32768 }
      },
    });

    const jsonStr = cleanJsonResponse(response.text || '{}');
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Content Generation Error:", error);
    throw error;
  }
};

export const editOrGenerateImage = async (prompt: string, base64Image?: string, mimeType?: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const parts: any[] = [{ text: prompt }];
  if (base64Image && mimeType) {
    parts.unshift({ inlineData: { data: base64Image.split(',')[1] || base64Image, mimeType: mimeType } });
  }
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts },
    config: { imageConfig: { aspectRatio: "1:1" } }
  });
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated.");
};
