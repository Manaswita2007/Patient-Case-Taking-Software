import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useMotionTemplate, useScroll, useTransform, useSpring } from 'motion/react';
import { 
  UserCircle, Stethoscope, ShieldCheck, 
  ChevronRight, HeartPulse, Lock, ActivitySquare, Network,
  Leaf, FileText, CheckCircle2,
  Hexagon, CircleDot, Boxes, Sparkles, Clock, Languages, CreditCard,
  Check, Copy, Activity, HelpCircle, ChevronDown
} from 'lucide-react';
import { useAppContext, LANGUAGE_NAMES } from '../context/AppContext';
import { useEffect, useState, useRef } from 'react';
import { 
  ENGLISH_PILLARS, HINDI_PILLARS, BENGALI_PILLARS, 
  ENGLISH_FAQS, HINDI_FAQS, BENGALI_FAQS, 
  PillarData, FaqData 
} from '../data/dashavidhaData';

// Advanced interactive background with 3D Grid, Animated ECG Pulse, and Particle Visuals
const GridBackground = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 300]);
  const rotateX = useTransform(scrollY, [0, 1000], [50, 20]);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-slate-50 dark:bg-[#030712] perspective-1000">
      
      {/* 3D Moving Grid Floor */}
      <motion.div 
        style={{ y, rotateX }}
        className="absolute inset-[-100%] origin-top bg-[linear-gradient(to_right,#06b6d41a_1px,transparent_1px),linear-gradient(to_bottom,#06b6d41a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:linear-gradient(to_bottom,transparent_10%,#000_60%,transparent_100%)] transform-style-3d" 
      />
      
      {/* Noise Overlay */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      {/* Animated Glowing Ambient Orbs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.15, 1],
          opacity: [0.35, 0.55, 0.35],
          x: [0, 30, 0],
          y: [0, -20, 0]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-500/20 dark:bg-cyan-600/30 blur-3xl"
      />
      <motion.div 
        animate={{ 
          scale: [1.1, 0.95, 1.1],
          opacity: [0.4, 0.6, 0.4],
          x: [0, -40, 0],
          y: [0, 30, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-[20%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-blue-500/20 dark:bg-blue-600/30 blur-3xl"
      />
      <motion.div 
        animate={{ 
          scale: [0.95, 1.1, 0.95],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        className="absolute bottom-[-15%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-indigo-500/15 dark:bg-indigo-600/25 blur-3xl"
      />

      {/* Animated SVG ECG Pulse Waves across Background */}
      <div className="absolute inset-x-0 top-[22%] opacity-20 dark:opacity-30 flex items-center justify-center overflow-hidden">
        <svg className="w-full h-32 text-cyan-500" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <motion.path
            d="M0,60 L200,60 L230,20 L250,100 L270,40 L290,75 L310,60 L600,60 L630,15 L650,105 L670,35 L690,80 L710,60 L1000,60 L1030,25 L1050,95 L1070,45 L1090,70 L1110,60 L1200,60"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            initial={{ pathLength: 0, pathOffset: 0 }}
            animate={{ pathLength: 1, pathOffset: [0, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          />
        </svg>
      </div>

      {/* Floating Ambient Medical Micro-particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-cyan-400/40 dark:bg-cyan-300/30 blur-[1px]"
            style={{
              width: `${(i % 3) * 4 + 4}px`,
              height: `${(i % 3) * 4 + 4}px`,
              left: `${(i * 17) % 94}%`,
              top: `${(i * 23) % 88}%`,
            }}
            animate={{
              y: [0, -40 - (i * 5), 0],
              x: [0, (i % 2 === 0 ? 20 : -20), 0],
              opacity: [0.2, 0.7, 0.2],
              scale: [1, 1.4, 1]
            }}
            transition={{
              duration: 7 + (i % 5),
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.4
            }}
          />
        ))}
      </div>
    </div>
  );
};

// 3D Floating abstract tech/medical elements
const FloatingVisuals = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, -250]);
  const y2 = useTransform(scrollY, [0, 1000], [0, 250]);
  const y3 = useTransform(scrollY, [0, 1000], [0, -150]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 hidden lg:block perspective-1000">
      
      {/* 3D Geometric Tech Element with Pulse Glow */}
      <motion.div
        style={{ y: y1, transformStyle: 'preserve-3d' }}
        className="absolute top-[15%] left-[5%] w-48 h-48"
      >
        <motion.div
           animate={{ rotateZ: 360 }}
           transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
           className="w-full h-full bg-white/10 dark:bg-cyan-900/10 backdrop-blur-md border border-cyan-500/20 dark:border-cyan-500/30 rounded-[2rem] flex flex-col items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.15)]"
           style={{ translateZ: '50px' }}
        >
          <Hexagon className="w-16 h-16 text-cyan-500 mb-4 opacity-80 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]" />
          <div className="flex gap-2">
            <div className="h-1.5 w-8 bg-cyan-400/50 rounded-full"></div>
            <div className="h-1.5 w-4 bg-cyan-400/50 rounded-full"></div>
          </div>
        </motion.div>
      </motion.div>

      {/* 3D Holistic Node with Radiant Pulse */}
      <motion.div
        style={{ y: y2, transformStyle: 'preserve-3d' }}
        className="absolute top-[40%] right-[5%] w-56 h-56"
      >
         <motion.div
            animate={{ rotateZ: -360 }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            className="w-full h-full bg-white/10 dark:bg-emerald-900/10 backdrop-blur-md border border-emerald-500/20 dark:border-emerald-500/30 rounded-full flex flex-col items-center justify-center shadow-[0_0_35px_rgba(16,185,129,0.15)]"
            style={{ translateZ: '70px' }}
         >
          <CircleDot className="w-20 h-20 text-emerald-500 mb-4 opacity-80 drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
          <div className="h-1.5 w-16 bg-emerald-400/50 rounded-full"></div>
         </motion.div>
      </motion.div>

      {/* 3D Datacube */}
      <motion.div
        style={{ y: y3, transformStyle: 'preserve-3d' }}
        className="absolute bottom-[10%] left-[25%] w-32 h-32"
      >
        <motion.div
          animate={{ rotateX: 360, rotateY: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="w-full h-full border border-indigo-500/30 rounded-xl flex items-center justify-center bg-indigo-900/5 backdrop-blur-md shadow-[0_0_30px_rgba(99,102,241,0.2)]"
        >
          <Boxes className="w-12 h-12 text-indigo-400 opacity-80 drop-shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
        </motion.div>
      </motion.div>
    </div>
  );
};

// High-speed marquee
const Marquee = () => {
  return (
    <div className="relative flex overflow-x-hidden bg-slate-900/80 dark:bg-[#060b14]/80 text-white dark:text-cyan-400 font-mono text-[10px] md:text-[11px] py-3 border-y border-slate-800 dark:border-cyan-900/40 uppercase tracking-widest whitespace-nowrap z-20 shadow-[0_0_30px_rgba(6,182,212,0.1)] backdrop-blur-xl">
      <motion.div 
        className="flex items-center gap-10 min-w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ ease: "linear", duration: 25, repeat: Infinity }}
      >
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-10 shrink-0">
            <span className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400"/> 99.9% UPTIME</span>
            <span className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-blue-400"/> HIPAA COMPLIANT</span>
            <span className="flex items-center gap-2"><Hexagon className="w-3.5 h-3.5 text-purple-400"/> INTELLIGENT INTAKE</span>
            <span className="flex items-center gap-2"><Leaf className="w-3.5 h-3.5 text-teal-400"/> INTEGRATED WELLNESS</span>
            <span className="flex items-center gap-2"><HeartPulse className="w-3.5 h-3.5 text-red-400"/> VITAL MONITORING</span>
            <span className="flex items-center gap-2"><Network className="w-3.5 h-3.5 text-cyan-400"/> WS SYNC</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

// Hyper-interactive 3D Tilt Card
const TiltCard = ({ children, to, className = "", glowColor = "rgba(6,182,212,0.5)" }: { children: React.ReactNode, to: string, className?: string, glowColor?: string }) => {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x, { stiffness: 200, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 200, damping: 30 });
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{ rotateY, rotateX, transformStyle: "preserve-3d" }}
      className="relative h-full perspective-1000 z-30"
    >
       <Link
         ref={ref}
         to={to}
         onMouseMove={handleMouseMove}
         onMouseLeave={handleMouseLeave}
         className={`block h-full relative group rounded-[2.5rem] overflow-hidden transition-all duration-300 shadow-2xl border border-slate-200/50 dark:border-slate-700/50 bg-white/40 dark:bg-[#0a0f1c]/60 backdrop-blur-2xl ${className}`}
       >
         {/* Dynamic Spotlight inside the card */}
         <motion.div
           className="pointer-events-none absolute -inset-px rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0 mix-blend-screen"
           style={{
             background: useMotionTemplate`
               radial-gradient(
                 600px circle at ${useTransform(x, v => (v + 0.5) * 100)}% ${useTransform(y, v => (v + 0.5) * 100)}%,
                 ${glowColor},
                 transparent 60%
               )
             `,
           }}
         />
         <div className="relative z-10 h-full transform-style-3d">
            {children}
         </div>
       </Link>
    </motion.div>
  )
}

// 3D Bento Card
const SpotlightCard = ({ children, className = "", delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay, type: "spring", bounce: 0.3 }}
      className={`relative group overflow-hidden rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-[#0a0f1c]/60 backdrop-blur-2xl transition-all duration-500 hover:border-cyan-500/50 hover:shadow-[0_0_40px_rgba(6,182,212,0.15)] ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[2.5rem] opacity-0 transition duration-500 group-hover:opacity-100 z-10"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              1000px circle at ${mouseX}px ${mouseY}px,
              rgba(6, 182, 212, 0.15),
              transparent 80%
            )
          `,
        }}
      />
      {/* 3D content wrapper */}
      <motion.div 
        className="relative z-20 h-full"
        animate={{ 
          scale: isHovered ? 1.02 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

export default function Home() {
  const { t } = useAppContext();
  const [mounted, setMounted] = useState(false);
  
  // Hero Parallax Tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const wasLoggedIn = localStorage.getItem('patientId') || localStorage.getItem('doctorId') || localStorage.getItem('patientToken');
    if (wasLoggedIn) {
      localStorage.removeItem('patientId');
      localStorage.removeItem('doctorId');
      localStorage.removeItem('patientToken');
      localStorage.removeItem('patientIdentifier');
      localStorage.removeItem('identifierType');
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      mouseX.set((e.clientX / innerWidth - 0.5) * 30);
      mouseY.set((e.clientY / innerHeight - 0.5) * 30);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  if (!mounted) return null;

  return (
    <div className="flex-1 min-h-0 w-full overflow-y-auto relative bg-transparent transition-colors scroll-smooth">
      <GridBackground />
      <FloatingVisuals />
      
      {/* Advanced Hero Section */}
      <div className="relative pt-6 pb-2 lg:pt-8 lg:pb-4 z-20 perspective-1000">
         <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
           <motion.div 
             initial={{ opacity: 0, scale: 0.95, rotateX: 10 }}
             animate={{ opacity: 1, scale: 1, rotateX: 0 }}
             transition={{ duration: 1.2, type: 'spring', bounce: 0.3 }}
             style={{ x: springX, y: springY, transformStyle: "preserve-3d" }}
             className="max-w-3xl mx-auto relative z-20"
           >
             <motion.h1 style={{ translateZ: '60px' }} className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-2 leading-[1.1] drop-shadow-2xl">
               {t('appTitle')}
             </motion.h1>
             
             <motion.p style={{ translateZ: '30px' }} className="text-sm md:text-base text-slate-700 dark:text-slate-300 max-w-xl mx-auto font-medium mb-4 leading-relaxed drop-shadow-md">
               Bridging modern clinical workflows with intelligent structural clinical intake and integrated holistic systems.
             </motion.p>
           </motion.div>
         </div>
      </div>

      {/* Interactive 3D Portals Section */}
      <div className="pb-10 pt-2 relative z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-5 lg:gap-6">
            
            <motion.div 
              initial={{ opacity: 0, x: -50, rotateY: 15 }}
              whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 1.2, type: "spring", bounce: 0.25 }}
              className="perspective-1000 h-[280px]"
            >
              <TiltCard to="/patient/login" glowColor="rgba(249, 115, 22, 0.3)">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-orange-600/10 dark:from-orange-500/10 dark:to-orange-600/10" />
                
                <div className="relative p-5 flex flex-col items-center text-center h-full justify-center">
                  <motion.div 
                    className="w-14 h-14 bg-gradient-to-br from-white to-orange-50 dark:from-slate-900 dark:to-orange-950/30 rounded-2xl flex items-center justify-center mb-3 border border-orange-200 dark:border-orange-800 shadow-[inset_0_4px_15px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_4px_15px_rgba(0,0,0,0.4)]"
                    style={{ translateZ: '60px' }}
                  >
                    <UserCircle className="w-6 h-6 text-orange-600 dark:text-orange-400 drop-shadow-[0_0_10px_rgba(249,115,22,0.4)]" />
                  </motion.div>
                  
                  <motion.h2 style={{ translateZ: '40px' }} className="text-lg md:text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                    {t('patientPortal')}
                  </motion.h2>
                  <motion.p style={{ translateZ: '20px' }} className="text-slate-600 dark:text-slate-400 mb-4 flex-1 text-xs md:text-sm max-w-xs mx-auto">
                    {t('patientDesc')}
                  </motion.p>
                  
                  <motion.div style={{ translateZ: '50px' }} className="w-[80%] py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-[10px] uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5 shadow-[0_8px_20px_rgba(249,115,22,0.3)]">
                    {t('kioskMode')} <ChevronRight className="w-3.5 h-3.5" />
                  </motion.div>
                </div>
              </TiltCard>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50, rotateY: -15 }}
              whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 1.2, type: "spring", bounce: 0.25, delay: 0.15 }}
              className="perspective-1000 h-[280px]"
            >
              <TiltCard to="/doctor/login" glowColor="rgba(16, 185, 129, 0.3)">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-emerald-600/10 dark:from-emerald-500/10 dark:to-emerald-600/10" />
                
                <div className="relative p-5 flex flex-col items-center text-center h-full justify-center">
                  <motion.div 
                    className="w-14 h-14 bg-gradient-to-br from-white to-emerald-50 dark:from-slate-900 dark:to-emerald-950/30 rounded-2xl flex items-center justify-center mb-3 border border-emerald-200 dark:border-emerald-800 shadow-[inset_0_4px_15px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_4px_15px_rgba(0,0,0,0.4)]"
                    style={{ translateZ: '60px' }}
                  >
                    <Stethoscope className="w-6 h-6 text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
                  </motion.div>
                  
                  <motion.h2 style={{ translateZ: '40px' }} className="text-lg md:text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                    {t('providerDashboard')}
                  </motion.h2>
                  <motion.p style={{ translateZ: '20px' }} className="text-slate-600 dark:text-slate-400 mb-4 flex-1 text-xs md:text-sm max-w-xs mx-auto">
                    {t('providerDesc')}
                  </motion.p>
                  
                  <motion.div style={{ translateZ: '50px' }} className="w-[80%] py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5 shadow-[0_8px_20px_rgba(16,185,129,0.3)]">
                    {t('secureLogin')} <ChevronRight className="w-3.5 h-3.5" />
                  </motion.div>
                </div>
              </TiltCard>
            </motion.div>

          </div>
        </div>
      </div>

      <Marquee />

      {/* NEW INTERACTIVE SECTIONS: About Us, What is ABHA ID, Dashavidha Pariksha, and FAQs */}
      <HomeInteractiveSections />
    </div>
  );
}

function HomeInteractiveSections() {
  const { t, language } = useAppContext();
  const [activeAbhaTab, setActiveAbhaTab] = useState<'what' | 'benefits' | 'card'>('what');
  const [selectedAyushPillar, setSelectedAyushPillar] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [copiedAbha, setCopiedAbha] = useState(false);

  const ayushPillars = [
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

  const faqs = [
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

  const [displayFaqs, setDisplayFaqs] = useState<FaqData[]>(ENGLISH_FAQS);
  const [displayPillars, setDisplayPillars] = useState<PillarData[]>(ENGLISH_PILLARS);

  useEffect(() => {
    // 1. Instant built-in datasets for 0ms transition
    if (language === 'en') {
      setDisplayFaqs(ENGLISH_FAQS);
      setDisplayPillars(ENGLISH_PILLARS);
      return;
    }
    if (language === 'hi') {
      setDisplayFaqs(HINDI_FAQS);
      setDisplayPillars(HINDI_PILLARS);
      return;
    }
    if (language === 'bn') {
      setDisplayFaqs(BENGALI_FAQS);
      setDisplayPillars(BENGALI_PILLARS);
      return;
    }

    // 2. For other languages, check localStorage cache first
    const cacheKeyFaqs = `faqs_${language}`;
    const cacheKeyPillars = `pillars_${language}`;
    try {
      const cachedF = localStorage.getItem(cacheKeyFaqs);
      const cachedP = localStorage.getItem(cacheKeyPillars);
      if (cachedF) setDisplayFaqs(JSON.parse(cachedF));
      if (cachedP) setDisplayPillars(JSON.parse(cachedP));
      if (cachedF && cachedP) return;
    } catch (e) {}

    const targetLangName = LANGUAGE_NAMES[language] || 'English';

    // Fetch FAQs translation
    fetch('/api/translate/faqs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ faqs: ENGLISH_FAQS, targetLanguage: targetLangName })
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.faqs) {
          setDisplayFaqs(data.faqs);
          try { localStorage.setItem(cacheKeyFaqs, JSON.stringify(data.faqs)); } catch(e) {}
        }
      })
      .catch(err => console.error("Error translating FAQs in Home:", err));

    // Fetch Pillars translation
    fetch('/api/translate/pillars', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pillars: ENGLISH_PILLARS, targetLanguage: targetLangName })
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.pillars) {
          setDisplayPillars(data.pillars);
          try { localStorage.setItem(cacheKeyPillars, JSON.stringify(data.pillars)); } catch(e) {}
        }
      })
      .catch(err => console.error("Error translating Pillars in Home:", err));
  }, [language]);

  const handleCopyDemoAbha = () => {
    navigator.clipboard.writeText("14-9872-3456-1029");
    setCopiedAbha(true);
    setTimeout(() => setCopiedAbha(false), 3000);
  };

  return (
    <div className="relative z-20 space-y-24 py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      
      {/* SECTION 1: ABOUT US */}
      <section id="about-us" className="scroll-mt-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold text-xs uppercase tracking-widest mb-3 border border-blue-200 dark:border-blue-800/50">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" /> {t('acceleratingHealthcareIntake')}
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('aboutTitle')}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mt-3">
            {t('aboutDesc')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div 
            whileHover={{ y: -5 }}
            className="p-6 bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col"
          >
            <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t('zeroWaitingTitle')}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {t('zeroWaitingDesc')}
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="p-6 bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
              <Languages className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t('multilingualTitle')}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {t('multilingualDesc')}
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="p-6 bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t('privacyTitle')}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {t('privacyDesc')}
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="p-6 bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
              <Leaf className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t('integrativeTitle')}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {t('integrativeDesc')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: WHAT IS ABHA ID */}
      <section id="what-is-abha" className="scroll-mt-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-bold text-xs uppercase tracking-widest mb-3 border border-emerald-200 dark:border-emerald-800/50">
            <CreditCard className="w-3.5 h-3.5 text-emerald-500" /> {t('nationalDigitalId')}
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('whatIsAbhaTitle')}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mt-3">
            {t('whatIsAbhaDesc')}
          </p>
        </motion.div>

        {/* Interactive Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveAbhaTab('what')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeAbhaTab === 'what' 
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              {t('keyConcept')}
            </button>
            <button
              onClick={() => setActiveAbhaTab('benefits')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeAbhaTab === 'benefits' 
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              {t('citizenBenefits')}
            </button>
            <button
              onClick={() => setActiveAbhaTab('card')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeAbhaTab === 'card' 
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              {t('interactiveDemo')}
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        <AnimatePresence mode="wait">
          {activeAbhaTab === 'what' && (
            <motion.div 
              key="tab-what"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div className="p-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mb-2">14-Digit Format</div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">{t('standardizedIdentity')}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t('standardizedIdentityDesc')}
                </p>
              </div>

              <div className="p-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mb-2">ABDM Protocol</div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">{t('nationalInteroperability')}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t('nationalInteroperabilityDesc')}
                </p>
              </div>

              <div className="p-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mb-2">Consent Driven</div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">{t('patientControl')}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t('patientControlDesc')}
                </p>
              </div>
            </motion.div>
          )}

          {activeAbhaTab === 'benefits' && (
            <motion.div 
              key="tab-benefits"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">{t('paperlessConsultation')}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{t('paperlessConsultationDesc')}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">{t('instantHospitalScanShare')}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{t('instantHospitalScanShareDesc')}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">{t('accurateDiagnosticTimeline')}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{t('accurateDiagnosticTimelineDesc')}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/50 text-orange-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">{t('accessibleViaMobileEmail')}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{t('accessibleViaMobileEmailDesc')}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeAbhaTab === 'card' && (
            <motion.div 
              key="tab-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center"
            >
              <div className="w-full max-w-md bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-2xl border border-indigo-800/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/50">
                      {t('demoCardTitle')}
                    </span>
                    <h3 className="text-xl font-black tracking-tight mt-1">Ayushman Bharat (ABHA)</h3>
                    <p className="text-[11px] text-slate-400">Ministry of Health & Family Welfare</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-emerald-400 border border-white/10">
                    NDHM
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-xl font-bold shadow-md">
                    PK
                  </div>
                  <div>
                    <div className="font-bold text-lg">Priya Sharma</div>
                    <div className="text-xs text-slate-300">Gender: Female | DOB: 14/08/1994</div>
                    <div className="text-xs text-emerald-400 font-mono mt-0.5">priyasharma@abdm</div>
                  </div>
                </div>

                <div className="bg-black/40 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{t('abhaIdLabel')}</div>
                    <div className="font-mono text-base font-black tracking-widest text-white">
                      14-9872-3456-1029
                    </div>
                  </div>
                  <button 
                    onClick={handleCopyDemoAbha}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    {copiedAbha ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedAbha ? t('copied') : t('remove').replace('Remove', 'Copy')}</span>
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 text-center">
                Click "Copy" to test logging into HealthPoint using this sample verified ABHA ID!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* SECTION 3: ABOUT DASHAVIDHA PARIKSHA */}
      <section id="about-dashavidha" className="scroll-mt-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 font-bold text-xs uppercase tracking-normal mb-3 border border-amber-200 dark:border-amber-800/50">
            <Leaf className="w-3.5 h-3.5 text-amber-500" /> {t('ayushClinicalScience') || 'Ayurvedic Clinical Diagnostic Science'}
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-normal">
            {t('aboutDashavidhaTitle') || 'About Dashavidha Pariksha'}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mt-3 tracking-normal">
            {t('aboutDashavidhaDesc') || 'Derived from Charaka Samhita (Vimana Sthana 8/94), Dashavidha Pariksha is the comprehensive 10-fold clinical examination for evaluating a patient’s constitution, vitality, and treatment tolerance.'}
          </p>
        </motion.div>

        {/* Interactive 10-Fold Explorer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: 10 Pillar Selectors */}
          <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-2 gap-2.5">
            {displayPillars.map((pillar, idx) => (
              <button
                key={pillar.id}
                onClick={() => setSelectedAyushPillar(idx)}
                className={`text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                  selectedAyushPillar === idx
                    ? 'bg-amber-600 text-white border-amber-600 shadow-md scale-[1.02]'
                    : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-amber-400'
                }`}
              >
                <div className="text-xs font-black truncate tracking-normal">{pillar.name}</div>
                <div className={`text-[10px] truncate mt-0.5 tracking-normal ${selectedAyushPillar === idx ? 'text-amber-100' : 'text-slate-500 dark:text-slate-400'}`}>
                  {pillar.subtitle}
                </div>
              </button>
            ))}
          </div>

          {/* Right Column: Detailed Card for Selected Pillar */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {(() => {
                const current = displayPillars[selectedAyushPillar];
                if (!current) return null;
                return (
                  <motion.div
                    key={current.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold uppercase tracking-normal text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-xl border border-amber-200 dark:border-amber-800/40">
                        {t('diagnosticPillarBadge') || 'Diagnostic Pillar'} #{selectedAyushPillar + 1} {t('ofTen') || 'of 10'}
                      </span>
                      <Leaf className="w-6 h-6 text-amber-500 opacity-80" />
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1 tracking-normal">
                      {current.name}
                    </h3>
                    <div className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-4 tracking-normal">
                      {current.subtitle}
                    </div>

                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-6 tracking-normal">
                      {current.description}
                    </p>

                    <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60">
                      <div className="text-xs font-bold uppercase tracking-normal text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-amber-500" />
                        {t('modernIntegrativeRationale') || 'Modern Integrative Clinical Rationale'}
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 tracking-normal">
                        {current.clinical}
                      </p>
                    </div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* SECTION 4: FAQS ACCORDION */}
      <section id="faqs" className="scroll-mt-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 flex flex-col items-center justify-center"
        >
          <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-normal mb-3 border border-slate-200 dark:border-slate-700">
            <HelpCircle className="w-4 h-4 text-blue-500 shrink-0" />
            <span>{t('frequentlyAskedQuestions') || 'Frequently Asked Questions'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-normal text-center">
            {t('faqTitle')}
          </h2>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-3">
          {displayFaqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div 
                key={idx}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-all text-left"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-2">
                    <span className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-black flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-900/50">
                      Q{idx + 1}
                    </span>
                    <span className="text-sm sm:text-base font-bold leading-normal flex-1 tracking-normal text-slate-900 dark:text-white">
                      {faq.q}
                    </span>
                  </div>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform ${isOpen ? 'rotate-180 bg-blue-50 dark:bg-blue-900/40 text-blue-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-5 sm:px-6 pb-5 sm:pb-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-4 tracking-normal text-left pl-14 sm:pl-16"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
