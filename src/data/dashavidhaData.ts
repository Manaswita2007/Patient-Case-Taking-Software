// Comprehensive Multilingual Datasets for Dashavidha Pariksha and FAQs
// Provides instant 0ms translations for Hindi, Bengali, and English, with fallback for other Indic languages

export interface PillarData {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  clinical: string;
  iconColor: string;
  bgLight: string;
}

export interface FaqData {
  q: string;
  a: string;
}

export const ENGLISH_PILLARS: PillarData[] = [
  {
    id: "prakriti",
    name: "1. Prakriti",
    subtitle: "Basic Genetic & Physical Constitution",
    description: "Evaluation of the individual's baseline psychosomatic balance established at conception (Vata, Pitta, Kapha). Determines drug tolerance, metabolic pace, and intrinsic susceptibility to disease.",
    clinical: "Determines individualized dosage thresholds and pharmacokinetics.",
    iconColor: "text-amber-500",
    bgLight: "bg-amber-50 dark:bg-amber-950/30"
  },
  {
    id: "vikriti",
    name: "2. Vikriti",
    subtitle: "Current Pathological Imbalance",
    description: "Analysis of the present state of doshic imbalance and morbidity. Distinguishing between the patient's innate constitution and temporary disease state guides acute intervention.",
    clinical: "Directs targeted anti-doshic therapies and allopathic acute management.",
    iconColor: "text-red-500",
    bgLight: "bg-red-50 dark:bg-red-950/30"
  },
  {
    id: "sara",
    name: "3. Sara",
    subtitle: "Tissue Purity & Structural Excellence",
    description: "Qualitative assessment of 8 Dhatus (Rasa, Rakta, Mamsa, Meda, Asthi, Majja, Sukra, and Ojas). Evaluates systemic immune resilience and tissue repair capability.",
    clinical: "Predicts recovery speed, wound healing, and surgical tolerance.",
    iconColor: "text-emerald-500",
    bgLight: "bg-emerald-50 dark:bg-emerald-950/30"
  },
  {
    id: "samhanana",
    name: "4. Samhanana",
    subtitle: "Body Compactness & Skeletal Symmetry",
    description: "Inspection of bone structure, joint stability, and muscle distribution. High compactness denotes superior mechanical defense against physical trauma.",
    clinical: "Assesses musculoskeletal integrity and orthopedic resilience.",
    iconColor: "text-blue-500",
    bgLight: "bg-blue-50 dark:bg-blue-950/30"
  },
  {
    id: "pramana",
    name: "5. Pramana",
    subtitle: "Anthropometric Proportions & Dimensions",
    description: "Measurement of body ratios, limb lengths, and anatomical symmetry compared against classical Anguli Pramana and modern clinical BMI/body composition indices.",
    clinical: "Detects developmental anomalies, malnutrition, or endocrine disproportion.",
    iconColor: "text-indigo-500",
    bgLight: "bg-indigo-50 dark:bg-indigo-950/30"
  },
  {
    id: "satmya",
    name: "6. Satmya",
    subtitle: "Adaptability, Habituation & Sensitivities",
    description: "Evaluation of dietary habits, climatic adaptability, and substance habituations. Reveals allergic tendencies and therapeutic tolerance to specific medicinal herbs and diets.",
    clinical: "Prevents adverse drug reactions and customizes therapeutic dietary orders.",
    iconColor: "text-teal-500",
    bgLight: "bg-teal-50 dark:bg-teal-950/30"
  },
  {
    id: "sattva",
    name: "7. Sattva",
    subtitle: "Mental Fortitude & Psychological Resilience",
    description: "Classification of mental strength into Pravara (superior), Madhyama (moderate), or Avara (low). Determines pain tolerance, anxiety response, and compliance with clinical therapies.",
    clinical: "Guides psychological counseling, pain management, and sedative titration.",
    iconColor: "text-purple-500",
    bgLight: "bg-purple-50 dark:bg-purple-950/30"
  },
  {
    id: "ahara",
    name: "8. Ahara Shakti",
    subtitle: "Digestive & Assimilation Capacity",
    description: "Assesses appetite (Abhyavaharana Shakti) and metabolic conversion power (Jarana Shakti). Fundamental for gauging whether oral medications and therapeutic diets can be assimilated.",
    clinical: "Crucial for preventing gastrointestinal toxicity and guiding nutrition.",
    iconColor: "text-orange-500",
    bgLight: "bg-orange-50 dark:bg-orange-950/30"
  },
  {
    id: "vyayama",
    name: "9. Vyayama Shakti",
    subtitle: "Physical Stamina & Work Capacity",
    description: "Tests endurance, cardiopulmonary reserve, and physical work tolerance without early dyspnea or exhaustion.",
    clinical: "Informs cardiopulmonary assessment, exercise rehabilitation, and physiological reserve.",
    iconColor: "text-cyan-500",
    bgLight: "bg-cyan-50 dark:bg-cyan-950/30"
  },
  {
    id: "vaya",
    name: "10. Vaya",
    subtitle: "Chronological & Biological Age",
    description: "Stratifies life into Balya (childhood/growth), Madhyama (middle age/pitta dominant), and Vardhakya (senescence/degenerative). Correlates with organ reserve and metabolic rate.",
    clinical: "Dictates pediatric and geriatric dose adjustments and life-stage prognosis.",
    iconColor: "text-rose-500",
    bgLight: "bg-rose-50 dark:bg-rose-950/30"
  }
];

export const HINDI_PILLARS: PillarData[] = [
  {
    id: "prakriti",
    name: "१. प्रकृति (Prakriti)",
    subtitle: "मूल आनुवंशिक एवं शारीरिक संरचना",
    description: "गर्भधारण के समय निर्धारित व्यक्ति के जन्मजात मनोशारीरिक संतुलन (वात, पित्त, कफ) का मूल्यांकन। यह औषधि सहनशीलता, चयापचय दर और रोगों के प्रति संवेदनशीलता तय करता है।",
    clinical: "व्यक्तिगत औषधि खुराक की सीमा और फार्माकोकाइनेटिक्स निर्धारित करता है।",
    iconColor: "text-amber-500",
    bgLight: "bg-amber-50 dark:bg-amber-950/30"
  },
  {
    id: "vikriti",
    name: "२. विकृति (Vikriti)",
    subtitle: "वर्तमान रोगजनित असंतुलन",
    description: "दोषों के वर्तमान असंतुलन और रुग्णता की स्थिति का विश्लेषण। रोगी की जन्मजात प्रकृति और अस्थायी रोग अवस्था के बीच अंतर तीव्र उपचार को निर्देशित करता है।",
    clinical: "लक्षित दोष-रोधी चिकित्सा और एलोपैथिक तीव्र प्रबंधन का मार्गदर्शन करता है।",
    iconColor: "text-red-500",
    bgLight: "bg-red-50 dark:bg-red-950/30"
  },
  {
    id: "sara",
    name: "३. सार (Sara)",
    subtitle: "धातु शुद्धता एवं संरचनात्मक उत्कृष्टता",
    description: "८ धातुओं (रस, रक्त, मांस, मेद, अस्थि, मज्जा, शुक्र, और ओज) का गुणात्मक मूल्यांकन। यह प्रणालीगत रोग प्रतिरोधक क्षमता और ऊतक मरम्मत क्षमता का आकलन करता है।",
    clinical: "रोगमुक्ति की गति, घाव भरने और शल्य चिकित्सा सहनशीलता का पूर्वानुमान लगाता है।",
    iconColor: "text-emerald-500",
    bgLight: "bg-emerald-50 dark:bg-emerald-950/30"
  },
  {
    id: "samhanana",
    name: "४. संहनन (Samhanana)",
    subtitle: "शरीर की सुदृढ़ता एवं अस्थि समरूपता",
    description: "अस्थि संरचना, जोड़ों की स्थिरता और मांसपेशियों के वितरण का निरीक्षण। उच्च सुदृढ़ता शारीरिक आघात के विरुद्ध बेहतर यांत्रिक सुरक्षा को दर्शाती है।",
    clinical: "मस्कुलोस्केलेटल अखंडता और आर्थोपेडिक लचीलेपन का आकलन करता है।",
    iconColor: "text-blue-500",
    bgLight: "bg-blue-50 dark:bg-blue-950/30"
  },
  {
    id: "pramana",
    name: "५. प्रमाण (Pramana)",
    subtitle: "शारीरिक अनुपात एवं मानवमितीय आयाम",
    description: "शास्त्रीय अंगुलि प्रमाण और आधुनिक बीएमआई सूचकांकों के संदर्भ में शरीर के अनुपात, अंगों की लंबाई और शारीरिक समरूपता का मापन।",
    clinical: "विकासात्मक विसंगतियों, कुपोषण या अंतःस्रावी असंतुलन का पता लगाता है।",
    iconColor: "text-indigo-500",
    bgLight: "bg-indigo-50 dark:bg-indigo-950/30"
  },
  {
    id: "satmya",
    name: "६. सात्म्य (Satmya)",
    subtitle: "अनुकूलनशीलता, आदतें एवं संवेदनशीलता",
    description: "आहार संबंधी आदतों, जलवायु अनुकूलन और औषधीय आदतों का मूल्यांकन। यह एलर्जी की प्रवृत्तियों और विशिष्ट जड़ी-बूटियों के प्रति सहनशीलता को प्रकट करता है।",
    clinical: "दवाओं के प्रतिकूल प्रभावों को रोकता है और चिकित्सीय आहार तैयार करता है।",
    iconColor: "text-teal-500",
    bgLight: "bg-teal-50 dark:bg-teal-950/30"
  },
  {
    id: "sattva",
    name: "७. सत्त्व (Sattva)",
    subtitle: "मानसिक बल एवं मनोवैज्ञानिक धैर्य",
    description: "मानसिक शक्ति को प्रवर (श्रेष्ठ), मध्यम, या अवर (हीन) में वर्गीकृत करना। दर्द सहनशीलता, चिंता प्रतिक्रिया और उपचार अनुपालन को निर्धारित करता है।",
    clinical: "मनोवैज्ञानिक परामर्श, दर्द प्रबंधन और शामक औषधि के स्तर का मार्गदर्शन करता है।",
    iconColor: "text-purple-500",
    bgLight: "bg-purple-50 dark:bg-purple-950/30"
  },
  {
    id: "ahara",
    name: "८. आहार शक्ति (Ahara Shakti)",
    subtitle: "पाचन एवं अवशोषण क्षमता",
    description: "भूख (अभ्यवहरण शक्ति) और पाचन परिवर्तन क्षमता (जरण शक्ति) का आकलन। यह जानने के लिए महत्वपूर्ण है कि क्या मौखिक दवाएं और चिकित्सीय आहार पच सकते हैं।",
    clinical: "गैस्ट्रोइंटेस्टाइनल विषाक्तता की रोकथाम और पोषण संबंधी मार्गदर्शन में सहायक।",
    iconColor: "text-orange-500",
    bgLight: "bg-orange-50 dark:bg-orange-950/30"
  },
  {
    id: "vyayama",
    name: "९. व्यायाम शक्ति (Vyayama Shakti)",
    subtitle: "शारीरिक सहनशक्ति एवं कार्य क्षमता",
    description: "बिना जल्दी थके या सांस फूले सहनशक्ति, कार्डियोपल्मोनरी रिजर्व और शारीरिक कार्य करने की क्षमता का परीक्षण।",
    clinical: "कार्डियोपल्मोनरी मूल्यांकन, पुनर्वास व्यायाम और शारीरिक ऊर्जा का मार्गदर्शन करता है।",
    iconColor: "text-cyan-500",
    bgLight: "bg-cyan-50 dark:bg-cyan-950/30"
  },
  {
    id: "vaya",
    name: "१०. वय (Vaya)",
    subtitle: "कालानुक्रमिक एवं जैविक आयु",
    description: "जीवन को बाल्य (बाल्यावस्था), मध्यम (युवावस्था/पित्त प्रधान), और वार्धक्य (वृद्धावस्था/अपक्षयी) में विभाजित करना। अंग क्षमता और चयापचय से संबंधित है।",
    clinical: "बाल और वृद्ध खुराक समायोजन तथा जीवन-अवस्था के रोगनिदान को निर्धारित करता है।",
    iconColor: "text-rose-500",
    bgLight: "bg-rose-50 dark:bg-rose-950/30"
  }
];

export const BENGALI_PILLARS: PillarData[] = [
  {
    id: "prakriti",
    name: "১. প্রকৃতি (Prakriti)",
    subtitle: "মৌলিক জিনগত ও শারীরিক গঠন",
    description: "গর্ভধারণের সময় নির্ধারিত রোগীর জন্মগত মনোশারীরিক ভারসাম্য (বাত, পিত্ত, কফ) মূল্যায়ন। এটি ওষুধের সহনশীলতা ও বিপাকীয় গতি নির্ধারণ করে।",
    clinical: "ব্যক্তিগত ওষুধের ডোজের মাত্রা ও ফার্মাকোকাইনেটিক্স নির্ধারণ করে।",
    iconColor: "text-amber-500",
    bgLight: "bg-amber-50 dark:bg-amber-950/30"
  },
  {
    id: "vikriti",
    name: "২. বিকৃতি (Vikriti)",
    subtitle: "বর্তমান রোগজনিত ভারসাম্যহীনতা",
    description: "দোষের বর্তমান অবস্থা ও রোগের মাত্রা বিশ্লেষণ। সহজাত প্রকৃতি ও ক্ষণস্থায়ী রোগের মধ্যে পার্থক্য জরুরি চিকিৎসার দিকনির্দেশ করে।",
    clinical: "নির্দিষ্ট দোষ-বিরোধী থেরাপি এবং অ্যালোপ্যাথিক তীব্র চিকিৎসার দিকনির্দেশনা দেয়।",
    iconColor: "text-red-500",
    bgLight: "bg-red-50 dark:bg-red-950/30"
  },
  {
    id: "sara",
    name: "৩. সার (Sara)",
    subtitle: "টিস্যু বিশুদ্ধতা ও কাঠামোগত শ্রেষ্ঠত্ব",
    description: "৮টি ধাতুর (রস, রক্ত, মাংস, মেদ, অস্থি, মজ্জা, শুক্র এবং ওজ) গুণগত মূল্যায়ন। এটি রোগ প্রতিরোধ ক্ষমতা এবং টিস্যু মেরামতের ক্ষমতা পরীক্ষা করে।",
    clinical: "রোগমুক্তির গতি, ক্ষত নিরাময় এবং অস্ত্রোপচারের সহনশীলতার পূর্বাভাস দেয়।",
    iconColor: "text-emerald-500",
    bgLight: "bg-emerald-50 dark:bg-emerald-950/30"
  },
  {
    id: "samhanana",
    name: "৪. সংহনন (Samhanana)",
    subtitle: "শরীরের দৃঢ়তা ও অস্থি প্রতিসাম্য",
    description: "হাড়ের গঠন, জয়েন্টের স্থিতিশীলতা এবং পেশী বিন্যাস পরিদর্শন। উচ্চ দৃঢ়তা শারীরিক আঘাতের বিরুদ্ধে শক্তিশালী সুরক্ষা নির্দেশ করে।",
    clinical: "পেশী ও কঙ্কালের অখণ্ডতা এবং অর্থোপেডিক স্থিতিস্থাপকতা মূল্যায়ন করে।",
    iconColor: "text-blue-500",
    bgLight: "bg-blue-50 dark:bg-blue-950/30"
  },
  {
    id: "pramana",
    name: "৫. প্রমাণ (Pramana)",
    subtitle: "শারীরিক অনুপাত ও পরিমাপ",
    description: "শাস্ত্রীয় অঙ্গুলি প্রমাণ এবং আধুনিক বিএমআই সূচকের সাথে শরীরের অনুপাত, অঙ্গের দৈর্ঘ্য ও শারীরবৃত্তীয় প্রতিসাম্য পরিমাপ।",
    clinical: "বিকাশজনিত ত্রুটি, অপুষ্টি বা হরমোনজনিত ভারসাম্যহীনতা শনাক্ত করে।",
    iconColor: "text-indigo-500",
    bgLight: "bg-indigo-50 dark:bg-indigo-950/30"
  },
  {
    id: "satmya",
    name: "৬. সাত্ম্য (Satmya)",
    subtitle: "অভিযোজনযোগ্যতা, অভ্যাস ও সংবেদনশীলতা",
    description: "খাদ্যাভ্যাস, জলবায়ু অভিযোজন এবং ওষধি সহনশীলতার মূল্যায়ন। অ্যালার্জির প্রবণতা এবং নির্দিষ্ট ভেষজের কার্যকারিতা প্রকাশ করে।",
    clinical: "ওষুধের প্রতিকূল প্রতিক্রিয়া প্রতিরোধ করে এবং পথ্য পরিকল্পনা করে।",
    iconColor: "text-teal-500",
    bgLight: "bg-teal-50 dark:bg-teal-950/30"
  },
  {
    id: "sattva",
    name: "৭. সত্ত্ব (Sattva)",
    subtitle: "মানসিক শক্তি ও সহনশীলতা",
    description: "মানসিক শক্তিকে প্রবর (উচ্চ), মধ্যম, বা অবর (নিম্ন) শ্রেণীতে বিন্যাস। ব্যথা সহ্য করার ক্ষমতা এবং চিকিৎসায় সহযোগিতার মনোভাব নির্ধারণ করে।",
    clinical: "মানসিক পরামর্শ, ব্যথা নিয়ন্ত্রণ এবং ঘুমের ওষুধের মাত্রা নিয়ন্ত্রণে পথ দেখায়।",
    iconColor: "text-purple-500",
    bgLight: "bg-purple-50 dark:bg-purple-950/30"
  },
  {
    id: "ahara",
    name: "৮. আহার শক্তি (Ahara Shakti)",
    subtitle: "হজম ও শোষণ ক্ষমতা",
    description: "ক্ষুধা (অভ্যবহারণ শক্তি) এবং পরিপাক ক্ষমতা (জরণ শক্তি) পরীক্ষা। মুখে খাওয়ার ওষুধ এবং থেরাপিউটিক খাবার শোষিত হতে পারবে কি না তা বোঝার ভিত্তি।",
    clinical: "পেটের বিষাক্ততা প্রতিরোধ এবং পুষ্টি নির্দেশিকা দেওয়ার জন্য অত্যন্ত গুরুত্বপূর্ণ।",
    iconColor: "text-orange-500",
    bgLight: "bg-orange-50 dark:bg-orange-950/30"
  },
  {
    id: "vyayama",
    name: "৯. ব্যায়াম শক্তি (Vyayama Shakti)",
    subtitle: "শারীরিক সহ্যক্ষমতা ও কর্মক্ষমতা",
    description: "দ্রুত শ্বাসকষ্ট বা ক্লান্তি ছাড়া শারীরিক পরিশ্রম সহ্য করার ক্ষমতা ও হৃৎপিণ্ড-ফুসফুসের শক্তি পরীক্ষা।",
    clinical: "হৃৎপিণ্ড ও ফুসফুসের ক্ষমতা এবং পুনর্বাসন ব্যায়ামের মাত্রা নির্ধারণ করে।",
    iconColor: "text-cyan-500",
    bgLight: "bg-cyan-50 dark:bg-cyan-950/30"
  },
  {
    id: "vaya",
    name: "১০. বয় (Vaya)",
    subtitle: "কালানুক্রমিক ও জৈবিক বয়স",
    description: "জীবনকে বাল্য (শৈশব), মধ্যম (যৌবন/পিত্ত প্রধান), এবং বার্ধক্য (ক্ষয়িষ্ণু) পর্যায়ে ভাগ করা। অঙ্গের ক্ষমতা ও বিপাকীয় হারের সাথে সম্পর্কিত।",
    clinical: "শিশু ও বয়স্কদের ওষুধের মাত্রা সমন্বয় এবং রোগের পূর্বাভাস নির্ধারণ করে।",
    iconColor: "text-rose-500",
    bgLight: "bg-rose-50 dark:bg-rose-950/30"
  }
];

export const ENGLISH_FAQS: FaqData[] = [
  {
    q: "Are my personal and medical information used to train AI models?",
    a: "No, absolutely not. Under the Digital Personal Data Protection (DPDP) Act 2023 and strict healthcare privacy standards, all patient data, vitals, medical records, and conversation audio transcripts are strictly private, end-to-end encrypted, and stored solely for your attending physician. These personal informations are not used to train AI."
  },
  {
    q: "What is ABHA ID and do I need one to use HealthPoint?",
    a: "An ABHA (Ayushman Bharat Health Account) ID is a unique 14-digit digital health identifier issued by the Government of India under the Ayushman Bharat Digital Mission (ABDM). It digitally links and organizes all your prescriptions, diagnostic reports, and medical history across clinics and hospitals. You do NOT need an ABHA ID to use HealthPoint. While having an ABHA ID enables seamless national record synchronization, you can easily sign in or create an account using your Mobile Phone Number (with OTP) or your Email Address. HealthPoint welcomes every patient regardless of whether they have an ABHA ID."
  },
  {
    q: "How does the two-way prescription upload system work?",
    a: "The upload system is fully bidirectional: Patients can upload prior prescriptions, discharge summaries, and blood test reports during intake for the doctor to review. Following consultation, the doctor can upload their official digital prescription PDF. Once uploaded, the patient receives an instant simulated SMS to their mobile number and an email notification to their Gmail with immediate download access. Simultaneously the patient can upload the prescription for documentation after consultation."
  },
  {
    q: "Can I review my information before the report is sent to the doctor?",
    a: "Yes! In the patient dashboard, after completing your intake and symptom dialogue, HealthPoint presents a comprehensive Confirmation Page. Here you can inspect all your recorded answers, vitals, and selections to ensure they are 100% accurate before final report generation."
  },
  {
    q: "Can I download my full AI chat dialogue transcript separately?",
    a: "Yes! HealthPoint generates two separate, dedicated PDF documents: 1) A Clinical Intake Summary containing all structured patient demographics, symptoms, vitals, and clinical analysis, and 2) A complete chronological AI Chat History PDF with every question and response. Both PDFs have dedicated download buttons."
  },
  {
    q: "What is Dashavidha Pariksha and why is it included?",
    a: "Dashavidha Pariksha is the classical 10-fold Ayurvedic diagnostic methodology that examines holistic vitality—such as digestive fire (Ahara Shakti), tissue strength (Sara), and psychological fortitude (Sattva). It helps the providers to gain 360-degree understanding of patient health."
  }
];

export const HINDI_FAQS: FaqData[] = [
  {
    q: "क्या मेरी व्यक्तिगत और चिकित्सीय जानकारी का उपयोग एआई मॉडल को प्रशिक्षित करने के लिए किया जाता है?",
    a: "नहीं, बिल्कुल नहीं। डिजिटल पर्सनल डेटा प्रोटेक्शन (DPDP) अधिनियम 2023 और स्वास्थ्य सेवा गोपनीयता मानकों के तहत, रोगी का सारा डेटा, वाइटल्स, मेडिकल रिकॉर्ड और बातचीत के ऑडियो ट्रांसक्रिप्ट पूरी तरह से निजी, एंड-टू-एंड एन्क्रिप्टेड हैं और केवल आपके डॉक्टर के लिए सुरक्षित रखे जाते हैं। इनका उपयोग एआई मॉडल को प्रशिक्षित करने के लिए कभी नहीं किया जाता।"
  },
  {
    q: "आभा (ABHA) आईडी क्या है और क्या मुझे HealthPoint का उपयोग करने के लिए इसकी आवश्यकता है?",
    a: "आभा (आयुष्मान भारत हेल्थ अकाउंट) आईडी भारत सरकार द्वारा आयुष्मान भारत डिजिटल मिशन (ABDM) के तहत जारी किया गया एक अद्वितीय 14-अंकीय डिजिटल स्वास्थ्य पहचानकर्ता है। यह आपके सभी पर्चे, रिपोर्ट और इतिहास को डिजिटल रूप से जोड़ता है। HealthPoint का उपयोग करने के लिए आपको आभा आईडी की अनिवार्य आवश्यकता नहीं है। आप अपने मोबाइल नंबर (ओटीपी द्वारा) या ईमेल पते से भी आसानी से लॉगिन कर सकते हैं।"
  },
  {
    q: "दो-तरफा प्रिस्क्रिप्शन अपलोड प्रणाली कैसे काम करती है?",
    a: "यह प्रणाली पूरी तरह से द्विदिशी है: मरीज डॉक्टर के निरीक्षण के लिए अपने पुराने पर्चे, डिस्चार्ज सारांश और लैब रिपोर्ट अपलोड कर सकते हैं। परामर्श के बाद, डॉक्टर अपना आधिकारिक डिजिटल प्रिस्क्रिप्शन पीडीएफ अपलोड करते हैं। अपलोड होने पर मरीज को एसएमएस और ईमेल द्वारा तुरंत डाउनलोड लिंक प्राप्त होता है।"
  },
  {
    q: "क्या मैं डॉक्टर को रिपोर्ट भेजने से पहले अपनी जानकारी की समीक्षा कर सकता हूँ?",
    a: "हाँ! मरीज डैशबोर्ड में, अपनी बातचीत पूरी करने के बाद, HealthPoint एक व्यापक समीक्षा पृष्ठ प्रस्तुत करता है। यहाँ आप डॉक्टर को अंतिम रिपोर्ट भेजने से पहले अपने सभी दर्ज उत्तरों, वाइटल्स और चयनों की जांच कर सकते हैं।"
  },
  {
    q: "क्या मैं अपने पूरे एआई चैट संवाद का अलग से पीडीएफ डाउनलोड कर सकता हूँ?",
    a: "हाँ! HealthPoint दो अलग-अलग पीडीएफ दस्तावेज तैयार करता है: १) एक क्लिनिकल इंटेक सारांश जिसमें जनसांख्यिकी, लक्षण और विश्लेषण शामिल हैं, और २) प्रत्येक प्रश्न और उत्तर के साथ एक संपूर्ण एआई चैट इतिहास पीडीएफ।"
  },
  {
    q: "दशविध परीक्षा क्या है और इसे क्यों शामिल किया गया है?",
    a: "दशविध परीक्षा शास्त्रीय 10-गुना आयुर्वेदिक निदान पद्धति है जो समग्र जीवन शक्ति—जैसे पाचन अग्नि (आहार शक्ति), ऊतक शक्ति (सार), और मानसिक धैर्य (सत्त्व) की जांच करती है। यह डॉक्टरों को रोगी के स्वास्थ्य की 360-डिग्री समझ प्रदान करती है।"
  }
];

export const BENGALI_FAQS: FaqData[] = [
  {
    q: "আমার ব্যক্তিগত ও চিকিৎসাগত তথ্য কি এআই মডেল প্রশিক্ষণের জন্য ব্যবহার করা হয়?",
    a: "না, একেবারেই না। ডিজিটাল পার্সোনাল ডেটা প্রোটেকশন (DPDP) অ্যাক্ট ২০২৩ এবং কঠোর গোপনীয়তা নীতি অনুসারে, রোগীর সমস্ত তথ্য, ভাইটালস ও অডিও ট্রান্সক্রিপ্ট সম্পূর্ণ ব্যক্তিগত, এন্ড-টু-এন্ড এনক্রিপ্ট করা এবং শুধুমাত্র আপনার ডাক্তারের জন্য সংরক্ষিত। এআই প্রশিক্ষণের জন্য এগুলো কখনোই ব্যবহৃত হয় না।"
  },
  {
    q: "আভা (ABHA) আইডি কী এবং HealthPoint ব্যবহারের জন্য কি এটি প্রয়োজন?",
    a: "আভা আইডি হলো ভারত সরকার কর্তৃক আয়ুষ্মান ভারত ডিজিটাল মিশনের (ABDM) অধীনে জারি করা একটি ১৪-সংখ্যার ডিজিটাল স্বাস্থ্য পরিচয়পত্র। HealthPoint ব্যবহার করার জন্য আভা আইডি থাকা বাধ্যতামূলক নয়। আপনি সহজেই মোবাইল নম্বর (ওটিপি সহ) বা ইমেল ঠিকানা দিয়ে সাইন ইন করতে পারেন।"
  },
  {
    q: "দ্বিমুখী প্রেসক্রিপশন আপলোড সিস্টেম কীভাবে কাজ করে?",
    a: "রোগীরা ডাক্তারের পর্যালোচনার জন্য তাদের পূর্বের প্রেসক্রিপশন এবং পরীক্ষার রিপোর্ট আপলোড করতে পারেন। পরামর্শের পরে ডাক্তার ডিজিটাল প্রেসক্রিপশন আপলোড করলে রোগী সাথে সাথে এসএমএস ও ইমেলের মাধ্যমে ডাউনলোড লিংক পেয়ে যান।"
  },
  {
    q: "ডাক্তারের কাছে রিপোর্ট পাঠানোর আগে কি আমি আমার তথ্য পর্যালোচনা করতে পারি?",
    a: "হ্যাঁ! লক্ষণ সম্পর্কিত কথোপকথন শেষ করার পরে, HealthPoint একটি পূর্ণাঙ্গ পর্যালোচনা পেজ প্রদর্শন করে। এখানে আপনি চূড়ান্ত রিপোর্ট জমা দেওয়ার আগে আপনার সমস্ত তথ্য যাচাই করতে পারেন।"
  },
  {
    q: "আমি কি আমার সম্পূর্ণ এআই চ্যাট হিস্ট্রি আলাদাভাবে ডাউনলোড করতে পারি?",
    a: "হ্যাঁ! HealthPoint দুটি পৃথক পিডিএফ তৈরি করে: ১) ক্লিনিক্যাল ইনটেক সারাংশ এবং ২) সম্পূর্ণ এআই চ্যাট ডায়ালগ হিস্ট্রি পিডিএফ।"
  },
  {
    q: "দশবিধ পরীক্ষা কী এবং এটি কেন অন্তর্ভুক্ত করা হয়েছে?",
    a: "দশবিধ পরীক্ষা হলো ধ্রুপদী ১০-গুণ আয়ুর্বেদিক ডায়াগনস্টিক পদ্ধতি যা সামগ্রিক জীবনীশক্তি—যেমন হজম ক্ষমতা (আহার শক্তি), টিস্যুর শক্তি (সার) এবং মানসিক ধৈর্য (সত্ত্ব) মূল্যায়ন করে।"
  }
];
