
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  LayoutDashboard, FileText, BookOpen, Briefcase, HelpCircle, 
  Plus, ArrowRight, Search, ChevronLeft, Loader2, ExternalLink, 
  Zap, Star, Trophy, AlertCircle, Link as LinkIcon, GraduationCap, 
  Globe, FileText as DocIcon, UserRound, CheckCircle, School, Bookmark,
  ImageIcon, Wand2, X, Upload, Sparkles, Lightbulb, Type as TypeIcon,
  FileType, Hash, Settings2, Layout, Monitor, ListChecks, HelpCircle as QuestionIcon,
  BookMarked, Download, FileJson, Key, Layers, Image as LucideImage,
  Heading1, Heading2, Text, Quote, Code, List as ListIcon, Trash2, RefreshCw
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import DOMPurify from 'dompurify';
import * as docx from 'docx';

import * as CKEditor from 'ckeditor5';
const { 
  DecoupledEditor, Essentials, Heading, Bold, Italic, 
  BlockQuote, CodeBlock, Font, Alignment, Autoformat,
  Link, List, Table, TableToolbar, TableCaption, 
  TableProperties, TableCellProperties, WordCount,
  Image, ImageToolbar, ImageCaption, ImageStyle, ImageResize, ImageInsert
} = CKEditor as any;

import { SyllabusResult, GeneratedContent, ViewState, SyllabusTopic, DifficultyLevel, AppLanguage, AcademicLevel, Lecture, DetailedProblemStructure } from './types';
import { generateSyllabus, generateDetailedContent, editOrGenerateImage } from './geminiService';

const translations = {
  uz: {
    appName: "Ustoz Pro",
    dashboard: "Asosiy Panel",
    createSyllabus: "Syllabus Yaratish",
    newLesson: "Yangi Dars",
    syllabusGen: "Syllabus Generatsiyasi",
    subjectName: "Fan nomi",
    academicLevel: "Bosqich",
    difficulty: "Daraja",
    generateBtn: "Syllabus Yaratish",
    generating: "Yaratilmoqda...",
    createMaterials: "Material Tayyorlash",
    deepAnalysis: "Tahlil jarayoni...",
    lectureNote: "Ma'ruza",
    educationalCases: "Ed. Case",
    kazus: "Kazus",
    questions: "Savollar",
    tests: "Testlar",
    testAnswers: "Javoblar",
    glossary: "Glossariy",
    back: "Ortga",
    bachelor: "Bakalavr",
    master: "Magistr",
    exportDocx: "DOCX Yuklash",
    exportSyllabus: "Syllabusni Yuklash (DOCX)",
    sources: "Ilmiy Manbalar va TOP Universitetlar",
    sourceDesc: "Ushbu syllabus quyidagi nufuzli universitetlar dars rejalari asosida shakllantirildi:",
    aiImage: "AI Rasm",
    aiImageTitle: "AI Illustrator Pro",
    aiImageDesc: "Darsingiz uchun professional illyustratsiyalar yarating.",
    imagePromptPlaceholder: "Rasmni tasvirlang (masalan: 'Atom strukturasi diagrammasi')...",
    generateImage: "Rasm yaratish",
    insertToEditor: "Muharrirga qo'shish",
    uploadImage: "Namuna rasm (ixtiyoriy)",
    pagePreview: "A4",
    fullWidth: "Keng",
    presets: "Shablonlar",
    problem: "Muammo",
    essence: "Muammoning mohiyati",
    scale: "Ko'lami",
    studentQuestions: "Talabalar uchun savollar",
    steps: "Yechim qadamlari",
    recommendations: "Takliflar",
    answerKey: "Test Javoblari Kaliti",
    errorSyllabus: "Syllabus yaratishda xatolik yuz berdi. Iltimos, fan nomini aniqroq yozing va qayta urinib ko'ring.",
    formattingPresets: "Formatlash shablonlari",
    presetH1: "Akademik Sarlavha 1",
    presetH2: "Akademik Sarlavha 2",
    presetBody: "Asosiy Matn",
    presetQuote: "Iqtibos",
    presetCode: "Kod / Formula",
    presetList: "Ro'yxat",
    remove: "O'chirish",
    startOver: "Boshidan",
    promptLabel: "Rasm tasviri",
    referenceLabel: "Namuna rasm",
    readyToInsert: "Rasm tayyor! Uni darsingizga qo'shishingiz mumkin."
  },
  en: {
    appName: "Ustoz Pro",
    dashboard: "Dashboard",
    createSyllabus: "Create Syllabus",
    newLesson: "New Lesson",
    syllabusGen: "Syllabus Generation",
    subjectName: "Subject Name",
    academicLevel: "Level",
    difficulty: "Difficulty",
    generateBtn: "Generate Syllabus",
    generating: "Generating...",
    createMaterials: "Prepare Materials",
    deepAnalysis: "Analyzing...",
    lectureNote: "Lecture",
    educationalCases: "Ed. Case",
    kazus: "Kazus",
    questions: "Questions",
    tests: "Tests",
    testAnswers: "Answers",
    glossary: "Glossary",
    back: "Back",
    bachelor: "Bachelor",
    master: "Master",
    exportDocx: "Download DOCX",
    exportSyllabus: "Download Syllabus (DOCX)",
    sources: "Academic Sources & TOP Universities",
    sourceDesc: "This syllabus was modeled after the following prestigious university curricula:",
    aiImage: "AI Image",
    aiImageTitle: "AI Illustrator Pro",
    aiImageDesc: "Create professional illustrations for your lecture.",
    imagePromptPlaceholder: "Describe the image (e.g. 'Quantum entanglement diagram')...",
    generateImage: "Generate Image",
    insertToEditor: "Insert to Editor",
    uploadImage: "Reference image (optional)",
    pagePreview: "A4",
    fullWidth: "Full",
    presets: "Presets",
    problem: "Problem",
    essence: "Essence",
    scale: "Scale",
    studentQuestions: "Student Questions",
    steps: "Steps",
    recommendations: "Recommendations",
    answerKey: "Test Answer Key",
    errorSyllabus: "Error creating syllabus. Please check the subject name and try again.",
    formattingPresets: "Formatting Presets",
    presetH1: "Academic Heading 1",
    presetH2: "Academic Heading 2",
    presetBody: "Body Text",
    presetQuote: "Blockquote",
    presetCode: "Code / Formula",
    presetList: "Bullet List",
    remove: "Remove",
    startOver: "Start Over",
    promptLabel: "Image Description",
    referenceLabel: "Reference Image",
    readyToInsert: "Image is ready! You can now insert it into your lecture."
  },
  ru: {
    appName: "Ustoz Pro",
    dashboard: "Панель",
    createSyllabus: "Создать Силлабус",
    newLesson: "Новый Урок",
    syllabusGen: "Генерация Силлабуса",
    subjectName: "Предмет",
    academicLevel: "Уровень",
    difficulty: "Сложность",
    generateBtn: "Создать",
    generating: "Создание...",
    createMaterials: "Подготовить материалы",
    deepAnalysis: "Анализ...",
    lectureNote: "Лекция",
    educationalCases: "Кейсы",
    kazus: "Казусы",
    questions: "Вопросы",
    tests: "Тесты",
    testAnswers: "Ответы",
    glossary: "Глоссарий",
    back: "Назад",
    bachelor: "Бакалавр",
    master: "Магистр",
    exportDocx: "Скачать DOCX",
    exportSyllabus: "Скачать Силлабус (DOCX)",
    sources: "Академические источники и ТОП ВУЗы",
    sourceDesc: "Этот учебный план был составлен на основе программ следующих престижных университетов:",
    aiImage: "ИИ Изображение",
    aiImageTitle: "AI Иллюстратор Pro",
    aiImageDesc: "Создавайте профессиональные иллюстрации для вашей лекции.",
    imagePromptPlaceholder: "Опишите изображение (например: 'Диаграмма структуры атома')...",
    generateImage: "Создать",
    insertToEditor: "Вставить в редактор",
    uploadImage: "Образец фото (необязательно)",
    pagePreview: "A4",
    fullWidth: "Широкий",
    presets: "Шаблоны",
    problem: "Проблема",
    essence: "Суть",
    scale: "Масштаб",
    studentQuestions: "Вопросы студентам",
    steps: "Шаги решения",
    recommendations: "Предложения",
    answerKey: "Ключи тестов",
    errorSyllabus: "Ошибка при создании силлабуса. Пожалуйста, проверьте название предмета и попробуйте снова.",
    formattingPresets: "Шаблоны форматирования",
    presetH1: "Академ. Заголовок 1",
    presetH2: "Академ. Заголовок 2",
    presetBody: "Основной текст",
    presetQuote: "Цитата",
    presetCode: "Код / Формула",
    presetList: "Список",
    remove: "Удалить",
    startOver: "Заново",
    promptLabel: "Описание изображения",
    referenceLabel: "Образец изображения",
    readyToInsert: "Изображение готово! Теперь вы можете вставить его в лекцию."
  }
};

const editorConfig = {
  licenseKey: 'GPL',
  plugins: [
    Essentials, Heading, Bold, Italic, Link, List,
    BlockQuote, CodeBlock, Font, Alignment, Autoformat,
    Table, TableToolbar, TableCaption, TableProperties, 
    TableCellProperties, WordCount,
    Image, ImageToolbar, ImageCaption, ImageStyle, ImageResize, ImageInsert
  ],
  toolbar: {
    items: [
      'undo', 'redo', '|', 'heading', '|', 'fontFamily', 'fontSize', 'fontColor', '|',
      'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|',
      'alignment', 'blockQuote', 'codeBlock', '|', 'insertTable', 'insertImage'
    ],
    shouldNotGroupWhenFull: true
  }
};

export default function App() {
  const [lang, setLang] = useState<AppLanguage>('uz');
  const t = translations[lang];
  const [view, setView] = useState<ViewState>('dashboard');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'lecture' | 'cases' | 'kazus' | 'questions' | 'tests' | 'glossary'>('lecture');
  
  const [subject, setSubject] = useState('');
  const [topicCount, setTopicCount] = useState(14);
  const [difficulty] = useState<DifficultyLevel>('intermediate');
  const [academicLevel, setAcademicLevel] = useState<AcademicLevel>('bachelor');
  const [syllabus, setSyllabus] = useState<SyllabusResult | null>(null);
  const [currentLecture, setCurrentLecture] = useState<Lecture | null>(null);
  const [, setWordCount] = useState({ words: 0, characters: 0 });

  const [isAiImageModalOpen, setIsAiImageModalOpen] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const [selectedBaseImage, setSelectedBaseImage] = useState<string | null>(null);
  const [selectedBaseImageMime, setSelectedBaseImageMime] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  const editorRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const applyPreset = (command: string, value?: any) => {
    if (!editorRef.current) return;
    const editor = editorRef.current;
    editor.execute(command, value);
    editor.editing.view.focus();
  };

  const handleCreateSyllabus = async () => {
    if (!subject || subject.trim().length < 2) {
      alert("Iltimos, fanni nomini to'liqroq kiriting.");
      return;
    }
    setLoading(true);
    try {
      const result = await generateSyllabus(subject, topicCount, difficulty, lang);
      setSyllabus(result);
      setView('view-syllabus');
    } catch (err) { 
      console.error("HandleCreateSyllabus Error:", err);
      alert(t.errorSyllabus); 
    }
    finally { setLoading(false); }
  };

  const handleOpenEditor = async (topic: SyllabusTopic) => {
    setLoading(true);
    setView('generating-content');
    try {
      const result = await generateDetailedContent(topic.title, syllabus?.subject || '', difficulty, lang, academicLevel);
      const newLecture: Lecture = {
        id: crypto.randomUUID(),
        topicId: topic.id,
        title: topic.title,
        htmlContent: result.lectureNote,
        educationalCases: result.educationalCases,
        kazus: result.kazus,
        questions: result.questions,
        tests: result.tests,
        glossary: result.glossary,
        version: 1,
        lastSaved: new Date().toISOString(),
        academicLevel
      };
      setCurrentLecture(newLecture);
      setActiveTab('lecture');
      setView('lecture-editor');
    } catch (err) { 
      console.error("HandleOpenEditor Error:", err);
      alert("Material yaratishda xatolik. Qayta urinib ko'ring."); 
      setView('view-syllabus'); 
    }
    finally { setLoading(false); }
  };

  const exportSyllabusDocx = async () => {
    if (!syllabus) return;
    setLoading(true);
    try {
      const children: any[] = [
        new docx.Paragraph({ 
          text: syllabus.subject, 
          heading: docx.HeadingLevel.TITLE, 
          alignment: docx.AlignmentType.CENTER, 
          spacing: { after: 400 } 
        }),
        new docx.Paragraph({
          children: [
            new docx.TextRun({ text: `${t.academicLevel}: `, bold: true }),
            new docx.TextRun({ text: academicLevel.toUpperCase() })
          ],
          spacing: { after: 200 }
        })
      ];

      syllabus.topics.forEach(topic => {
        children.push(new docx.Paragraph({ 
          text: `Week ${topic.week}: ${topic.title}`, 
          heading: docx.HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 }
        }));
        children.push(new docx.Paragraph({ 
          text: topic.description,
          spacing: { after: 150 }
        }));
      });

      if (syllabus.sources.length > 0) {
        children.push(new docx.Paragraph({ 
          text: t.sources, 
          heading: docx.HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 }
        }));
        syllabus.sources.forEach(source => {
          children.push(new docx.Paragraph({ 
            children: [
              new docx.TextRun({ text: `${source.university}: `, bold: true }),
              new docx.TextRun({ text: source.title, italics: true })
            ]
          }));
          children.push(new docx.Paragraph({ 
            children: [
              new docx.TextRun({ text: source.url, color: "0000FF", underline: {} })
            ],
            spacing: { after: 150 }
          }));
        });
      }

      const doc = new docx.Document({ sections: [{ children }] });
      const blob = await docx.Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Syllabus_${syllabus.subject.replace(/\s+/g, '_')}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const exportDocx = async (type: 'lecture' | 'cases' | 'kazus' | 'questions' | 'tests' | 'answers' | 'glossary') => {
    if (!currentLecture) return;
    setLoading(true);
    try {
      const children: any[] = [
        new docx.Paragraph({ text: currentLecture.title, heading: docx.HeadingLevel.TITLE, alignment: docx.AlignmentType.CENTER, spacing: { after: 400 } })
      ];

      if (type === 'lecture') {
        const parser = new DOMParser();
        const docHtml = parser.parseFromString(currentLecture.htmlContent, 'text/html');
        Array.from(docHtml.body.childNodes).forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;
            children.push(new docx.Paragraph({ text: el.innerText.trim(), spacing: { after: 200 } }));
          }
        });
      } else if (type === 'cases' || type === 'kazus') {
        const items = type === 'cases' ? currentLecture.educationalCases : currentLecture.kazus;
        items.forEach(item => {
          children.push(new docx.Paragraph({ text: item.title, heading: docx.HeadingLevel.HEADING_1, spacing: { before: 300 } }));
          children.push(new docx.Paragraph({ children: [new docx.TextRun({ text: t.problem + ": ", bold: true }), new docx.TextRun(item.problem)] }));
          children.push(new docx.Paragraph({ children: [new docx.TextRun({ text: t.essence + ": ", bold: true }), new docx.TextRun(item.essence)] }));
          children.push(new docx.Paragraph({ children: [new docx.TextRun({ text: t.scale + ": ", bold: true }), new docx.TextRun(item.scale)] }));
          children.push(new docx.Paragraph({ text: t.studentQuestions, heading: docx.HeadingLevel.HEADING_2 }));
          item.questions.forEach(q => children.push(new docx.Paragraph({ text: q, bullet: { level: 0 } })));
          children.push(new docx.Paragraph({ text: t.steps, heading: docx.HeadingLevel.HEADING_2 }));
          item.steps.forEach(s => children.push(new docx.Paragraph({ text: s, bullet: { level: 0 } })));
          children.push(new docx.Paragraph({ text: t.recommendations, heading: docx.HeadingLevel.HEADING_2 }));
          item.recommendations.forEach(r => children.push(new docx.Paragraph({ text: r, bullet: { level: 0 } })));
        });
      } else if (type === 'questions') {
        children.push(new docx.Paragraph({ text: t.questions, heading: docx.HeadingLevel.HEADING_1 }));
        currentLecture.questions.forEach((q, i) => children.push(new docx.Paragraph({ text: `${i + 1}. ${q}`, spacing: { after: 100 } })));
      } else if (type === 'tests') {
        children.push(new docx.Paragraph({ text: t.tests, heading: docx.HeadingLevel.HEADING_1 }));
        currentLecture.tests.forEach((test, i) => {
          children.push(new docx.Paragraph({ children: [new docx.TextRun({ text: `${i + 1}. ${test.question}`, bold: true })], spacing: { before: 200 } }));
          test.options.forEach(opt => children.push(new docx.Paragraph({ text: opt, indent: { left: 400 } })));
        });
      } else if (type === 'answers') {
        children.push(new docx.Paragraph({ text: t.answerKey, heading: docx.HeadingLevel.HEADING_1 }));
        currentLecture.tests.forEach((test, i) => children.push(new docx.Paragraph({ text: `${i + 1}. ${test.correctAnswer}`, spacing: { after: 50 } })));
      } else if (type === 'glossary') {
        children.push(new docx.Paragraph({ text: t.glossary, heading: docx.HeadingLevel.HEADING_1 }));
        currentLecture.glossary.forEach(g => children.push(new docx.Paragraph({ children: [new docx.TextRun({ text: g.term + ": ", bold: true }), new docx.TextRun(g.definition)], spacing: { after: 100 } })));
      }

      const doc = new docx.Document({ sections: [{ children }] });
      const blob = await docx.Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_${currentLecture.title}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt) return;
    setImageLoading(true);
    try {
      const result = await editOrGenerateImage(imagePrompt, selectedBaseImage || undefined, selectedBaseImageMime || undefined);
      setGeneratedImage(result);
    } catch (err) {
      console.error(err);
      alert("Rasm generatsiyasida xatolik yuz berdi.");
    } finally {
      setImageLoading(false);
    }
  };

  const handleInsertImageToEditor = () => {
    if (!generatedImage || !editorRef.current) return;
    const editor = editorRef.current;
    editor.model.change((writer: any) => {
      const imageElement = writer.createElement('imageBlock', {
        src: generatedImage,
        alt: imagePrompt
      });
      editor.model.insertContent(imageElement, editor.model.document.selection);
    });
    setIsAiImageModalOpen(false);
    setGeneratedImage(null);
    setImagePrompt('');
    setSelectedBaseImage(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedBaseImage(event.target?.result as string);
        setSelectedBaseImageMime(file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderDetailedStructure = (item: DetailedProblemStructure) => (
    <div className="space-y-6">
      <h4 className="text-xl font-black text-slate-900 border-b pb-2">{item.title}</h4>
      <div className="bg-slate-50 p-6 rounded-2xl border">
        <div className="mb-4">
          <strong className="text-blue-600 block text-[10px] uppercase font-black mb-1">{t.problem}</strong>
          <p className="text-slate-800">{item.problem}</p>
        </div>
        <div className="mb-4">
          <strong className="text-blue-600 block text-[10px] uppercase font-black mb-1">{t.essence}</strong>
          <p className="text-slate-800">{item.essence}</p>
        </div>
        <div className="mb-4">
          <strong className="text-blue-600 block text-[10px] uppercase font-black mb-1">{t.scale}</strong>
          <p className="text-slate-800">{item.scale}</p>
        </div>
        <div className="mb-4">
          <strong className="text-indigo-600 block text-[10px] uppercase font-black mb-1">{t.studentQuestions}</strong>
          <ul className="list-disc list-inside space-y-1 text-slate-700">
            {item.questions.map((q, i) => <li key={i}>{q}</li>)}
          </ul>
        </div>
        <div className="mb-4">
          <strong className="text-green-600 block text-[10px] uppercase font-black mb-1">{t.steps}</strong>
          <ol className="list-decimal list-inside space-y-1 text-slate-700">
            {item.steps.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </div>
        <div>
          <strong className="text-amber-600 block text-[10px] uppercase font-black mb-1">{t.recommendations}</strong>
          <ul className="list-none space-y-2 text-slate-700">
            {item.recommendations.map((r, i) => <li key={i} className="flex gap-2"><ArrowRight size={14} className="mt-1 flex-shrink-0" /> {r}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b px-10 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm no-print">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('dashboard')}>
          <BookOpen className="text-blue-600" />
          <h1 className="text-xl font-black tracking-tight">{t.appName}</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {['uz', 'en', 'ru'].map((l: any) => (
              <button key={l} onClick={() => setLang(l)} className={`px-3 py-1 text-xs font-black uppercase rounded-lg transition-all ${lang === l ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>{l}</button>
            ))}
          </div>
          {view === 'view-syllabus' && syllabus && (
            <button onClick={exportSyllabusDocx} className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100">
              <Download size={14} /> {t.exportSyllabus}
            </button>
          )}
          {view === 'lecture-editor' && (
            <div className="flex gap-2">
              <button onClick={() => setIsAiImageModalOpen(true)} className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100">
                <Sparkles size={14} /> {t.aiImage}
              </button>
              <button onClick={() => exportDocx(activeTab)} className="bg-blue-600 text-white px-5 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-blue-700 transition-all shadow-md shadow-blue-100">
                <Download size={14} /> {t.exportDocx}
              </button>
              {activeTab === 'tests' && (
                <button onClick={() => exportDocx('answers')} className="bg-green-600 text-white px-5 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-green-700 transition-all shadow-md shadow-green-100">
                  <Key size={14} /> {t.testAnswers}
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {view === 'lecture-editor' && (
        <div className="sticky top-[65px] z-40 bg-white border-b no-print py-2 flex flex-col gap-2 shadow-sm items-center">
          <div className="flex justify-center gap-2">
            {[
              { id: 'lecture', icon: FileText, label: t.lectureNote },
              { id: 'cases', icon: Briefcase, label: t.educationalCases },
              { id: 'kazus', icon: AlertCircle, label: t.kazus },
              { id: 'questions', icon: QuestionIcon, label: t.questions },
              { id: 'glossary', icon: BookMarked, label: t.glossary },
              { id: 'tests', icon: ListChecks, label: t.tests }
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-6 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-50'}`}>
                <tab.icon size={14} /> {tab.label}
              </button>
            ))}
          </div>
          
          {activeTab === 'lecture' && (
            <div className="flex gap-2 py-1 px-4 bg-slate-50 rounded-full border border-slate-100">
              <span className="text-[9px] font-black uppercase text-slate-400 self-center mr-2">{t.formattingPresets}:</span>
              {[
                { label: t.presetH1, cmd: 'heading', val: 'heading1', icon: Heading1 },
                { label: t.presetH2, cmd: 'heading', val: 'heading2', icon: Heading2 },
                { label: t.presetBody, cmd: 'heading', val: 'paragraph', icon: Text },
                { label: t.presetQuote, cmd: 'blockQuote', icon: Quote },
                { label: t.presetCode, cmd: 'codeBlock', icon: Code },
                { label: t.presetList, cmd: 'bulletedList', icon: ListIcon }
              ].map((p, i) => (
                <button 
                  key={i} 
                  onClick={() => applyPreset(p.cmd, p.val)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border rounded-lg text-[10px] font-bold text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm"
                  title={p.label}
                >
                  <p.icon size={12} />
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <main className="max-w-7xl mx-auto p-10">
        {view === 'dashboard' && (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-4">
            <Zap size={64} className="text-blue-600 mb-6 animate-pulse" />
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Akademik Platformaga Xush Kelibsiz</h2>
            <p className="text-slate-500 max-w-lg mb-10 text-lg">TOP universitetlar standartlari asosida dars materiallarini soniyalarda tayyorlang.</p>
            <button onClick={() => setView('create-syllabus')} className="bg-blue-600 text-white px-10 py-5 rounded-3xl font-black text-xl shadow-2xl hover:scale-105 transition-all flex items-center gap-4">
              {t.createSyllabus} <ArrowRight size={24} />
            </button>
          </div>
        )}

        {view === 'create-syllabus' && (
          <div className="max-w-xl mx-auto bg-white p-12 rounded-[3rem] shadow-xl border animate-in zoom-in">
            <h2 className="text-3xl font-black mb-10 text-center tracking-tight">{t.syllabusGen}</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">{t.subjectName}</label>
                <input type="text" className="w-full px-6 py-4 bg-slate-50 border rounded-2xl outline-none focus:border-blue-500 transition-all font-medium" placeholder="Masalan: Quantum Mechanics" value={subject} onChange={e => setSubject(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">{t.academicLevel}</label>
                <div className="flex gap-4">
                  <button onClick={() => setAcademicLevel('bachelor')} className={`flex-1 p-4 rounded-2xl border-2 font-black transition-all ${academicLevel === 'bachelor' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 hover:border-blue-200'}`}>{t.bachelor}</button>
                  <button onClick={() => setAcademicLevel('master')} className={`flex-1 p-4 rounded-2xl border-2 font-black transition-all ${academicLevel === 'master' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 hover:border-blue-200'}`}>{t.master}</button>
                </div>
              </div>
              <button disabled={loading || !subject} onClick={handleCreateSyllabus} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xl flex justify-center items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
                {loading ? <Loader2 className="animate-spin" /> : <Layers size={20} />} {t.generateBtn}
              </button>
            </div>
          </div>
        )}

        {view === 'view-syllabus' && syllabus && (
          <div className="space-y-12 animate-in fade-in">
            <div className="flex flex-col items-center">
              <h2 className="text-4xl font-black text-center uppercase tracking-tight text-slate-900 mb-2">{syllabus.subject}</h2>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{academicLevel}</span>
                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{topicCount} weeks</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {syllabus.topics.map(topic => (
                <div key={topic.id} className="bg-white p-8 rounded-[2rem] border shadow-sm hover:border-blue-300 hover:shadow-xl transition-all flex flex-col h-full group border-slate-100">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">{topic.week}</div>
                  <h4 className="text-xl font-black mb-4 flex-grow text-slate-800 leading-tight">{topic.title}</h4>
                  <p className="text-slate-500 text-sm mb-6 line-clamp-3">{topic.description}</p>
                  <button onClick={() => handleOpenEditor(topic)} className="w-full py-4 bg-slate-50 text-blue-600 rounded-2xl font-black hover:bg-blue-600 hover:text-white transition-all">{t.createMaterials}</button>
                </div>
              ))}
            </div>

            {syllabus.sources && syllabus.sources.length > 0 && (
              <div className="mt-16 pt-12 border-t border-slate-200">
                <div className="mb-8">
                  <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                    <School className="text-blue-600" /> {t.sources}
                  </h3>
                  <p className="text-slate-500 mt-2 font-medium">{t.sourceDesc}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {syllabus.sources.map((source, i) => (
                    <a 
                      key={i} 
                      href={source.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="group flex flex-col p-6 bg-white rounded-3xl border border-slate-100 hover:border-blue-400 hover:shadow-lg transition-all"
                      aria-label={`Open syllabus source from ${source.university}`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                          <Globe size={18} />
                        </div>
                        <ExternalLink size={14} className="text-slate-300 group-hover:text-blue-600" />
                      </div>
                      <div className="text-xs font-black text-blue-600 uppercase tracking-wider mb-1">{source.university}</div>
                      <div className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2">{source.title}</div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'generating-content' && (
          <div className="flex flex-col items-center justify-center py-40 animate-pulse">
            <div className="relative w-32 h-32 mb-10">
              <div className="absolute inset-0 border-8 border-blue-50 rounded-full"></div>
              <div className="absolute inset-0 border-8 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
              <Sparkles className="absolute inset-0 m-auto text-blue-600 w-12 h-12" />
            </div>
            <h3 className="text-3xl font-black tracking-tight">{t.deepAnalysis}</h3>
            <p className="text-slate-400 mt-2">Gemini is synthesizing high-quality academic content...</p>
          </div>
        )}

        {view === 'lecture-editor' && currentLecture && (
          <div className="animate-in slide-in-from-bottom-8">
            {activeTab === 'lecture' && (
              <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border min-h-[800px] relative">
                <CKEditorComponent data={currentLecture.htmlContent} onChange={(data: string) => setCurrentLecture({ ...currentLecture, htmlContent: data })} onInit={(editor: any) => {
                  editorRef.current = editor;
                }} onWordCountChange={setWordCount} />
              </div>
            )}
            
            {(activeTab === 'cases' || activeTab === 'kazus') && (
              <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border space-y-12">
                <h3 className="text-2xl font-black flex items-center gap-3">
                  {activeTab === 'cases' ? <Briefcase className="text-blue-600" /> : <AlertCircle className="text-indigo-600" />} 
                  {activeTab === 'cases' ? t.educationalCases : t.kazus}
                </h3>
                {(activeTab === 'cases' ? currentLecture.educationalCases : currentLecture.kazus).map((item, idx) => (
                  <div key={idx}>{renderDetailedStructure(item)}</div>
                ))}
              </div>
            )}

            {activeTab === 'questions' && (
              <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border space-y-6">
                <h3 className="text-2xl font-black flex items-center gap-3"><QuestionIcon className="text-blue-600" /> {t.questions} (20)</h3>
                <div className="space-y-4">
                  {currentLecture.questions.map((q, i) => (
                    <div key={i} className="flex gap-4 p-5 bg-slate-50 rounded-2xl border text-slate-800 font-medium">
                      <span className="font-black text-blue-600">{i + 1}.</span> {q}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'glossary' && (
              <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border">
                <h3 className="text-2xl font-black mb-8 flex items-center gap-3"><BookMarked className="text-blue-600" /> {t.glossary}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentLecture.glossary.map((g, i) => (
                    <div key={i} className="p-6 bg-slate-50 rounded-2xl border hover:border-blue-400 transition-all">
                      <strong className="text-blue-600 block mb-2">{g.term}</strong>
                      <p className="text-sm text-slate-600 leading-relaxed">{g.definition}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'tests' && (
              <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border space-y-8">
                <h3 className="text-2xl font-black flex items-center gap-3"><ListChecks className="text-green-600" /> {t.tests} (30)</h3>
                <div className="space-y-6 divide-y">
                  {currentLecture.tests.map((test, i) => (
                    <div key={i} className="pt-6 first:pt-0">
                      <p className="font-black text-slate-900 mb-4">{i + 1}. {test.question}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {test.options.map((opt, oi) => <div key={oi} className="p-3 bg-slate-50 border rounded-xl text-sm">{opt}</div>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* AI Image Generation Modal - Enhanced UI */}
      {isAiImageModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/90 backdrop-blur-xl animate-in fade-in duration-300 no-print">
          <div className="bg-white w-full max-w-6xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border-8 border-slate-100/50">
            {/* Modal Header */}
            <div className="p-8 border-b flex items-center justify-between bg-white">
              <div className="flex items-center space-x-5">
                <div className="bg-indigo-600 p-4 rounded-3xl shadow-lg shadow-indigo-100 text-white"><Sparkles size={32} /></div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight text-slate-900">{t.aiImageTitle}</h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{t.aiImageDesc}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAiImageModalOpen(false)} 
                className="p-3 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-900"
              >
                <X size={28} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-10 lg:p-14">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left Column: Inputs */}
                <div className="space-y-10">
                  <div className="space-y-4">
                    <label className="flex items-center justify-between px-1">
                      <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><TypeIcon size={14} /> {t.promptLabel}</span>
                      {imagePrompt && (
                        <button onClick={() => setImagePrompt('')} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">{t.remove}</button>
                      )}
                    </label>
                    <textarea 
                      rows={6} 
                      className="w-full px-8 py-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] focus:border-indigo-500 focus:bg-white outline-none transition-all text-lg font-medium shadow-inner" 
                      placeholder={t.imagePromptPlaceholder} 
                      value={imagePrompt} 
                      onChange={e => setImagePrompt(e.target.value)} 
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center justify-between px-1">
                      <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><Upload size={14} /> {t.referenceLabel}</span>
                      {selectedBaseImage && (
                        <button onClick={() => setSelectedBaseImage(null)} className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline flex items-center gap-1"><Trash2 size={10} /> {t.remove}</button>
                      )}
                    </label>
                    <div 
                      onClick={() => !selectedBaseImage && fileInputRef.current?.click()} 
                      className={`group border-2 border-dashed rounded-[2.5rem] p-4 flex flex-col items-center justify-center aspect-video relative overflow-hidden transition-all hover:border-indigo-300 ${selectedBaseImage ? 'border-indigo-400 bg-indigo-50/20' : 'border-slate-200 bg-slate-50 cursor-pointer'}`}
                    >
                      {selectedBaseImage ? (
                        <div className="relative w-full h-full">
                          <img src={selectedBaseImage} className="w-full h-full object-cover rounded-3xl" alt="Reference" />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                             <button onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} className="p-4 bg-white rounded-full text-indigo-600 shadow-xl"><RefreshCw size={24} /></button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-slate-300 mx-auto mb-4 group-hover:scale-110 transition-transform shadow-sm">
                            <LucideImage size={32} />
                          </div>
                          <p className="text-sm font-black text-slate-400">Click or drag reference image</p>
                          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1">Optional</p>
                        </div>
                      )}
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </div>

                  <div className="pt-4">
                    <button 
                      disabled={imageLoading || !imagePrompt} 
                      onClick={handleGenerateImage} 
                      className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:translate-y-0"
                    >
                      {imageLoading ? <Loader2 size={28} className="animate-spin" /> : <Wand2 size={28} />} 
                      <span>{t.generateImage}</span>
                    </button>
                  </div>
                </div>
                
                {/* Right Column: Preview Area */}
                <div className="flex flex-col bg-slate-50 rounded-[3.5rem] border-2 border-slate-100/50 p-8 min-h-[500px] items-center justify-center relative shadow-inner">
                  {imageLoading ? (
                    <div className="flex flex-col items-center gap-6 animate-pulse">
                      <div className="relative">
                        <Loader2 size={80} className="text-indigo-600 animate-spin" />
                        <Sparkles className="absolute inset-0 m-auto text-indigo-300 w-6 h-6 animate-ping" />
                      </div>
                      <div className="text-center">
                        <p className="font-black text-slate-900 text-lg">AI is painting...</p>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Usually takes 5-10 seconds</p>
                      </div>
                    </div>
                  ) : generatedImage ? (
                    <div className="w-full flex flex-col items-center gap-10 animate-in zoom-in-95 duration-500">
                      <div className="relative w-full max-w-md">
                        <div className="absolute -inset-4 bg-indigo-600/10 blur-3xl rounded-full"></div>
                        <img 
                          src={generatedImage} 
                          className="relative w-full aspect-square object-cover rounded-[3rem] shadow-[0_20px_50px_rgba(79,70,229,0.2)] border-8 border-white" 
                          alt="Generated AI Art" 
                        />
                        <div className="absolute -bottom-4 -right-4 bg-green-500 text-white p-4 rounded-3xl shadow-lg animate-bounce">
                          <CheckCircle size={24} />
                        </div>
                      </div>
                      
                      <div className="text-center space-y-8">
                        <div>
                          <p className="text-slate-900 font-black text-xl">{t.readyToInsert}</p>
                        </div>
                        <div className="flex gap-4">
                          <button 
                            onClick={() => { setGeneratedImage(null); setImagePrompt(''); setSelectedBaseImage(null); }} 
                            className="px-8 py-4 bg-white text-slate-500 rounded-2xl font-black border-2 border-slate-100 hover:bg-slate-100 transition-all flex items-center gap-2"
                          >
                            <RefreshCw size={20} /> {t.startOver}
                          </button>
                          <button 
                            onClick={handleInsertImageToEditor} 
                            className="px-10 py-4 bg-green-600 text-white rounded-2xl font-black shadow-xl shadow-green-100 hover:bg-green-700 hover:scale-105 transition-all flex items-center gap-3"
                          >
                            <Plus size={24} /> {t.insertToEditor}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-6">
                      <div className="relative group">
                        <div className="absolute inset-0 bg-indigo-100 blur-2xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative bg-white p-12 rounded-[3rem] inline-block shadow-sm border border-slate-100">
                          <ImageIcon size={80} className="text-slate-100" />
                          <div className="absolute -top-2 -right-2 bg-indigo-500 p-3 rounded-2xl text-white shadow-lg animate-bounce duration-1000">
                            <Lightbulb size={24} />
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-slate-400 font-black max-w-xs mx-auto text-lg leading-tight">Enter a description to generate academic illustrations</p>
                        <p className="text-slate-300 font-bold text-xs uppercase tracking-widest mt-2">Diagrams, schemes, and visual concepts</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CKEditorComponent({ data, onChange, onInit, onWordCountChange }: any) {
  const editableRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<any>(null);
  
  useEffect(() => {
    let editor: any;
    const init = async () => {
      if (editableRef.current && !instanceRef.current) {
        editor = await DecoupledEditor.create(editableRef.current, editorConfig);
        instanceRef.current = editor;
        
        const toolbarContainer = document.querySelector('#toolbar-container');
        if (toolbarContainer) {
          toolbarContainer.innerHTML = '';
          toolbarContainer.appendChild(editor.ui.view.toolbar.element);
        } else {
          editableRef.current.parentElement?.insertBefore(editor.ui.view.toolbar.element, editableRef.current);
        }

        editor.setData(data || '');
        editor.model.document.on('change:data', () => onChange(editor.getData()));
        
        const wordCountPlugin: any = editor.plugins.get('WordCount');
        wordCountPlugin.on('update', (evt: any, stats: any) => {
          onWordCountChange({ words: stats.words, characters: stats.characters });
        });

        onInit(editor);
      }
    };
    init();
    return () => { 
      if (editor) editor.destroy(); 
      instanceRef.current = null; 
    };
  }, []);

  return (
    <div className="ck-editor-wrapper">
      <div id="toolbar-container" className="no-print mb-4 border-b pb-2"></div>
      <div ref={editableRef} className="ck-content prose max-w-none outline-none academic-editor" />
    </div>
  );
}
