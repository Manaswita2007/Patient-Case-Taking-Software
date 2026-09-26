import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import TTSButton from './TTSButton';

export const questions = [
  {
    id: "prakriti",
    textEn: "Prakriti (Constitution): How would you describe your natural physical build?",
    textHi: "प्रकृति: आप अपने स्वाभाविक शारीरिक बनावट का वर्णन कैसे करेंगे?",
    options: [
      { id: "o1", en: "Thin / Slender (Vata)", hi: "पतला / छरहरा (वात)" },
      { id: "o2", en: "Medium / Muscular (Pitta)", hi: "मध्यम / गठीला (पित्त)" },
      { id: "o3", en: "Broad / Heavy (Kapha)", hi: "चौड़ा / भारी (कफ)" }
    ]
  },
  {
    id: "vikriti",
    textEn: "Vikriti (Imbalance): What is your primary ongoing discomfort currently?",
    textHi: "विकृति: वर्तमान में आपकी मुख्य परेशानी क्या है?",
    options: [
      { id: "o1", en: "Dryness / Pain / Anxiety", hi: "रूखापन / दर्द / चिंता" },
      { id: "o2", en: "Heat / Acidity / Inflammation", hi: "गर्मी / एसिडिटी / सूजन" },
      { id: "o3", en: "Heaviness / Congestion / Lethargy", hi: "भारीपन / कफ / सुस्ती" },
      { id: "o4", en: "None (Healthy)", hi: "कोई नहीं (स्वस्थ)" }
    ]
  },
  {
    id: "sara",
    textEn: "Sara (Tissue Quality): How do you perceive your skin, hair, and overall vitality?",
    textHi: "सार (धातु): आप अपनी त्वचा, बालों और जीवन शक्ति को कैसे देखते हैं?",
    options: [
      { id: "o1", en: "Excellent / Glowing", hi: "उत्कृष्ट / चमकदार" },
      { id: "o2", en: "Moderate / Average", hi: "मध्यम / औसत" },
      { id: "o3", en: "Dry / Dull / Weak", hi: "रूखा / सुस्त / कमजोर" }
    ]
  },
  {
    id: "samhanana",
    textEn: "Samhanana (Compactness): How well-built and compact are your joints and muscles?",
    textHi: "संहनन: आपके जोड़ और मांसपेशियां कितनी सुगठित और मजबूत हैं?",
    options: [
      { id: "o1", en: "Very Compact & Strong", hi: "बहुत सुगठित और मजबूत" },
      { id: "o2", en: "Moderately Built", hi: "मध्यम रूप से निर्मित" },
      { id: "o3", en: "Loose / Weak Joints", hi: "ढीले / कमजोर जोड़" }
    ]
  },
  {
    id: "pramana",
    textEn: "Pramana (Proportions): Are your body parts (height, weight, limbs) proportionate?",
    textHi: "प्रमाण: क्या आपके शरीर के अंग एक दूसरे के अनुपात में हैं?",
    options: [
      { id: "o1", en: "Highly Proportionate", hi: "अत्यधिक आनुपातिक" },
      { id: "o2", en: "Average", hi: "औसत" },
      { id: "o3", en: "Disproportionate (Under/Over weight)", hi: "गैर-आनुपातिक (कम/अधिक वजन)" }
    ]
  },
  {
    id: "satmya",
    textEn: "Satmya (Adaptability): How easily can you adapt to changes in weather or food?",
    textHi: "सात्म्य: आप मौसम या भोजन में बदलाव के प्रति कितनी आसानी से ढल जाते हैं?",
    options: [
      { id: "o1", en: "Very Easily (Good tolerance)", hi: "बहुत आसानी से (अच्छी सहनशीलता)" },
      { id: "o2", en: "Takes some time", hi: "कुछ समय लगता है" },
      { id: "o3", en: "Get sick quickly (Low tolerance)", hi: "जल्दी बीमार हो जाते हैं" }
    ]
  },
  {
    id: "sattva",
    textEn: "Sattva (Mental Constitution): How do you handle stress or extreme challenges?",
    textHi: "सत्त्व: आप तनाव या अत्यधिक चुनौतियों का सामना कैसे करते हैं?",
    options: [
      { id: "o1", en: "Face bravely & remain calm", hi: "बहादुरी से सामना करते हैं और शांत रहते हैं" },
      { id: "o2", en: "Sometimes get anxious", hi: "कभी-कभी चिंतित हो जाते हैं" },
      { id: "o3", en: "Get panicked or nervous easily", hi: "आसानी से घबरा जाते हैं" }
    ]
  },
  {
    id: "aharashakti",
    textEn: "Ahara Shakti (Digestion): How is your appetite and digestion on a normal day?",
    textHi: "आहार शक्ति: सामान्य दिन में आपकी भूख और पाचन शक्ति कैसी रहती है?",
    options: [
      { id: "o1", en: "Very Strong / Quick Digestion", hi: "बहुत मजबूत / त्वरित पाचन" },
      { id: "o2", en: "Moderate / Variable", hi: "मध्यम / परिवर्तनशील" },
      { id: "o3", en: "Weak / Slow Digestion", hi: "कमजोर / धीमा पाचन" }
    ]
  },
  {
    id: "vyayamashakti",
    textEn: "Vyayama Shakti (Stamina): How much physical exertion can you comfortably perform?",
    textHi: "व्यायाम शक्ति: आप कितनी शारीरिक मेहनत आराम से कर सकते हैं?",
    options: [
      { id: "o1", en: "Heavy Exercise without fatigue", hi: "बिना थकान के भारी व्यायाम" },
      { id: "o2", en: "Moderate stamina", hi: "मध्यम सहनशक्ति" },
      { id: "o3", en: "Get tired easily", hi: "आसानी से थक जाते हैं" }
    ]
  },
  {
    id: "vaya",
    textEn: "Vaya (Age Impact): How are your energy levels compared to others your age?",
    textHi: "वय: अपनी उम्र के अन्य लोगों की तुलना में आपकी ऊर्जा का स्तर कैसा है?",
    options: [
      { id: "o1", en: "More energetic / youthful", hi: "अधिक ऊर्जावान / युवा" },
      { id: "o2", en: "About average", hi: "लगभग औसत" },
      { id: "o3", en: "Less energetic / aging faster", hi: "कम ऊर्जावान / तेजी से उम्र बढ़ना" }
    ]
  }
];

export default function AyushDetailedAssessment({ data, onChange, onComplete }: { data: any, onChange: (d: any) => void, onComplete: () => void }) {
  const { language } = useAppContext();

  const handleOptionSelect = (qId: string, value: string) => {
    onChange({ ...data, [qId]: value });
  };

  const answeredCount = Object.keys(data).length;
  const isComplete = answeredCount === questions.length;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-6 shadow-sm overflow-hidden relative">
      <div className="relative pb-4 mb-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Dashavidha Pariksha
            </h3>
            <TTSButton 
              text={`Dashavidha Pariksha 10-Point Core AYUSH Assessment. Completed ${answeredCount} of ${questions.length} questions.`} 
              size="sm" 
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">10-Point Core Assessment</p>
        </div>
        <div className="text-sm font-bold px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full shrink-0">
          {answeredCount} / {questions.length} Completed
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((q, index) => {
          const qText = language === 'hi' ? q.textHi : q.textEn;
          const selectedOption = q.options.find(opt => opt.id === data[q.id]);
          const selectedText = selectedOption ? (language === 'hi' ? selectedOption.hi : selectedOption.en) : null;
          const speechText = `${index + 1}. ${qText}. ${selectedText ? `Your selected response is: ${selectedText}.` : 'No response selected yet.'}`;
          
          return (
            <motion.div 
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50"
            >
              <div className="flex justify-between items-start gap-4 mb-4">
                <h4 className="text-sm md:text-base font-bold text-slate-800 dark:text-slate-200 leading-snug">
                  {index + 1}. {qText}
                </h4>
                <TTSButton 
                  text={speechText}
                  size="sm" 
                  label="Read Question & Answer"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {q.options.map(opt => {
                  const isSelected = data[q.id] === opt.id;
                  const optText = language === 'hi' ? opt.hi : opt.en;
                  
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleOptionSelect(q.id, opt.id)}
                      className={`text-left p-3 rounded-xl border-2 transition-all flex flex-col justify-between h-full min-h-[80px] ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 shadow-sm' 
                          : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="text-sm font-medium mb-2">{optText}</span>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-500 self-end" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      {isComplete && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 text-center"
        >
          <button
            onClick={onComplete}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95"
          >
            Assessment Complete
          </button>
        </motion.div>
      )}
    </div>
  );
}
