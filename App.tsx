import React, { Suspense, useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';
import { motion, useInView, useMotionValue, useTransform, animate, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowUpRight, Twitter, Disc, Send } from 'lucide-react';
import * as THREE from 'three';

// --- Types ---

interface Service {
  title: string;
  description: string;
}

interface ProcessStep {
  number: string;
  title: string;
  description: string;
}

interface TeamMember {
  name: string;
  role: string;
  description: string;
  socials?: {
    twitter?: string;
    telegram?: string;
  };
}

// --- Data ---

const services: Service[] = [
  { title: "Incubation & Advisory", description: "Nurturing early-stage projects through strategic guidance, infrastructure support, and long-term growth alignment." },
  { title: "Go To Market Strategy", description: "Crafting customized launch frameworks to position your project, capture attention, and scale user acquisition effectively." },
  { title: "KOL Management", description: "Activating influencers to elevate your project through targeted outreach, relationship building, and authentic engagement." },
  { title: "Project Fundraising", description: "Helping secure strategic investment with tailored pitch decks, investor outreach, and impactful fundraising campaigns." },
  { title: "MM & CEX Listings", description: "Introductions to market makers and CEXs to secure liquidity and expand your project's reach in the crypto space." },
  { title: "Content Creation", description: "Video and content creation to tell your story, drive awareness, and engage with your audience effectively." },
  { title: "Community Management", description: "Building and engaging Telegram and Discord communities to drive growth, engagement, and sustained participation." },
  { title: "Website & DApp Dev", description: "Creating stunning, high-performance websites & dapps that reflect your brand and provide a seamless user experience." },
];

const stats = [
  { label: "Funds Raised", value: 24, prefix: "$", suffix: "m+" },
  { label: "Successful Projects", value: 43, prefix: "", suffix: "+" },
  { label: "KOLs Activated", value: 1000, prefix: "", suffix: "+" },
];

const processSteps: ProcessStep[] = [
  { number: "01", title: "Discover & Strategize", description: "We dive deep into your vision, market landscape, and goals to craft a customized strategy built for real impact." },
  { number: "02", title: "Plan & Build", description: "We create detailed roadmaps, assets, and campaigns, ensuring every move is aligned with your growth journey." },
  { number: "03", title: "Launch & Amplify", description: "We execute with precision — launching, scaling, and optimizing across channels to maximize visibility and traction." },
  { number: "04", title: "Grow & Evolve", description: "We track, analyze, and adapt strategies in real-time, fueling continuous growth as your brand evolves in the web3 space." },
];

const team: TeamMember[] = [
  { 
    name: "Zamir", 
    role: "The Operational Ninja", 
    description: "Engineer, private equity guru, and master of keeping things running smoothly. Zamster’s got your back.",
    socials: { twitter: "https://x.com/HiddenBiderr", telegram: "https://t.me/zamster100" }
  },
  { 
    name: "Kolz", 
    role: "The Social Overlord", 
    description: "Co-founder, social media genius, and creative madman. Kolz turns connections into magic and runs on pure hustle.",
    socials: { twitter: "https://x.com/Kolzinweb3", telegram: "https://t.me/kolzofficial2" }
  },
  { 
    name: "Dave", 
    role: "The Beast Mode Executor", 
    description: "Fast, relentless, and built for KOL chaos. Dave’s the guy who doesn’t stop until the job is done—preferably yesterday."
  },
  { 
    name: "Marina", 
    role: "The Multitasking Machine", 
    description: "Need something done? Throw it at Marina. She’ll handle it with grace and probably finish it before you even blink."
  },
  { 
    name: "Lyuben", 
    role: "The Spreadsheet Sorcerer", 
    description: "Luben is basically Excel’s best friend. If it’s not detailed, it’s not done right—he’s all about KOL precision."
  },
  { 
    name: "Ainz", 
    role: "The Community Whisperer", 
    description: "Ainz keeps our community engaged and vibing. If you’ve got a question, he’s already got the answer and a meme to go with it."
  },
];

// --- Custom Cursor Component ---

const CustomCursor = () => {
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Spring physics for the trailing circle
  const springConfig = { damping: 20, stiffness: 300, mass: 0.5 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", moveCursor);
    return () => {
      window.removeEventListener("mousemove", moveCursor);
    };
  }, [mouseX, mouseY]);

  return (
    <>
      {/* Small Dot - Direct tracking */}
      <motion.div
        className="fixed top-0 left-0 w-3 h-3 bg-orange-500 rounded-full pointer-events-none z-[100] mix-blend-exclusion"
        style={{
          x: mouseX,
          y: mouseY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      />
      {/* Large Ring - Smooth Spring tracking */}
      <motion.div
        className="fixed top-0 left-0 w-10 h-10 border-[1.5px] border-white/50 rounded-full pointer-events-none z-[100] mix-blend-difference backdrop-blur-[1px]"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      />
    </>
  );
};

// --- Existing 3D Component ---

const AnimatedSphere = () => {
  const sphereRef = useRef<THREE.Mesh>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <Sphere 
      visible 
      args={[1, 100, 200]} 
      scale={isMobile ? 1.8 : 3.2} 
      position={isMobile ? [1.5, 0, -2] : [4.5, 0, -3]} 
      ref={sphereRef}
    >
      <MeshDistortMaterial
        color="#ff8800"
        attach="material"
        distort={0.4} 
        speed={1.5} 
        roughness={0.2}
        metalness={0.8}
      />
    </Sphere>
  );
};

// --- Rotating Text Component ---

const RotatingText = () => {
  const words = ["INCUBATE", "MARKET", "LAUNCH"];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-[1.1em] overflow-hidden flex items-start justify-start perspective-[1000px]">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ y: "100%", rotateX: -90, opacity: 0 }}
          animate={{ y: 0, rotateX: 0, opacity: 1 }}
          exit={{ y: "-100%", rotateX: 90, opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} // smooth easeOut
          className="block text-orange-500 font-display font-bold uppercase tracking-tighter origin-center"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

// --- UI Components ---

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      // Offset for fixed navbar (approx 80px)
      const navbarHeight = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
    setIsOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 backdrop-blur-md bg-black/50 border-b border-white/5">
      <div onClick={scrollToTop} className="text-2xl font-bold font-display tracking-tighter cursor-pointer">THRIV3</div>
      
      {/* Desktop Menu */}
      <div className="hidden md:flex gap-8 text-sm font-medium text-gray-400 uppercase tracking-widest">
        <a href="#services" onClick={(e) => scrollToSection(e, 'services')} className="hover:text-white transition-colors">Services</a>
        <a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="hover:text-white transition-colors">About</a>
        <a href="#process" onClick={(e) => scrollToSection(e, 'process')} className="hover:text-white transition-colors">Process</a>
        <a href="#team" onClick={(e) => scrollToSection(e, 'team')} className="hover:text-white transition-colors">Team</a>
      </div>

      <div className="md:hidden">
        <button onClick={() => setIsOpen(!isOpen)} className="text-white">
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-black border-b border-white/10 p-6 flex flex-col gap-4 md:hidden">
          <a href="#services" onClick={(e) => scrollToSection(e, 'services')} className="text-lg font-display uppercase">Services</a>
          <a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="text-lg font-display uppercase">About</a>
          <a href="#process" onClick={(e) => scrollToSection(e, 'process')} className="text-lg font-display uppercase">Process</a>
          <a href="#team" onClick={(e) => scrollToSection(e, 'team')} className="text-lg font-display uppercase">Team</a>
        </div>
      )}
    </nav>
  );
};

const Hero = () => {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);

  return (
    <section ref={targetRef} className="sticky top-0 h-screen w-full overflow-hidden bg-black z-0">
      <motion.div style={{ opacity, y, scale }} className="relative w-full h-full">
        {/* 3D Background */}
        <div className="absolute inset-0 z-0">
          <Canvas>
            <Suspense fallback={null}>
              {/* @ts-ignore */}
              <ambientLight intensity={0.8} />
              {/* @ts-ignore */}
              <directionalLight position={[10, 10, 5]} intensity={1.5} />
              {/* @ts-ignore */}
              <pointLight position={[-10, -10, -10]} intensity={1} color="#ff8800" />
              <AnimatedSphere />
              <OrbitControls 
                enableZoom={false} 
                enablePan={false} 
                enableRotate={false}
                autoRotate={false}
              />
            </Suspense>
          </Canvas>
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-12 pt-12 md:pt-20 pointer-events-none">
          <div className="flex flex-col justify-center h-full max-w-[90vw]">
            
            {/* Box 1: Large THRIV3 Logo */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mb-2 md:mb-6"
            >
              <h1 className="text-[5rem] sm:text-[8rem] md:text-[10rem] lg:text-[12rem] font-display font-bold uppercase leading-[0.85] tracking-tighter text-white">
                Thriv3<span className="text-orange-500">.</span>
              </h1>
            </motion.div>

            {/* Box 2: Rotating Orange Text */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
              className="text-[3rem] sm:text-[4rem] md:text-[6rem] lg:text-[7rem] leading-[0.9] font-display font-bold uppercase mb-8 md:mb-12"
            >
              <RotatingText />
            </motion.div>

            {/* Box 3: Description */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="border-l-2 border-white/20 pl-6 md:pl-8"
            >
              <p className="max-w-xl text-lg md:text-2xl text-gray-300 font-light leading-relaxed">
                Empowering web3 projects to launch, scale, and create lasting impact worldwide.
              </p>
            </motion.div>

          </div>
        </div>
        
        <div className="absolute bottom-10 left-6 md:left-12 flex gap-4 z-20">
          <Disc className="animate-spin-slow text-gray-600" size={24} />
          <span className="text-xs uppercase tracking-widest text-gray-500">Scroll to explore</span>
        </div>
      </motion.div>
    </section>
  );
};

const DesktopServiceItem: React.FC<{ 
  service: Service, 
  isActive: boolean, 
  onClick: () => void 
}> = ({ 
  service, 
  isActive, 
  onClick 
}) => {
  return (
    <motion.div
      layout
      onClick={onClick}
      initial={{ flex: 1 }}
      animate={{ flex: isActive ? 3 : 1 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="relative p-8 bg-black hover:bg-white/5 transition-colors cursor-pointer overflow-hidden min-h-[320px] flex flex-col justify-between group"
    >
      <div>
        <motion.h3 
          layout="position" 
          className={`text-2xl font-display font-bold uppercase mb-4 leading-none tracking-tight transition-colors ${isActive ? 'text-orange-500' : 'group-hover:text-white text-white'}`}
        >
          {service.title}
        </motion.h3>
        
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <p className="text-gray-400 text-sm leading-relaxed pt-2 pb-4">
                {service.description}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 flex justify-end">
         <motion.div 
            animate={{ rotate: isActive ? 45 : 0 }}
            transition={{ duration: 0.3 }}
            className={`transition-opacity ${isActive ? 'opacity-100 text-orange-500' : 'opacity-50 group-hover:opacity-100 text-white'}`}
         >
           <ArrowUpRight size={24} />
         </motion.div>
      </div>
    </motion.div>
  );
};

const MobileServiceItem: React.FC<{
  service: Service,
  isActive: boolean,
  onClick: () => void
}> = ({
  service,
  isActive,
  onClick
}) => {
   return (
    <motion.div
      layout
      onClick={onClick}
      className="bg-black p-8 cursor-pointer hover:bg-white/5 transition-colors flex flex-col justify-between min-h-[200px]"
    >
      <div>
        <h3 className={`text-2xl font-display font-bold uppercase mb-4 leading-none tracking-tight ${isActive ? 'text-orange-500' : 'text-white'}`}>
          {service.title}
        </h3>
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <p className="text-gray-400 text-sm leading-relaxed pt-2">
                {service.description}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="mt-4 flex justify-end">
         <motion.div 
            animate={{ rotate: isActive ? 45 : 0 }}
            className={isActive ? 'text-orange-500' : 'text-white'}
         >
           <ArrowUpRight size={20} />
         </motion.div>
      </div>
    </motion.div>
   )
}

const Services = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setActiveIndex(prev => prev === index ? null : index);
  }

  return (
    <section id="services" className="py-24 bg-black border-t border-white/10 relative z-10 shadow-[0_-50px_100px_-20px_rgba(0,0,0,0.8)]">
      <div className="container mx-auto px-6 md:px-12">
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-16">Services</h2>
        
        {/* Desktop Layout (lg+) */}
        <div className="hidden lg:flex flex-col gap-px bg-white/10 border border-white/10">
           {/* Row 1 */}
           <div className="flex gap-px bg-white/10">
              {services.slice(0, 4).map((s, i) => (
                 <DesktopServiceItem 
                    key={i} 
                    service={s} 
                    isActive={activeIndex === i} 
                    onClick={() => handleToggle(i)}
                 />
              ))}
           </div>
           {/* Row 2 */}
           <div className="flex gap-px bg-white/10">
              {services.slice(4, 8).map((s, i) => {
                 const index = i + 4;
                 return (
                    <DesktopServiceItem 
                        key={index} 
                        service={s} 
                        isActive={activeIndex === index} 
                        onClick={() => handleToggle(index)}
                    />
                 )
              })}
           </div>
        </div>

        {/* Tablet/Mobile Layout (< lg) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 border border-white/10 lg:hidden">
            {services.map((s, i) => (
                <MobileServiceItem
                    key={i}
                    service={s}
                    isActive={activeIndex === i}
                    onClick={() => handleToggle(i)}
                />
            ))}
        </div>
      </div>
    </section>
  );
};

const Counter = ({ value, prefix = "", suffix = "" }: { value: number, prefix?: string, suffix?: string }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px -10% 0px" });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    if (inView) {
      animate(count, value, { duration: 2.5, ease: "circOut" });
    }
  }, [inView, value, count]);

  return (
    <span ref={ref} className="flex items-baseline justify-center md:justify-start">
      {prefix}
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
};

const Word: React.FC<{ children: React.ReactNode, range: number[], progress: any }> = ({ children, range, progress }) => {
  const [start, end] = range;
  const step = end - start;
  // Opacity: Gray (0.3) -> White (1). Starts changing at 'start'.
  const opacity = useTransform(progress, [start, end], [0.3, 1]);
  // Blur: Sharp (0) -> Blurry (10) -> Sharp (0).
  // Pre-blur ramps up before 'start' to prepare for the transition, then clears up as it turns white.
  // This satisfies "unrevealed is sharp gray", "revealed is sharp white", "transition is blurred".
  const blur = useTransform(progress, [start - step, start, end], [0, 10, 0]);

  return (
    <span className="inline-block mr-[0.25em] relative">
      <motion.span style={{ opacity, filter: useTransform(blur, (v) => `blur(${v}px)`) }} className="inline-block">
        {children}
      </motion.span>
    </span>
  );
};

const ScrollRevealText = ({ content, className }: { content: string, className?: string }) => {
  const element = useRef(null);
  const { scrollYProgress } = useScroll({
    target: element,
    offset: ["start 0.9", "start 0.25"]
  });

  const words = content.split(" ");

  return (
    <p ref={element} className={className}>
      {words.map((word, i) => {
        const start = i / words.length;
        const end = start + (1 / words.length);
        return (
          <Word key={i} range={[start, end]} progress={scrollYProgress}>
            {word}
          </Word>
        );
      })}
    </p>
  );
};

const Stats = () => {
  return (
    <section className="py-20 border-y border-white/10 bg-neutral-900/30">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col gap-2">
              <span className="text-5xl md:text-7xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-600">
                <Counter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
              </span>
              <span className="text-sm uppercase tracking-widest text-gray-500">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const LetterReveal = ({ 
  text, 
  className, 
  startDelay = 0, 
  speed = 0.015, 
  trigger = true 
}: { 
  text: string, 
  className?: string, 
  startDelay?: number, 
  speed?: number, 
  trigger?: boolean 
}) => {
  return (
    <span className={className}>
      {text.split("").map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0 }}
          animate={trigger ? { opacity: 1 } : { opacity: 0 }}
          transition={{
            duration: 0.05,
            delay: startDelay + (index * speed),
            ease: "easeOut"
          }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
};

const About = () => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-10% 0px -10% 0px" });

  const p1 = "Founded by innovators with expertise in advertising, social campaigns, management, and capital markets, ";
  const p2 = "THRIV3";
  const p3 = " combines creative vision with strategic execution to launch and scale web3 projects.";

  const speed = 0.015;

  return (
    <section id="about" className="py-24 bg-black">
      <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">About</h2>
          <h3 className="text-4xl font-display uppercase leading-none">We Started<br />Back in 2017</h3>
        </div>
        <div className="lg:col-span-8" ref={containerRef}>
          <p className="text-xl md:text-2xl text-gray-400 font-light leading-relaxed">
            <LetterReveal text={p1} speed={speed} trigger={isInView} />
            <LetterReveal text={p2} speed={speed} startDelay={p1.length * speed} trigger={isInView} className="text-white font-normal" />
            <LetterReveal text={p3} speed={speed} startDelay={(p1.length + p2.length) * speed} trigger={isInView} />
          </p>
        </div>
      </div>
    </section>
  );
};

const Process = () => {
  return (
    <section id="process" className="py-24 border-t border-white/10">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">How We Work</h2>
          <span className="text-xs text-gray-600 uppercase mt-2 md:mt-0">( The Framework )</span>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {processSteps.map((step, index) => (
            <div key={index} className="group border-t border-white/10 pt-8 pb-8 transition-all hover:bg-white/5 px-4 md:px-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                <div className="md:col-span-2">
                  <span className="text-4xl font-display text-gray-700 font-bold group-hover:text-white transition-colors">
                    {step.number}
                  </span>
                </div>
                <div className="md:col-span-4">
                  <h3 className="text-2xl font-display uppercase group-hover:text-orange-500 transition-colors">
                    {step.title.includes('&') ? (
                      <>
                        {step.title.split('&')[0]} &<br />
                        {step.title.split('&')[1]}
                      </>
                    ) : step.title}
                  </h3>
                </div>
                <div className="md:col-span-6">
                  <p className="text-gray-400 group-hover:text-gray-200 transition-colors max-w-lg">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Mission = () => {
  return (
    <section className="py-32 bg-black text-white text-center relative overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <h2 className="text-sm font-bold uppercase tracking-widest mb-8 text-gray-500">Our Mission at THRIV3</h2>
        <div className="mb-12">
          <span className="font-display text-lg border border-white/20 rounded-full px-6 py-2">
            ( go beyond the conventional )
          </span>
        </div>
        
        <ScrollRevealText 
          content="We believe every web3 project has a powerful vision, and our mission is to bring it to life — helping you stand out, scale faster, and leave a lasting impact in an evolving digital world."
          className="text-2xl md:text-4xl lg:text-5xl font-display font-medium leading-tight max-w-5xl mx-auto mb-12"
        />

        <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
          We aim to be more than a branding agency; we are builders of strategy, creators of impact, and drivers of your project's evolution toward recognition and success.
        </p>
      </div>
    </section>
  );
};

// --- Team Component ---

const DesktopTeamItem: React.FC<{
  member: TeamMember;
  isActive: boolean;
  onClick: () => void;
}> = ({
  member,
  isActive,
  onClick
}) => {
  return (
    <motion.div
      layout
      onClick={onClick}
      initial={{ flex: 1 }}
      animate={{ flex: isActive ? 3 : 1 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="relative p-8 bg-black hover:bg-neutral-900 transition-colors cursor-pointer overflow-hidden min-h-[240px] flex flex-col justify-between group border-l border-white/10 first:border-l-0"
    >
      <motion.div layout="position" className="relative z-10">
         <motion.div layout>
           <h3 className={`text-3xl md:text-4xl font-display font-bold uppercase mb-2 transition-colors ${isActive ? 'text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500' : 'text-white'}`}>
             {member.name}
           </h3>
           <p className="text-orange-500 text-xs font-bold uppercase tracking-[0.2em] mb-4">
             {member.role}
           </p>
         </motion.div>

        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                {member.description}
              </p>
              
              {member.socials && (
                <div className="flex gap-4 pt-4 border-t border-white/10">
                  {member.socials.twitter && (
                    <a href={member.socials.twitter} target="_blank" rel="noopener noreferrer" className="p-3 border border-white/10 rounded-full hover:bg-white hover:text-black transition-all">
                      <Twitter size={18} />
                    </a>
                  )}
                  {member.socials.telegram && (
                    <a href={member.socials.telegram} target="_blank" rel="noopener noreferrer" className="p-3 border border-white/10 rounded-full hover:bg-[#229ED9] hover:text-white hover:border-[#229ED9] transition-all">
                      <Send size={18} />
                    </a>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="mt-4 flex justify-end relative z-10">
         <motion.div 
            animate={{ rotate: isActive ? 45 : 0 }}
            transition={{ duration: 0.3 }}
            className={`transition-opacity ${isActive ? 'opacity-100 text-orange-500' : 'opacity-50 group-hover:opacity-100 text-white'}`}
         >
           <ArrowUpRight size={24} />
         </motion.div>
      </div>

       {/* Decorative BG for Active State */}
      <AnimatePresence>
        {isActive && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-neutral-900/50 pointer-events-none z-0"
            />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const MobileTeamItem: React.FC<{
  member: TeamMember;
  isActive: boolean;
  onClick: () => void;
}> = ({
  member,
  isActive,
  onClick
}) => {
   return (
    <motion.div
      layout
      onClick={onClick}
      className="bg-black p-8 cursor-pointer hover:bg-neutral-900 transition-colors flex flex-col justify-between border-b border-white/10 last:border-b-0"
    >
      <div>
        <h3 className={`text-3xl font-display font-bold uppercase mb-2 ${isActive ? 'text-white' : 'text-white'}`}>
          {member.name}
        </h3>
        <p className="text-orange-500 text-xs font-bold uppercase tracking-[0.2em] mb-4">
             {member.role}
        </p>
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <p className="text-gray-400 text-sm leading-relaxed pt-2 pb-6">
                {member.description}
              </p>
               {member.socials && (
                 <div className="flex gap-4 pt-4 border-t border-white/10">
                  {member.socials.twitter && (
                    <a href={member.socials.twitter} target="_blank" rel="noopener noreferrer" className="p-2 border border-white/10 rounded-full hover:bg-white hover:text-black transition-all">
                       <Twitter size={16} />
                    </a>
                  )}
                  {member.socials.telegram && (
                    <a href={member.socials.telegram} target="_blank" rel="noopener noreferrer" className="p-2 border border-white/10 rounded-full hover:bg-[#229ED9] hover:text-white hover:border-[#229ED9] transition-all">
                       <Send size={16} />
                    </a>
                  )}
                </div>
               )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="mt-4 flex justify-end">
         <motion.div 
            animate={{ rotate: isActive ? 45 : 0 }}
            className={isActive ? 'text-orange-500' : 'text-white'}
         >
           <ArrowUpRight size={20} />
         </motion.div>
      </div>
    </motion.div>
   )
}

const Team = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setActiveIndex(prev => prev === index ? null : index);
  }

  return (
    <section id="team" className="py-32 bg-black border-t border-white/10 overflow-hidden">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-24">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">The Team</h2>
            <h3 className="text-5xl md:text-7xl font-display font-bold uppercase text-white">
              Behind<br /><span className="text-gray-600">The Vision</span>
            </h3>
          </div>
          <p className="text-gray-400 max-w-sm mt-6 md:mt-0 text-right hidden md:block">
            A collective of innovators, strategists, and creators building the future of Web3.
          </p>
        </div>
        
        {/* Desktop View (Expandable Flex Rows) */}
        <div className="hidden lg:flex flex-col gap-px bg-white/10 border border-white/10">
           {/* Row 1 */}
           <div className="flex gap-px bg-white/10">
             {team.slice(0, 3).map((member, i) => (
                <DesktopTeamItem 
                    key={i} 
                    member={member} 
                    isActive={activeIndex === i} 
                    onClick={() => handleToggle(i)} 
                />
             ))}
           </div>
           {/* Row 2 */}
           <div className="flex gap-px bg-white/10">
             {team.slice(3, 6).map((member, i) => {
                const index = i + 3;
                return (
                    <DesktopTeamItem 
                        key={index} 
                        member={member} 
                        isActive={activeIndex === index} 
                        onClick={() => handleToggle(index)} 
                    />
                )
             })}
           </div>
        </div>

        {/* Mobile View (Stack/Accordion) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-px bg-white/10 border border-white/10">
          {team.map((member, i) => (
             <MobileTeamItem 
                key={i} 
                member={member} 
                isActive={activeIndex === i} 
                onClick={() => handleToggle(i)} 
            />
          ))}
        </div>

      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="py-12 bg-black border-t border-white/10 text-center md:text-left">
      <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-display font-bold">THRIV3.</h2>
          <p className="text-xs text-gray-600 uppercase tracking-widest">© 2024 Thriv3 Agency</p>
        </div>
        
        <div className="flex gap-6">
          <a href="https://t.me/zamster100" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors">
            <Send size={24} />
          </a>
        </div>
      </div>
    </footer>
  );
};

function App() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-orange-500 selection:text-white cursor-none">
      <CustomCursor />
      <Navbar />
      <main>
        <Hero />
        {/* Wrap content after Hero in a relative z-10 container to slide over the sticky Hero */}
        <div className="relative z-10 bg-black">
          <Services />
          <Stats />
          <About />
          <Process />
          <Mission />
          <Team />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;