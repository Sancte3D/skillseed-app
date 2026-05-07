import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import Fuse from "fuse.js";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Animated, AppState, FlatList, Modal, Platform, ScrollView, StatusBar, StyleSheet, StyleProp, Switch, Text, TextInput, TouchableOpacity, View, ViewStyle, useColorScheme, useWindowDimensions } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import CategoryIcon from './src/components/CategoryIcon';
import EnhancedProgressBar from './src/components/EnhancedProgressBar';
import OnboardingCarousel from './src/components/OnboardingCarousel';
import SplashScreen from './src/components/SplashScreen';
import quiz_blender from './src/data/quiz/blender.json';
import quiz_english_b2 from './src/data/quiz/english_b2.json';
import quiz_figma from './src/data/quiz/figma.json';
import quiz_german_expert from './src/data/quiz/lang_german_expert.json';
import quiz_german_intermediate from './src/data/quiz/lang_german_intermediate.json';
import quiz_italian_expert from './src/data/quiz/lang_italian_expert.json';
import quiz_italian_intermediate from './src/data/quiz/lang_italian_intermediate.json';
import quiz_python from './src/data/quiz/python.json';
import quiz_solidworks from './src/data/quiz/solidworks.json';
import taxonomyData from "./src/data/skillseed_taxonomy_placeholder.json";
import { Session, SkillMaster } from "./src/models";
import { estimator } from "./src/services/estimator";
import { getFeedbackForSkill } from "./src/services/feedback";
import { appState, exportBundle, importBundle, store, uid } from "./src/services/storage";
import { colors, spacing } from "./src/theme";
import { uiDebug } from "./src/utils/debugUI";

type QuizItemOption = { k: string; text: string; correct?: boolean };
type QuizItem = { id: string; stem: string; type: string; options: QuizItemOption[] };
type QuizData = { skill_id: string; items: QuizItem[]; pass_mark?: number };

// Build quizMap as soon as imports are done, outside and above everything using it
const quizMap: Record<string, QuizData> = {
  'coding_python': quiz_python,
  '3d_blender': quiz_blender,
  'english_b2': quiz_english_b2,
  'lang_english_b2': quiz_english_b2,
  'design_figma': quiz_figma,
  'cad_solidworks': quiz_solidworks,
  'lang_german_intermediate': quiz_german_intermediate,
  'lang_german_expert': quiz_german_expert,
  'lang_italian_intermediate': quiz_italian_intermediate,
  'lang_italian_expert': quiz_italian_expert
};

// --- Quiz loader utility ---
function getQuizForSkillId(skillId: string): QuizData | null {
  return quizMap[skillId] ?? null;
}

type Route =
  | { name: "Explore" }
  | { name: "GlobalDashboard" }
  | { name: "SkillDashboard", skillId: string }
  | { name: "Timer", skillId: string }
  | { name: "SkillDetail", skill: SkillMaster }
  | { name: "Assessment", skill: SkillMaster }
  | { name: "Result", userSkillId: string }
  | { name: "Quiz", skillId: string }
  | { name: "Profile" }
  | { name: "Onboarding" }
  | { name: "GlobalAssessment" }
  | { name: "Search" };

type SessionFlowState =
  | 'idle'
  | 'ready'
  | 'in_progress'
  | 'step_completed'
  | 'session_completed'
  | 'next_recommended';

const Header = ({ title, onBack }: { title: string; onBack?: () => void }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const backgroundColor = isDark ? '#111827' : '#FFFFFF';
  const textColor = isDark ? '#F9FAFB' : colors.text;
  const backColor = isDark ? '#93C5FD' : colors.link;
  const borderColor = isDark ? '#374151' : colors.border;

  return (
  <View style={{
    paddingHorizontal: spacing.m,
    paddingTop: spacing.m,
    paddingBottom: spacing.m,
    backgroundColor,
    borderBottomWidth: 0.5,
    borderColor,
  }}>
    <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={backgroundColor} />
    {/* Pinned brand */}
    <View style={{ marginBottom: 6 }}>
      <Text style={{ fontSize: 20, fontWeight: '800', color: textColor, letterSpacing: -0.5 }}>SkillSeed</Text>
    </View>
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
      <TouchableOpacity onPress={onBack} disabled={!onBack} style={{ opacity: onBack ? 1 : 0, minWidth: 60 }}>
        <Text style={{ color: backColor, fontSize: 17, fontWeight: '400' }}>{onBack ? '← Back' : ''}</Text>
      </TouchableOpacity>
      <Text style={{ fontSize: 17, fontWeight: "600", color: textColor, letterSpacing: -0.4 }}>{title}</Text>
      <View style={{ width: 60 }} />
    </View>
  </View>
  );
};

const Button = ({
  title,
  onPress,
  disabled = false,
  loading = false,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) => {
  const scale = React.useRef(new Animated.Value(1)).current;
  const onPressIn = () => {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, friction: 6, tension: 120 }).start();
  };
  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6, tension: 120 }).start();
  };
  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.selectionAsync();
    onPress();
  };
  return (
    <Animated.View style={{ transform: [{ scale }], opacity: disabled ? 0.5 : 1 }}>
      <TouchableOpacity
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={handlePress}
        disabled={disabled || loading}
        style={{ backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 16, alignItems: "center" }}
      >
        <Text style={{ color: colors.text, fontWeight: "600" }}>{loading ? "Loading..." : title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const Card = ({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) => {
  const isDark = useColorScheme() === 'dark';
  return (
    <View
      style={[
        {
          backgroundColor: isDark ? '#1F2937' : "#FFFFFF",
          borderRadius: 14,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: isDark ? '#374151' : "#EEE",
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

// Helper for historic chip
function HistoricBadge() {
  return (
    <View style={{backgroundColor:'#FFF3CC',borderRadius:8,paddingHorizontal:8,paddingVertical:2,marginLeft:8,alignSelf:'center'}}>
      <Text style={{color:'#8A6A00',fontSize:11,fontWeight:'700'}}>HISTORIC</Text>
    </View>
  )
}

export default function App() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const isDarkMode = useColorScheme() === 'dark';
  const modalWidth = Math.min(screenWidth - 24, 360);
  const [route, setRoute] = useState<Route>({ name: "Explore" });
  const [booted, setBooted] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  
  // TEST MODE: Während des Testens immer Onboarding zeigen
  const FORCE_ONBOARDING = false; // Production default: onboarding once
  
  // Safe route update for useEffect - prevents render-time updates
  const pendingRouteRef = React.useRef<Route | null>(null);
  
  // Centralized navigation function with logging and validation
  const navigate = React.useCallback((newRoute: Route) => {
    const currentRouteStr = JSON.stringify(route);
    const newRouteStr = JSON.stringify(newRoute);
    console.log('[Navigation] ===== NAVIGATION EVENT =====');
    console.log('[Navigation] From:', currentRouteStr);
    console.log('[Navigation] To:', newRouteStr);
    console.log('[Navigation] Route changed:', currentRouteStr !== newRouteStr);
    
    // Direct state update - React handles batching
    setRoute(newRoute);
    
    // Log after a small delay to see if state actually changed
    setTimeout(() => {
      console.log('[Navigation] ✓ Navigation state updated');
    }, 10);
  }, [route]);
  
  // Handle invalid Timer route - move to useEffect to prevent render-time state update
  React.useEffect(() => {
    if (route.name === "Timer" && !route.skillId) {
      console.log('[Navigation] Timer route missing skillId, redirecting to Explore');
      pendingRouteRef.current = { name: 'Explore' };
      // Trigger update with state change
      setRoute(prev => {
        if (prev.name === 'Explore') return { name: 'Search' };
        return { name: 'Explore' };
      });
    }
  }, [route]);
  
  React.useEffect(() => {
    if (pendingRouteRef.current) {
      const targetRoute = pendingRouteRef.current;
      pendingRouteRef.current = null;
      console.log('[Navigation] Applying pending route:', targetRoute.name);
      setRoute(targetRoute);
    }
  }, [route]);
  // Track skill_id usage to handle duplicates
  const skillIdMap = new Map<string, number>();
  const skills: SkillMaster[] = (taxonomyData.items || []).map((it: any, idx: number) => {
    // Generate unique skill_id including subcategory to avoid duplicates
    const catNorm = (it.category || 'Other').toLowerCase().replace(/\s+/g,"_");
    const subNorm = (it.subcategory || '').toLowerCase().replace(/[^a-z0-9]+/g,"_");
    const skillNorm = (it.skill || 'skill').toLowerCase().replace(/[^a-z0-9]+/g,"_");
    let skill_id = subNorm ? `${catNorm}_${subNorm}_${skillNorm}` : `${catNorm}_${skillNorm}`;
    
    // Handle duplicates by appending index
    if (skillIdMap.has(skill_id)) {
      const count = (skillIdMap.get(skill_id) || 0) + 1;
      skillIdMap.set(skill_id, count);
      skill_id = `${skill_id}_${count}`;
    } else {
      skillIdMap.set(skill_id, 0);
    }
    
    return {
      skill_id,
      category: it.category,
      subcategory: it.subcategory,
      name: it.skill,
      tags: it.tags || [],
      k: it.k,
      expDomainKey: it.expDomainKey,
      C_preset: it.C_preset,
      F_preset: it.F_preset,
      C_range: it.C_range,
      status: it.status,
      type: it.type || "hard", // Default to "hard" for backward compatibility
      benchmarkType: it.benchmarkType || "quantitative" // Default to "quantitative"
    };
  });

  // --- ALL STATE HOOKS AT TOP LEVEL ---
  const [q, setQ] = useState("");
  const fuse = useMemo(() => new Fuse(skills, { keys: ["name", "category", "subcategory", "tags"], threshold: 0.3 }), [skills]);
  const results = q ? fuse.search(q).map(r => r.item) : skills.slice(0, 40);
  
  // Featured skills - randomized and diverse across categories (always computed at top level)
  const featuredSkills = useMemo(() => {
    // Randomize featured skills - get diverse mix across categories
    const shuffled = [...skills].sort(() => Math.random() - 0.5);
    // Ensure we get different categories, not all from one
    const byCategory: Record<string, SkillMaster[]> = {};
    shuffled.forEach(s => {
      const cat = s.category || 'Other';
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(s);
    });
    const featured: SkillMaster[] = [];
    const cats = Object.keys(byCategory);
    let catIndex = 0;
    while (featured.length < 10 && cats.length > 0) {
      const cat = cats[catIndex % cats.length];
      if (byCategory[cat].length > 0) {
        featured.push(byCategory[cat].shift()!);
        if (byCategory[cat].length === 0) cats.splice(catIndex % cats.length, 1);
      }
      catIndex++;
    }
    return featured.slice(0, 10);
  }, [skills]);

  // --- Expand App-level state for category drilldown (null = default all/overview) ---
  const [selectedCategory, setSelectedCategory] = useState<string|null>(null);

  // --- Build skill grouping for display ---
  const categoryConfig = [
    { key: 'Coding', color: colors.primary },
    { key: 'CAD/3D', color: colors.accent },
    { key: 'AI/Data', color: '#A259FF' },
    { key: 'Design', color: '#32D29F' },
    { key: 'Language', color: '#FF7C51' },
    // add more as desired
  ];
  const categoryMap: Record<string, SkillMaster[]> = {};
  skills.forEach(skill => {
    const cat = skill.category || 'Other';
    if (!categoryMap[cat]) categoryMap[cat] = [];
    categoryMap[cat].push(skill);
  });

  // Harmonized palette: alphabetical gradient ramp (numeric-first, then A-Z)
  function hslToHex(h:number,s:number,l:number){
    s/=100; l/=100;
    const k = (n:number)=> (n + h/30) % 12;
    const a = s * Math.min(l,1-l);
    const f = (n:number)=> l - a*Math.max(-1, Math.min(k(n)-3, Math.min(9-k(n),1)));
    const toHex = (x:number)=> Math.round(x*255).toString(16).padStart(2,'0');
    return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
  }
  const getSortedCategories = (cats: string[]) => {
    const isNum = (c:string)=> /^[0-9]/.test(c || '');
    return [...cats].sort((a,b)=>{
      const an = isNum(a), bn = isNum(b);
      if (an !== bn) return an ? -1 : 1;
      return (a||'').localeCompare(b||'');
    });
  };
  const allCategoriesUnsorted = Array.from(new Set(skills.map(s => s.category))).filter(Boolean) as string[];
  const allCategories = getSortedCategories(allCategoriesUnsorted);
  
  // Group skills by type for better organization
  const skillsByType = {
    hard: skills.filter(s => !s.type || s.type === 'hard'),
    soft: skills.filter(s => s.type === 'soft'),
    fundamental: skills.filter(s => s.type === 'fundamental')
  };
  
  // Group categories by type
  const categoriesByType: { hard: string[], soft: string[], fundamental: string[] } = {
    hard: Array.from(new Set(skillsByType.hard.map(s => s.category).filter(Boolean))),
    soft: Array.from(new Set(skillsByType.soft.map(s => s.category).filter(Boolean))),
    fundamental: Array.from(new Set(skillsByType.fundamental.map(s => s.category).filter(Boolean)))
  };
  // Category color palette system - one color per MAIN category (Hard/Soft/Fundamentals)
  // Sub-categories get variations within the same color family
  const categoryColorMap: Record<string,string> = (()=>{
    const map: Record<string,string> = {};
    
    // Main category colors - harmonious cool palette (NO PURPLE!)
    const mainCategoryHues = {
      hard: 135,         // Primary pistachio green
      soft: 110,         // Softer green
      fundamental: 85    // Muted olive green
    };
    
    const sat = 85; // Saturated
    
    // Determine which main category each sub-category belongs to
    const categoryTypeMap: Record<string, 'hard'|'soft'|'fundamental'> = {};
    skills.forEach(skill => {
      const cat = skill.category || 'Other';
      if (!categoryTypeMap[cat]) {
        categoryTypeMap[cat] = skill.type || 'hard';
      }
    });
    
    // Group sub-categories by main category
    const hardCategories = allCategories.filter(c => categoryTypeMap[c] === 'hard');
    const softCategories = allCategories.filter(c => categoryTypeMap[c] === 'soft');
    const fundamentalCategories = allCategories.filter(c => categoryTypeMap[c] === 'fundamental');
    
    // Assign colors: same hue family per main category, vary lightness for distinction
    [hardCategories, softCategories, fundamentalCategories].forEach((cats, mainIdx) => {
      if (cats.length === 0) return;
      const mainType = mainIdx === 0 ? 'hard' : mainIdx === 1 ? 'soft' : 'fundamental';
      const hue = mainCategoryHues[mainType];
      const lightMin = mainType === 'fundamental' ? 50 : mainType === 'soft' ? 46 : 44;
      const lightMax = mainType === 'fundamental' ? 62 : mainType === 'soft' ? 58 : 56;
      
      cats.forEach((cat, i) => {
        const n = cats.length;
        const t = n === 1 ? 0.5 : i / Math.max(1, n - 1);
        const light = Math.round(lightMin + (lightMax - lightMin) * t);
        map[cat] = hslToHex(hue, sat, light);
      });
    });
    
    return map;
  })();
  
  const getCategoryColor = (catRaw: string, skillType?: 'hard'|'soft'|'fundamental') => {
    if (!catRaw) return colors.primary;
    
    // If skill type is provided, calculate color based on type (not from map)
    if (skillType) {
      const mainCategoryHues = {
        hard: 135,
        soft: 110,
        fundamental: 85
      };
      const sat = 85;
      const lightBase = skillType === 'fundamental' ? 55 : skillType === 'soft' ? 50 : 48;
      
      // Use category index for slight variation
      const catIndex = allCategories.indexOf(catRaw);
      const light = lightBase + (catIndex % 5);
      
      return hslToHex(mainCategoryHues[skillType], sat, Math.min(65, light));
    }
    
    // Fallback: use categoryColorMap
    return categoryColorMap[catRaw] || colors.primary;
  };

  // evt weiterhin für Text-Bereiche verwenden; für UI-Komponenten CategoryIcon nutzen

  // Animated category tile (scale-on-press; simulates gradient feel via shadow depth)
  const AnimatedCategoryTile = ({ color, children }:{ color:string; children: React.ReactNode }) => {
    const scale = React.useRef(new Animated.Value(1)).current;
    const onPressIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, friction: 6, tension: 120 }).start();
    const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6, tension: 120 }).start();
    return (
      <Animated.View
        onTouchStart={onPressIn}
        onTouchEnd={onPressOut}
        style={{
          transform: [{ scale }],
          backgroundColor: color,
          borderRadius: 18,
          padding: 18,
          width: '100%',
          height: 96,
          justifyContent:'space-between',
          shadowColor: color,
          shadowOpacity: 0.25,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 4,
        }}>
        {children}
      </Animated.View>
    );
  };

  // --- Assessment Screen State ---
  const [assessmentState, setAssessmentState] = useState<{ initial: boolean; a: any; skill: SkillMaster | null; questionIndex: number }>({ initial: true, a: null, skill: null, questionIndex: 0 });
  // --- Timer Screen State ---
  const [timerState, setTimerState] = useState<{ running: boolean; paused: boolean; start: number | null; accumSec: number; lastActivity: number | null; skillId: string | null }>({ running: false, paused: false, start: null, accumSec: 0, lastActivity: null, skillId: null });
  // --- Quiz Screen State ---
  const [quizState, setQuizState] = useState<{
    skillId: string;
    quiz: QuizData | null;
    answers: Record<string, string>;
    current: number;
    finished: boolean;
  }>({ skillId: '', quiz: null, answers: {}, current: 0, finished: false });
  const [afkModal, setAfkModal] = useState<{ visible: boolean; timeout: number | null }>({ visible: false, timeout: null });
  const afkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastUserActivityRef = useRef(Date.now());
  const [activeTab, setActiveTab] = useState<'Home'|'Dashboard'|'Profile'>('Home');

  const TabBar = () => {
    // Hide TabBar when timer is running
    if (timerState.running) return null;
    
    // Monitor TabBar rendering
    if (__DEV__) {
      uiDebug.monitorRender('TabBar', { running: timerState.running });
    }
    
    // Use fixed height for consistency across all screens
    // iOS devices with home indicator need ~34pt bottom padding, older devices ~8pt
    // We use a fixed height that works on all devices for consistency
    const fixedBottomPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? 8 : 8);
    const contentHeight = 60; // Fixed content height: paddingTop (8) + icon (24) + spacing (4) + text (~11) + margin
    const totalHeight = contentHeight + fixedBottomPadding;
    
    return (
    <>
      <View style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        height: totalHeight,
        overflow: 'hidden',
        zIndex: 2,
      }}>
        <BlurView
          intensity={90}
          tint={isDarkMode ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />
        {/* Subtle border at top - Apple Tab Bar style */}
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 0.5,
          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.08)',
        }} />
        <View style={{ 
          paddingTop: 8, 
          paddingBottom: fixedBottomPadding,
          flexDirection: 'row', 
          justifyContent: 'space-evenly', 
          alignItems: 'center', 
          paddingHorizontal: 16,
          height: contentHeight, // Fixed content height for consistency
        }}>
          <TouchableOpacity
            onPress={() => {
              console.log('[TabBar] ===== HOME BUTTON PRESSED =====');
              setActiveTab('Home');
              setSelectedCategory(null);
              setQ('');
              navigate({ name: 'Explore' });
            }}
            style={{ flex:1, alignItems:'center', paddingVertical:8, minWidth: 80 }}
          >
            <MaterialIcons name="home" size={24} color={activeTab==='Home'?colors.primary:colors.muted} style={{ marginBottom: 4 }} />
            <Text style={{ fontSize: 11, fontWeight: activeTab==='Home'?'600':'400', color: activeTab==='Home'?colors.primary:colors.muted }}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              console.log('[TabBar] ===== DASHBOARD BUTTON PRESSED =====');
              setActiveTab('Dashboard');
              navigate({ name: 'GlobalDashboard' });
            }}
            style={{ flex:1, alignItems:'center', paddingVertical:8, minWidth: 80 }}
          >
            <MaterialIcons name="dashboard" size={24} color={activeTab==='Dashboard'?colors.primary:colors.muted} style={{ marginBottom: 4 }} />
            <Text style={{ fontSize: 11, fontWeight: activeTab==='Dashboard'?'600':'400', color: activeTab==='Dashboard'?colors.primary:colors.muted }}>Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              console.log('[TabBar] ===== PROFILE BUTTON PRESSED =====');
              setActiveTab('Profile');
              navigate({ name: 'Profile' });
            }}
            style={{ flex:1, alignItems:'center', paddingVertical:8, minWidth: 80 }}
          >
            <MaterialIcons name="person" size={24} color={activeTab==='Profile'?colors.primary:colors.muted} style={{ marginBottom: 4 }} />
            <Text style={{ fontSize: 11, fontWeight: activeTab==='Profile'?'600':'400', color: activeTab==='Profile'?colors.primary:colors.muted }}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
    );
  };

  // Boot: load persisted state and decide start route
  useEffect(() => {
    (async () => {
      await appState.init?.();
      // TEST MODE: Immer Onboarding zeigen, auch wenn schon onboarded
      if (FORCE_ONBOARDING || !appState.isOnboarded()) {
        setShowSplash(true);
        setRoute({ name: 'Onboarding' });
      } else {
        setRoute({ name: 'Explore' });
      }
      // Load persisted timer state
      const t = (appState as any).getTimer ? (appState as any).getTimer() : null;
      if (t) {
        setTimerState({
          running: !!t.running,
          paused: !!t.paused,
          start: t.start ?? null,
          accumSec: t.accumSec ?? 0,
          lastActivity: Date.now(),
          skillId: t.skillId ?? null,
        });
      }
      setBooted(true);
    })();
  }, []);

  // --- Onboarding carousel state ---
  const [onbIndex, setOnbIndex] = useState(0);
  const [username, setUsername] = useState(appState.getUsername() || '');
  const onboardingSlides = [
    { 
      title: "Track Your Learning Journey", 
      body: "Estimate hours to Independent Level with a simple timer.",
    },
    { 
      title: "See Your Progress", 
      body: "Watch your skills grow day by day with visual feedback.",
    },
    { 
      title: "Local-First & Private", 
      body: "Your data stays on your device. Export anytime. No cloud by default.",
    },
    { 
      title: "Your Name", 
      body: "Choose a username so we can greet you and personalize your dashboard.",
    },
  ];

  // --- Global assessment carousel state ---
  const [gaIndex, setGaIndex] = useState(0);
  const [ga, setGa] = useState({ q1:3, q2:3, q3:3, q4:3, q5:3, q6:3 });
  const setGAVal = (k: keyof typeof ga, v:number) => setGa(prev => ({ ...prev, [k]: v }));

  // Ensure quiz completion side-effects happen at top-level (not conditionally)
  useEffect(() => {
    if (route.name !== 'Quiz') return;
    const { quiz, finished, answers } = quizState;
    if (!quiz || !finished) return;
    const numItems = quiz.items.length;
    let correct = 0;
    for (const q of quiz.items) {
      const ans = answers[q.id];
      if (!ans) continue;
      if (q.type === 'mcq_single' || q.type === 'true_false') {
        correct += q.options.find((o:any) => o.k === ans && o.correct) ? 1 : 0;
      }
    }
    const percent = correct / (numItems || 1);
    const passMark = quiz.pass_mark || 0.7;
    if (percent >= passMark) {
      const us = store.getUserSkillBySkillId(quiz.skill_id);
      if (us && !us.f_level_passed) us.f_level_passed = true;
    }
  }, [route.name, quizState.finished]);
  const [manualSession, setManualSession] = useState<{ open: boolean; duration: string; notes?: string; historic: boolean }>({ open: false, duration: '', notes: '', historic: false });
  const [editSession, setEditSession] = useState<{ open: boolean; sessionId?: string; duration: string; notes?: string; historic: boolean }>({ open: false, sessionId: undefined, duration: '', notes: '', historic: false });
  const [skipLevelModal, setSkipLevelModal] = useState<{ open: boolean; skill: SkillMaster | null; selectedLevel?: 'intermediate' | 'expert' | null }>({ open: false, skill: null, selectedLevel: null });
  const [skipLevelQuiz, setSkipLevelQuiz] = useState<{ questions: any[]; current: number; answers: Record<number, string>; finished: boolean }>({ questions: [], current: 0, answers: {}, finished: false });
  const [isTimerActionBusy, setIsTimerActionBusy] = useState(false);
  const [isManualSessionSaving, setIsManualSessionSaving] = useState(false);
  const [isEditSessionSaving, setIsEditSessionSaving] = useState(false);
  const timerActionRef = useRef(false);
  const [sessionFlowState, setSessionFlowState] = useState<SessionFlowState>('idle');
  const flowLabel: Record<SessionFlowState, string> = {
    idle: 'Idle',
    ready: 'Ready',
    in_progress: 'In Progress',
    step_completed: 'Step Completed',
    session_completed: 'Session Completed',
    next_recommended: 'Next Recommended',
  };
  const flowNextHint: Record<SessionFlowState, string> = {
    idle: 'Pick a skill to begin.',
    ready: 'Start a focused session.',
    in_progress: 'Complete the current practice block.',
    step_completed: 'Nice step. Keep momentum with the next action.',
    session_completed: 'Session saved. Review progress and recovery.',
    next_recommended: 'Best next move: continue, assess, or take quiz.',
  };

  const transitionSessionFlow = React.useCallback((next: SessionFlowState, reason: string) => {
    const transitions: Record<SessionFlowState, SessionFlowState[]> = {
      idle: ['ready'],
      ready: ['in_progress', 'step_completed'],
      in_progress: ['step_completed', 'session_completed'],
      step_completed: ['in_progress', 'session_completed'],
      session_completed: ['next_recommended', 'ready'],
      next_recommended: ['ready', 'in_progress'],
    };
    setSessionFlowState((prev) => {
      if (prev === next) return prev;
      if (transitions[prev]?.includes(next)) {
        console.log(`[Flow] ${prev} -> ${next} (${reason})`);
        return next;
      }
      return prev;
    });
  }, []);

  const completeSessionForSkill = React.useCallback((skillId: string | null | undefined, durMin: number, afkWarning: boolean, notes?: string, isHistoric?: boolean) => {
    if (!skillId) return;
    store.finishSession(skillId, durMin, afkWarning, notes, isHistoric);
    transitionSessionFlow('session_completed', afkWarning ? 'afk-autostop' : 'session-finished');
  }, [transitionSessionFlow]);

  // --- Handlers ---
  const onExport = () => {
    const bundle = exportBundle("local-user");
    const payload = JSON.stringify(bundle, null, 2);
    Alert.alert("Export", "Copy the JSON from console.", [{ text: "OK" }]);
    console.log("SKILLSEED_EXPORT_V1 = ", payload);
  };

  const onImport = () => {
    Alert.prompt?.("Paste Export JSON", "Paste the JSON to import your progress:", (text) => {
      try {
        const bundle = JSON.parse(text || "{}");
        importBundle(bundle);
        Alert.alert("Import", "Imported successfully.");
      } catch (e) {
        Alert.alert("Import error", String(e));
      }
    });
  };

  // Load quiz for skip level (Intermediate or Expert)
  const loadSkipLevelQuiz = (skill: SkillMaster, level: 'intermediate' | 'expert') => {
    // For languages, try to load level-specific quiz (e.g., lang_german_intermediate)
    if (skill.expDomainKey === 'language') {
      // Extract language name from skill name (e.g., "German" -> "german")
      const langName = skill.name.toLowerCase().split('(')[0].trim().replace(/\s+/g, '_');
      const levelKey = `lang_${langName}_${level}`;
      const existingQuiz = quizMap[levelKey];
      if (existingQuiz && existingQuiz.items) {
        const questions = existingQuiz.items.slice(0, 10);
        setSkipLevelQuiz({ questions, current: 0, answers: {}, finished: false });
        setSkipLevelModal({ open: true, skill, selectedLevel: level });
        return true;
      }
    }
    
    // Try to load general quiz for this skill
    const existingQuiz = quizMap[skill.skill_id];
    if (existingQuiz && existingQuiz.items) {
      // Use existing quiz, take 10 questions
      const questions = existingQuiz.items.slice(0, 10);
      setSkipLevelQuiz({ questions, current: 0, answers: {}, finished: false });
      setSkipLevelModal({ open: true, skill, selectedLevel: level });
      return true;
    }
    // No quiz available - allow direct skip
    return false;
  };

  const handleSkipLevel = (skill: SkillMaster, level: 'intermediate' | 'expert', skipQuiz: boolean = false) => {
    // If quiz is available and not skipped, show quiz first
    if (!skipQuiz && loadSkipLevelQuiz(skill, level)) {
      return; // Quiz will be shown
    }
    
    // Direct skip (no quiz or quiz skipped)
    const gaDefault = appState.getGlobalAssessment();
    const baseA = gaDefault ? { C: gaDefault.q1+gaDefault.q2+gaDefault.q3+gaDefault.q4+gaDefault.q5+gaDefault.q6, F: gaDefault.q3 } : { C: skill.C_preset ?? 18, F: skill.F_preset ?? 3 };
    const k = skill.k;
    const expDomain = skill.expDomainKey;
    const R_eff = 3;
    const E = 1.0;
    const L = estimator.estimateHours({ C: baseA.C, F: baseA.F, R_eff, E, k, expDomain, levelBias: 'F' });
    
    // Calculate logged hours based on level
    // Intermediate: ~50% progress
    // Expert: ~85% progress
    const progressPercent = level === 'intermediate' ? 0.5 : 0.85;
    const loggedHours = L * progressPercent;
    
    // Check if skill already exists
    const existing = store.getUserSkillBySkillId(skill.skill_id);
    const a = gaDefault || { q1:3, q2:3, q3: skill.F_preset ?? 3, q4:3, q5:3, q6:3 } as any;
    
    if (existing) {
      // Update existing skill progress
      store.updateUserSkillProgress(existing.userSkillId, loggedHours);
    } else {
      // Create new skill with skipped progress
      const userSkillId = store.addUserSkillFromAssessment(skill, a, L);
      const newSkill = store.getUserSkill(userSkillId);
      if (newSkill) {
        store.updateUserSkillProgress(userSkillId, loggedHours);
      }
    }
    
    setSkipLevelModal({ open: false, skill: null, selectedLevel: null });
    setSkipLevelQuiz({ questions: [], current: 0, answers: {}, finished: false });
    Alert.alert('Level Set', `Your progress for ${skill.name} has been set to ${level}.`);
    setRoute({ name: 'SkillDashboard', skillId: skill.skill_id });
  };

  const handleSkipLevelQuizSubmit = () => {
    if (!skipLevelModal.skill || !skipLevelModal.selectedLevel) return;
    
    // Calculate score
    const quiz = skipLevelQuiz;
    let correct = 0;
    quiz.questions.forEach((q, idx) => {
      const userAnswer = quiz.answers[idx];
      const correctOption = q.options?.find((opt: any) => opt.correct);
      if (userAnswer === correctOption?.k) correct++;
    });
    
    const score = correct / quiz.questions.length;
    const passMark = 0.7; // 7 out of 10
    
    if (score >= passMark) {
      // Passed - set the level
      handleSkipLevel(skipLevelModal.skill, skipLevelModal.selectedLevel, true);
    } else {
      // Failed - show message
      Alert.alert(
        'Not yet, sorry.',
        `You got ${correct}/10 correct. You need at least 7/10 to skip to ${skipLevelModal.selectedLevel} level.\n\nPlease try again or continue learning.`,
        [
          { text: 'Try Again', onPress: () => setSkipLevelQuiz({ questions: quiz.questions, current: 0, answers: {}, finished: false }) },
          { text: 'Cancel', style: 'cancel', onPress: () => setSkipLevelModal({ open: false, skill: null, selectedLevel: null }) }
        ]
      );
    }
  };

  // --- AFK nudge for Timer, handled in effect (to prevent calling hooks conditionally)
  React.useEffect(() => {
    if (timerState.running && timerState.lastActivity && Date.now() - timerState.lastActivity > 30*60*1000) {
      console.log("AFK nudge: Still working?");
      setTimerState(s => ({ ...s, lastActivity: Date.now() }));
    }
  });

  // -- AFK effect logic: set in Timer screen useEffect --
  useEffect(() => {
    if (route.name !== 'Timer' || !timerState.running) return;
    lastUserActivityRef.current = Date.now();
    const resetActivity = () => { lastUserActivityRef.current = Date.now(); };
    const interval = setInterval(() => {
      if (!timerState.running) return;
      const idle = Date.now() - lastUserActivityRef.current;
      if (idle > 30*60*1000 && !afkModal.visible) {
        setAfkModal({ visible: true, timeout: Date.now() + 60000 });
        if (afkTimeoutRef.current) clearTimeout(afkTimeoutRef.current as any);
        afkTimeoutRef.current = setTimeout(() => {
          setAfkModal({ visible: false, timeout: null });
          if (timerState.skillId) {
            const dur = Math.max(1, Math.round((Date.now() - (timerState.start||Date.now()))/60000));
            completeSessionForSkill(timerState.skillId, dur, true);
          }
          setTimerState({ running: false, paused: false, start: null, accumSec: 0, lastActivity: null, skillId: null });
        }, 60000) as any;
      }
    }, 10000);
    const subs = [AppState.addEventListener('change', resetActivity)];
    return () => {
      clearInterval(interval);
      if (afkTimeoutRef.current) clearTimeout(afkTimeoutRef.current as any);
      subs.forEach(s => s && s.remove && s.remove());
    };
  }, [route.name, timerState.running, timerState.start, timerState.skillId, afkModal.visible, completeSessionForSkill]);

  // Ensure transient UI state doesn't leak across route changes.
  useEffect(() => {
    if (route.name !== 'Timer' && afkModal.visible) {
      setAfkModal({ visible: false, timeout: null });
    }
    if (route.name !== 'SkillDashboard') {
      setManualSession({ open: false, duration: '', notes: '', historic: false });
      setEditSession({ open: false, sessionId: undefined, duration: '', notes: '', historic: false });
      setSkipLevelModal({ open: false, skill: null, selectedLevel: null });
      setSkipLevelQuiz({ questions: [], current: 0, answers: {}, finished: false });
      setIsManualSessionSaving(false);
      setIsEditSessionSaving(false);
    }
  }, [route.name, afkModal.visible]);

  useEffect(() => {
    if (
      route.name === 'SkillDetail' ||
      route.name === 'SkillDashboard' ||
      route.name === 'Assessment' ||
      route.name === 'Quiz' ||
      route.name === 'Timer'
    ) {
      if (sessionFlowState === 'idle' || sessionFlowState === 'next_recommended') {
        transitionSessionFlow('ready', `route:${route.name}`);
      }
    }
  }, [route.name, sessionFlowState, transitionSessionFlow]);

  useEffect(() => {
    if (sessionFlowState !== 'session_completed') return;
    const timer = setTimeout(() => transitionSessionFlow('next_recommended', 'post-completion-guide'), 0);
    return () => clearTimeout(timer);
  }, [sessionFlowState, transitionSessionFlow]);

  // At the top level, after all other useState/useEffect calls:
  const [displayTime, setDisplayTime] = useState(0);

  useEffect(() => {
    let interval: any;
    if (route.name === 'Timer') {
      const base = timerState.accumSec || 0;
      const live = timerState.running && timerState.start ? Math.floor((Date.now() - timerState.start) / 1000) : 0;
      setDisplayTime(base + live);
      interval = setInterval(() => {
        const liveNow = timerState.running && timerState.start ? Math.floor((Date.now() - timerState.start) / 1000) : 0;
        setDisplayTime((timerState.accumSec || 0) + liveNow);
      }, 1000);
    } else {
      setDisplayTime(0);
    }
    return () => clearInterval(interval);
  }, [route.name, timerState.running, timerState.start, timerState.accumSec]);

  // Persist timer state whenever it changes significantly
  useEffect(() => {
    (appState as any).setTimer?.({
      running: timerState.running,
      paused: timerState.paused,
      start: timerState.start,
      accumSec: timerState.accumSec,
      skillId: timerState.skillId,
    });
  }, [timerState.running, timerState.paused, timerState.start, timerState.accumSec, timerState.skillId]);

  function formatTime(sec: number) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      : `${m}:${String(s).padStart(2, '0')}`;
  }

  if (route.name === 'GlobalDashboard') {
    const allUserSkills = (store as any).getAllUserSkills ? (store as any).getAllUserSkills() : (store as any).listUserSkills?.() || [];
    const allSessions = allUserSkills.flatMap((us:any)=> (store as any).getSessionsForSkill?.(us.skill_id) || []);
    const now = Date.now();
    const weekStart = now - 7*24*60*60*1000;
    const thisWeekSessions = allSessions.filter((s:any)=> new Date(s.start_ts).getTime() >= weekStart);
    const weekMinutes = thisWeekSessions.reduce((sum:number, s:any)=> sum + (s.duration_min || 0), 0);
    const weekHours = Math.round((weekMinutes/60)*10)/10;
    const totalSessions = thisWeekSessions.length;
    const skillWeeklyHours: Record<string, number> = {};
    thisWeekSessions.forEach((s:any)=>{ skillWeeklyHours[s.skill_id] = (skillWeeklyHours[s.skill_id]||0) + (s.duration_min/60); });
    const topSkills = allUserSkills
      .map((us:any)=> ({ ...us, weeklyHours: skillWeeklyHours[us.skill_id] || 0 }))
      .sort((a:any,b:any)=> b.weeklyHours - a.weeklyHours)
      .slice(0,3);
    // streaks and simple achievements
    function computeStreakDays(sessions:any[]): { current:number; longest:number }{
      const byDay = new Set(sessions.map(s=> new Date(s.start_ts).toDateString()));
      // current streak ending today
      let cur = 0; let day = new Date();
      while (byDay.has(day.toDateString())) { cur++; day = new Date(day.getTime() - 24*60*60*1000); }
      // longest streak (simple scan)
      const daysSorted = Array.from(byDay).map(d=> new Date(d).getTime()).sort((a,b)=>a-b);
      let longest = 0; let run = 0; let prev:number|undefined;
      for (const t of daysSorted) {
        if (prev===undefined || t - prev === 24*60*60*1000) run++; else run = 1;
        longest = Math.max(longest, run); prev = t;
      }
      return { current: cur, longest };
    }
    const { current: currentStreak, longest: longestStreak } = computeStreakDays(allSessions);
    const totalMinutesAll = allSessions.reduce((sum:number,s:any)=> sum + (s.duration_min||0), 0);
    const achievements = [
      { k: '10h+', ok: (totalMinutesAll/60) >= 10 },
      { k: '25 sessions', ok: allSessions.length >= 25 },
      { k: 'Weekly 5+', ok: thisWeekSessions.length >= 5 },
    ];
    const weeklyGoal = (appState as any).getWeeklyGoalHours ? (appState as any).getWeeklyGoalHours() : 5;
    const goal = Math.max(0.5, weeklyGoal || 5);
    const goalPct = Math.min(100, Math.round((weekHours/goal)*100));
    return (
      <SafeAreaView style={{ flex:1, backgroundColor: colors.background }}>
        <Header title="Dashboard" />
        <View style={{ flex: 1, position: 'relative' }}>
        <ScrollView 
          contentContainerStyle={{ padding: spacing.m, paddingBottom: 96 }}
          removeClippedSubviews={false}
          style={{ overflow: 'hidden' }}
        >
          <Card>
            <Text style={{ fontSize: 20, fontWeight:'800', marginBottom: 16 }}>This Week</Text>
            <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom: 24 }}>
              <View>
                <Text style={{ fontSize: 36, fontWeight:'800', color: colors.text }}>{weekHours}h</Text>
                <Text style={{ color: colors.muted, marginTop: 4 }}>Total Time</Text>
              </View>
              <View style={{ alignItems:'flex-end' }}>
                <Text style={{ fontSize: 36, fontWeight:'800', color: colors.primary }}>{totalSessions}</Text>
                <Text style={{ color: colors.muted, marginTop: 4 }}>Sessions</Text>
              </View>
            </View>
            {/* Weekly Bars */}
            <View style={{ flexDirection:'row', alignItems:'flex-end', height: 80, gap: 8 }}>
              {['M','T','W','T','F','S','S'].map((day,i)=>{
                const dayStart = weekStart + i*24*60*60*1000;
                const dayEnd = dayStart + 24*60*60*1000;
                const daySessions = allSessions.filter((s:any)=>{
                  const st = new Date(s.start_ts).getTime();
                  return st >= dayStart && st < dayEnd;
                });
                const dayHours = daySessions.reduce((sum:number,s:any)=> sum + s.duration_min/60, 0);
                const maxHeight = Math.max(...Array(7).fill(0).map((_,j)=>{
                  const ds = weekStart + j*24*60*60*1000; const de = ds + 24*60*60*1000;
                  return allSessions.filter((s:any)=>{ const st = new Date(s.start_ts).getTime(); return st>=ds && st<de; })
                    .reduce((sum:number,s:any)=> sum + s.duration_min/60, 0);
                }));
                const heightPercent = maxHeight>0 ? (dayHours/maxHeight)*100 : 0;
                return (
                  <View key={i} style={{ flex:1, alignItems:'center' }}>
                    <View style={{ flex:1, width:'100%', justifyContent:'flex-end', marginBottom: 6 }}>
                      <View style={{ width:'100%', height: `${heightPercent}%`, backgroundColor: colors.primary, borderRadius: 6, minHeight: dayHours>0?8:0 }} />
                    </View>
                    <Text style={{ fontSize: 11, color: colors.muted, fontWeight:'500' }}>{day}</Text>
                  </View>
                );
              })}
            </View>
          </Card>
          <Card>
            <Text style={{ fontWeight:'700', marginBottom: 8 }}>Weekly Goal</Text>
            <EnhancedProgressBar percent={goalPct} />
            <View style={{ flexDirection:'row', justifyContent:'space-between', marginTop: 8 }}>
              <Text style={{ color: colors.muted }}>{weekHours}h / {goal}h</Text>
              <Text style={{ fontWeight:'700', color: colors.primary }}>{goalPct}%</Text>
            </View>
            <View style={{ flexDirection:'row', gap: 8, marginTop: 12 }}>
              <TextInput
                keyboardType="numeric"
                placeholder="Set weekly goal (h)"
                defaultValue={String(goal)}
                onChangeText={(text)=>{
                  console.log('[Input] Weekly Goal - Text changed:', text);
                }}
                onSubmitEditing={(e)=>{
                  const text = e.nativeEvent.text;
                  console.log('[Input] Weekly Goal - Submitted:', text);
                  const v = parseFloat(text);
                  console.log('[Input] Weekly Goal - Parsed value:', v);
                  if (!isNaN(v) && v > 0) {
                    console.log('[Input] Weekly Goal - Setting goal to:', v, 'hours');
                    (appState as any).setWeeklyGoalHours?.(v);
                    navigate({ name:'GlobalDashboard' });
                  } else {
                    console.log('[Input] Weekly Goal - ⚠️ Invalid value:', text);
                  }
                }}
                style={{ flex:1, borderWidth:1, borderColor: colors.border, borderRadius:10, padding:10, backgroundColor: colors.card }}
                placeholderTextColor={colors.muted}
              />
              <Button title="Save" onPress={()=>{/* handled by onSubmitEditing */}} />
            </View>
          </Card>
          <Card>
            <Text style={{ fontWeight:'700', marginBottom: 8 }}>Streaks</Text>
            <Text style={{ fontSize: 28, fontWeight:'800' }}>{currentStreak}🔥</Text>
            <Text style={{ color: colors.muted, marginTop: 4 }}>Longest: {longestStreak} days</Text>
          </Card>
          <Card>
            <Text style={{ fontWeight:'700', marginBottom: 8 }}>Achievements</Text>
            <View style={{ flexDirection:'row', gap: 8 }}>
              {achievements.map(a=> (
                <View key={a.k} style={{ paddingVertical:6, paddingHorizontal:10, borderRadius:10, borderWidth:1, borderColor: a.ok? colors.success: colors.border, backgroundColor: a.ok? colors.primarySoft: colors.card }}>
                  <Text style={{ color: a.ok? '#0B8F5A': colors.muted, fontWeight:'600' }}>{a.k}</Text>
                </View>
              ))}
            </View>
          </Card>
          {allUserSkills.length === 0 && (
            <Card>
              <Text style={{ fontWeight:'700', marginBottom: 8 }}>No skills yet</Text>
              <Text style={{ color: colors.muted, marginBottom: 16 }}>Start tracking a skill to see your progress here.</Text>
              <Button title="Browse Skills" onPress={()=> setRoute({ name:'Explore' })} />
            </Card>
          )}
          {topSkills.length > 0 && (
            <>
              <Text style={{ fontSize: 18, fontWeight:'800', marginTop: 8, marginBottom: 12 }}>Your Active Skills</Text>
              {topSkills.map((us:any)=> {
                const skill = skills.find(s=>s.skill_id===us.skill_id);
                console.log('[Dashboard] Active Skill - us.skill_id:', us.skill_id, 'found skill:', skill?.name || 'NOT FOUND');
                if (!skill) {
                  console.log('[Dashboard] ⚠️ Skill not found for skill_id:', us.skill_id);
                  console.log('[Dashboard] Available skill_ids (first 5):', skills.slice(0, 5).map(s => s.skill_id));
                }
                const pct = Math.min(100, Math.round((us.progress.logged_hours / Math.max(us.estimates.L_hours,1))*100));
                const categoryColor = getCategoryColor(skill?.category || '');
                const displayName = skill?.name || (us.skill_id ? us.skill_id.replace(/[\/_]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) : 'Unknown Skill');
                return (
                  <TouchableOpacity 
                    key={us.skill_id} 
                    onPress={()=> {
                      console.log('[Dashboard] Active Skill card clicked:', us.skill_id, 'skill name:', skill?.name);
                      navigate({ name:'SkillDashboard', skillId: us.skill_id });
                    }} 
                    activeOpacity={0.8}
                  >
                    <Card>
                      <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom: 8 }}>
                        <View style={{ flexDirection:'row', alignItems:'center', gap: 6 }}>
                          <CategoryIcon category={skill?.category||''} size={18} color={colors.text} />
                          <Text style={{ fontSize: 17, fontWeight:'700' }}>{displayName}</Text>
                        </View>
                        <Text style={{ fontSize: 20, fontWeight:'800', color: categoryColor }}>{pct}%</Text>
                      </View>
                      <EnhancedProgressBar percent={pct} />
                      <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
                        <Text style={{ color: colors.muted, fontSize: 13 }}>{(us.weeklyHours||0).toFixed(1)}h this week</Text>
                        <Text style={{ color: colors.muted, fontSize: 13 }}>{us.progress.logged_hours}h / {Math.round(us.estimates.L_hours)}h</Text>
                      </View>
                    </Card>
                  </TouchableOpacity>
                );
              })}
            </>
          )}
        </ScrollView>
        {/* Bottom fade mask - fades content under tab bar with smooth transition */}
        <LinearGradient
          pointerEvents="none"
          colors={['transparent', 'rgba(245,245,245,0.3)', 'rgba(245,245,245,0.6)', 'rgba(245,245,245,0.85)', 'rgba(245,245,245,1)']}
          start={{ x:0, y:0 }} end={{ x:0, y:1 }}
          style={{ 
            position: 'absolute', 
            left: 0, 
            right: 0, 
            bottom: 0, 
            height: 90,
            zIndex: 1 
          }}
        />
        <TabBar />
        </View>
      </SafeAreaView>
    );
  }

  // --- Skill Detail screen: show estimate and actions ---
  if (route.name === 'SkillDetail') {
    const sk = route.skill;
    const isFundamental = sk.type === 'fundamental';
    const isUnmeasurable = isFundamental; // Fundamentals are not measurable in terms of "expert level"
    
    const gaDefault = appState.getGlobalAssessment();
    const baseA = gaDefault ? { C: gaDefault.q1+gaDefault.q2+gaDefault.q3+gaDefault.q4+gaDefault.q5+gaDefault.q6, F: gaDefault.q3 } : { C: sk.C_preset ?? 18, F: sk.F_preset ?? 3 };
    const k = sk.k;
    const expDomain = sk.expDomainKey;
    const R_eff = 3;
    const E = 1.0;
    const L = isFundamental ? 0 : estimator.estimateHours({ C: baseA.C, F: baseA.F, R_eff, E, k, expDomain, levelBias: 'F' });
    
    // Check if skill is already tracked
    const existingUserSkill = store.getUserSkillBySkillId(sk.skill_id);
    let progressPercent = 0;
    let loggedHours = 0;
    let estimatedTotal = L;
    let hoursLeft = L;
    let weeklyRate = 0; // hours per week
    let weeklySessions = 0;
    
    if (existingUserSkill) {
      loggedHours = existingUserSkill.progress.logged_hours;
      estimatedTotal = isFundamental ? 0 : existingUserSkill.estimates.L_hours;
      progressPercent = isFundamental ? 0 : Math.min(100, Math.round((loggedHours / Math.max(estimatedTotal, 1)) * 100));
      
      // Calculate weekly practice rate from last 7 days
      const now = Date.now();
      const weekStart = now - 7 * 24 * 60 * 60 * 1000;
      const allSessions = store.getSessionsForSkill(sk.skill_id) || [];
      const weekSessionsList = allSessions.filter((s: Session) => {
        const start = new Date(s.start_ts).getTime();
        return start >= weekStart;
      });
      weeklySessions = weekSessionsList.length;
      const weekHours = weekSessionsList.reduce((sum: number, s: Session) => sum + (s.duration_min || 0) / 60, 0);
      weeklyRate = weekHours;
      
      if (!isFundamental) {
        const remainingHours = Math.max(0, estimatedTotal - loggedHours);
        hoursLeft = remainingHours;
      }
    } else {
      if (!isFundamental) {
        hoursLeft = L;
      }
    }
    
    return (
      <SafeAreaView style={{ flex:1, backgroundColor: colors.background }}>
        <Header title={sk.name} onBack={()=>setRoute({ name:'Explore' })} />
        <View style={{ padding: spacing.m, gap: 12 }}>
          <Card>
            {isFundamental ? (
              <>
                {/* Fundamentals: Show Balance Tracking */}
                <Text style={{ fontSize: 16, fontWeight: '700' }}>Track Balance</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                  <Text style={{ fontSize: 28, fontWeight: '800', marginRight: 8 }}>∞</Text>
                  <Text style={{ fontSize: 16, color: colors.muted }}>Continuous Practice</Text>
                </View>
                
                {existingUserSkill && (
                  <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text style={{ color: colors.muted, fontSize: 14 }}>
                        {loggedHours.toFixed(1)}h total
                      </Text>
                      <Text style={{ color: colors.muted, fontSize: 14 }}>
                        {weeklySessions} sessions this week
                      </Text>
                    </View>
                    <Text style={{ color: colors.muted, fontSize: 13 }}>
                      Focus on consistency and sustainability
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <>
                {/* Hard/Soft Skills: Show Estimated Hours */}
                <Text style={{ fontSize: 16, fontWeight: '700' }}>Estimated hours to Independent Level</Text>
                <Text style={{ marginTop: 6, fontSize: 28, fontWeight: '800' }}>{Math.round(estimatedTotal)} h</Text>
                
                {/* Progress Bar - between hours and category */}
                {existingUserSkill && (
                  <View style={{ marginTop: 12, marginBottom: 6 }}>
                    <EnhancedProgressBar 
                      percent={progressPercent} 
                      height={12}
                      color={colors.success}
                      showLabel={false}
                    />
                  </View>
                )}
                
                {/* Additional info - below category */}
                {existingUserSkill && (
                  <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ color: colors.muted, fontSize: 14 }}>
                        {loggedHours.toFixed(1)}h logged
                      </Text>
                      <Text style={{ color: colors.muted, fontSize: 14 }}>
                        {hoursLeft.toFixed(1)}h remaining
                      </Text>
                    </View>
                    {weeklyRate > 0 && (
                      <Text style={{ color: colors.muted, fontSize: 13, marginTop: 6 }}>
                        At current pace ({weeklyRate.toFixed(1)}h/week), ~{Math.ceil(hoursLeft / weeklyRate)} weeks left
                      </Text>
                    )}
                  </View>
                )}
              </>
            )}
            
            <Text style={{ color: colors.muted, marginTop: existingUserSkill ? 12 : 6 }}>
              {sk.category} • {sk.subcategory}
            </Text>
            
            {/* Professional Benchmark Description */}
            {!isFundamental && (
              <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text, marginBottom: 4 }}>
                  Target Level: Independent Proficiency
                </Text>
                <Text style={{ fontSize: 11, color: colors.muted, lineHeight: 16 }}>
                  {sk.benchmarkType === 'quantitative' 
                    ? `Heuristic time estimate based on skill complexity factors (cognitive load, feedback speed, error cost, context dependency). Calibrated using your self-assessment to personalize the approximation. Estimates update as you track practice time.`
                    : sk.benchmarkType === 'qualitative'
                    ? `Heuristic estimate based on qualitative skill development patterns and engagement factors. Personalized using your self-assessment. Estimates adjust automatically based on your tracked practice sessions and consistency.`
                    : `Heuristic time estimate based on skill complexity analysis. Personalized from your self-assessment responses. Estimates calibrate over time as you log practice sessions and build consistency.`
                  }
                </Text>
              </View>
            )}
            
            {/* Warning for unmeasurable skills */}
            {isUnmeasurable && (
              <View style={{ marginTop: 12, padding: 12, backgroundColor: '#FFF4E6', borderRadius: 8, borderLeftWidth: 3, borderLeftColor: '#FF9800' }}>
                <Text style={{ fontSize: 13, color: '#E65100', fontWeight: '600' }}>
                  ⚠️ Don't be silly, you can't be an "expert" in {sk.name.toLowerCase()}.
                </Text>
                <Text style={{ fontSize: 12, color: '#E65100', marginTop: 4, opacity: 0.8 }}>
                  This is about balance and consistency, not mastery.
                </Text>
              </View>
            )}
          </Card>
          <Button title="Start Timer" onPress={()=> {
            // Check if skill has been assessed/tracked
            const existing = store.getUserSkillBySkillId(sk.skill_id);
            if (!existing) {
              // No assessment yet - redirect to assessment
              Alert.alert(
                'Assessment Required',
                'Please complete the assessment first to get your personalized time estimate.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Start Assessment', onPress: () => setRoute({ name:'Assessment', skill: sk }) }
                ]
              );
              return;
            }
            // Assessment complete - start timer
            const now = Date.now();
            setTimerState({ running:true, paused:false, start: now, accumSec: 0, lastActivity: now, skillId: sk.skill_id });
            transitionSessionFlow('in_progress', 'skill-detail-start');
            Haptics.selectionAsync();
            setRoute({ name:'Timer', skillId: sk.skill_id });
          }} />
          {!isFundamental && (
            <>
              <Button title="Refine Estimate" onPress={()=> setRoute({ name:'Assessment', skill: sk })} />
              <Button 
                title="Skip to Level" 
                onPress={()=> setSkipLevelModal({ open: true, skill: sk })} 
              />
            </>
          )}
          <Button title="View Dashboard" onPress={()=>{
            const existing = store.getUserSkillBySkillId(sk.skill_id);
            if (!existing) {
              if (isFundamental) {
                // For fundamentals, just track hours without end goal
                const userSkill: any = {
                  userSkillId: uid(),
                  skill_id: sk.skill_id,
                  self: { q1:3, q2:3, q3:3, q4:3, q5:3, q6:3, C: 18, F: 3, level_claim: "F" },
                  intensity: { R_est: 3, R_real: 0, R_eff: 3, E: 1.0 },
                  estimates: { k: sk.k, L_hours: 0, confidence: "med" }, // No end goal for fundamentals
                  progress: { logged_hours: 0 },
                  updated_at: Date.now()
                };
                (store as any).addUserSkillFromAssessment?.(sk, userSkill.self, 0) || 
                ((store as any).listUserSkills().push(userSkill), 
                 require('./src/services/storage').storage.setItem("skillseed.userSkills", JSON.stringify((store as any).listUserSkills())).catch(()=>{}));
              } else {
                const gaDefault = appState.getGlobalAssessment();
                const a = gaDefault || { q1:3, q2:3, q3: sk.F_preset ?? 3, q4:3, q5:3, q6:3 } as any;
                const baseA = { C: (a.q1+a.q2+a.q3+a.q4+a.q5+a.q6), F: a.q3 };
                const L = estimator.estimateHours({ C: baseA.C, F: baseA.F, R_eff: 3, E: 1.0, k: sk.k, expDomain: sk.expDomainKey, levelBias: 'F' });
                store.addUserSkillFromAssessment(sk, a, L);
              }
            }
            navigate({ name:'SkillDashboard', skillId: sk.skill_id });
          }} />
        </View>
        <TabBar />
      </SafeAreaView>
    );
  }

  // --- Timer Screen removed from here - handled below after SkillDashboard ---

  // --- RENDER ---
  // --- Main Explore screen (when selectedCategory == null) ---
  if (!booted) {
    return <SafeAreaView style={{ flex:1, backgroundColor: colors.background }}><Header title="" /><View style={{ padding: spacing.m }}><Text>Loading…</Text></View></SafeAreaView>;
  }

  if (route.name === 'Explore' || route.name === 'Search') {
    // --- Group skills by type (Hard/Soft/Fundamentals) ---
    const skillsByType = {
      hard: skills.filter(s => !s.type || s.type === 'hard'),
      soft: skills.filter(s => s.type === 'soft'),
      fundamental: skills.filter(s => s.type === 'fundamental')
    };
    
    // --- Map categories within each type ---
    const categorizedByType: {
      hard: Record<string, SkillMaster[]>;
      soft: Record<string, SkillMaster[]>;
      fundamental: Record<string, SkillMaster[]>;
    } = {
      hard: {},
      soft: {},
      fundamental: {}
    };
    
    skillsByType.hard.forEach(skill => {
      const cat = skill.category || 'Other';
      if (!categorizedByType.hard[cat]) categorizedByType.hard[cat] = [];
      categorizedByType.hard[cat].push(skill);
    });
    
    skillsByType.soft.forEach(skill => {
      const cat = skill.category || 'Other';
      if (!categorizedByType.soft[cat]) categorizedByType.soft[cat] = [];
      categorizedByType.soft[cat].push(skill);
    });
    
    skillsByType.fundamental.forEach(skill => {
      const cat = skill.category || 'Other';
      if (!categorizedByType.fundamental[cat]) categorizedByType.fundamental[cat] = [];
      categorizedByType.fundamental[cat].push(skill);
    });
    
    // --- Get sorted categories for each type ---
    const categoriesHard = getSortedCategories(Object.keys(categorizedByType.hard));
    const categoriesSoft = getSortedCategories(Object.keys(categorizedByType.soft));
    const categoriesFundamental = getSortedCategories(Object.keys(categorizedByType.fundamental));
    
    // --- Legacy: keep all categories for backward compatibility ---
    const allCategories = getSortedCategories([...new Set(skills.map(s => s.category).filter(Boolean))] as string[]);
    const categorizedSkills: Record<string, SkillMaster[]> = {};
    skills.forEach(skill => {
      if (!categorizedSkills[skill.category]) categorizedSkills[skill.category] = [];
      categorizedSkills[skill.category].push(skill);
    });

    // --- Category color map (customize as desired, uses known names and theme colors) ---
    const categoryPalette: Record<string, string> = {
      'Coding': colors.primary,
      'CAD/3D': colors.accent,
      'AI/Data': '#A259FF',
      'Design': '#32D29F',
      'Language': '#FF7C51',
    };

    // --- In Explore/Home view, place search bar on top, then categories, then search results or category drilldown ---
if (route.name === 'Explore' || route.name === 'Search') {
  // If a search is entered, show matching skills, else show category cards
  const searchResults = q ? fuse.search(q).map(r => r.item) : null;
      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="" />
      <View style={{ flex: 1, position: 'relative' }}>
      <ScrollView 
        contentContainerStyle={{ paddingHorizontal: spacing.m, paddingTop: 12, paddingBottom: 96, rowGap: 12 }}
        removeClippedSubviews={false}
        style={{ overflow: 'hidden' }}
      >
            {appState.getUsername() && (
              <Card>
                <Text style={{ fontWeight:'700' }}>Welcome back, {appState.getUsername()}.</Text>
              </Card>
            )}
            {/* Featured skills carousel */}
            <Text style={{ fontWeight:'700', fontSize:18, marginTop: 8, marginBottom: 8 }}>Featured</Text>
            <View style={{ position:'relative', marginBottom: 12 }}>
              <FlatList
                horizontal
                data={featuredSkills}
                keyExtractor={(it)=>it.skill_id}
                showsHorizontalScrollIndicator={false}
                overScrollMode="never"
                contentContainerStyle={{ paddingHorizontal: spacing.m, paddingVertical: 4 }}
                ItemSeparatorComponent={() => <View style={{ width: 14 }} />}
                renderItem={({ item }) => {
                  // Apple-like smart truncation: preserve first word, intelligently abbreviate
                  const smartTruncate = (text: string, maxChars: number = 28): string => {
                    if (text.length <= maxChars) return text;
                    const words = text.split(' ');
                    if (words.length === 1) return text.substring(0, maxChars - 3) + '...';
                    
                    // Preserve first word, abbreviate middle if needed
                    let result = words[0];
                    if (words.length === 2) {
                      // Two words: truncate second if needed
                      const remaining = maxChars - result.length - 1;
                      if (remaining > 0) {
                        result += ' ' + (words[1].length > remaining ? words[1].substring(0, remaining - 3) + '...' : words[1]);
                      }
                    } else {
                      // Multiple words: first word + last word(s), skip middle
                      const lastWord = words[words.length - 1];
                      const spaceForLast = maxChars - result.length - 3; // -3 for ellipsis
                      if (spaceForLast > 0 && lastWord.length <= spaceForLast) {
                        result += ' ' + lastWord;
                      } else if (result.length + lastWord.length > maxChars) {
                        result = result.substring(0, maxChars - 3) + '...';
                      } else {
                        result += ' ' + lastWord.substring(0, spaceForLast);
                      }
                    }
                    return result;
                  };
                  
                  return (
                    <TouchableOpacity 
                      onPress={() => {
                        console.log('[Featured Card] Clicked:', item.name, item.skill_id);
                        navigate({ name:'SkillDetail', skill: item });
                      }} 
                      activeOpacity={0.7}
                    >
                      <View style={{ width: 240, height: 100, backgroundColor: colors.card, borderRadius:14, padding:12, borderWidth:1, borderColor: colors.border, justifyContent:'space-between' }}>
                        <View style={{ flex: 1, justifyContent: 'flex-start', paddingRight: 4 }}>
                          <View style={{ flexDirection:'row', alignItems:'flex-start', gap: 8 }}>
                            <View style={{ marginTop: 1 }}>
                              <CategoryIcon category={item.category} size={18} color={colors.text} />
                            </View>
                            <Text style={{ fontWeight:'700', fontSize: 14, lineHeight: 18, flex: 1, flexWrap: 'wrap' }} numberOfLines={2} ellipsizeMode="tail">
                              {smartTruncate(item.name, 32)}
                            </Text>
                          </View>
                        </View>
                        <Text style={{ color: colors.muted, fontSize: 11, lineHeight: 14, marginTop: 8 }} numberOfLines={1} ellipsizeMode="tail">
                          {smartTruncate(`${item.category} • ${item.subcategory}`, 34)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                }}
                decelerationRate="fast"
                snapToAlignment="start"
              />
              {/* Horizontal edge fade masks - left and right with smooth fade transition */}
              <LinearGradient
                pointerEvents="none"
                colors={['rgba(245,245,245,1)', 'rgba(245,245,245,0.95)', 'rgba(245,245,245,0.7)', 'rgba(245,245,245,0.3)', 'transparent']}
                start={{ x:0, y:0.5 }} end={{ x:1, y:0.5 }}
                style={{ position:'absolute', left:0, top:0, bottom:0, width:40, zIndex: 2 }}
              />
              <LinearGradient
                pointerEvents="none"
                colors={['transparent', 'rgba(245,245,245,0.3)', 'rgba(245,245,245,0.7)', 'rgba(245,245,245,0.95)', 'rgba(245,245,245,1)']}
                start={{ x:0, y:0.5 }} end={{ x:1, y:0.5 }}
                style={{ position:'absolute', right:0, top:0, bottom:0, width:40, zIndex: 2 }}
              />
            </View>
            {/* SEARCH BAR */}
            <View style={{
              backgroundColor: colors.card,
              borderRadius: 12,
              borderColor: colors.border,
              borderWidth: 1,
              paddingHorizontal: 14,
              paddingVertical: 8,
              marginBottom: 12,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10
            }}>
              <MaterialIcons name="search" size={20} color={colors.muted} />
              <TextInput
                value={q}
                onChangeText={(text)=>{
                  console.log('[Input] Search Skill - Text changed:', text.length, 'chars');
                  console.log('[Input] Previous query:', q);
                  setQ(text);
                  if (text && selectedCategory) {
                    console.log('[Input] Clearing selectedCategory because search entered');
                    setSelectedCategory(null);
                  }
                }}
                placeholder="Search Skill"
                style={{
                  flex: 1,
                  fontSize: 16,
                  color: colors.text
                }}
                placeholderTextColor={colors.muted}
              />
            </View>
            {/* If there's a search, show results, otherwise show categories */}
            {q && searchResults && (
              searchResults.length ? (
                <View>{searchResults.map(skill => (
                  <TouchableOpacity key={skill.skill_id} onPress={() => setRoute({ name: 'SkillDetail', skill })}>
                    <Card>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>{skill.name}</Text>
                      <Text style={{ color: colors.muted, marginTop: 4 }}>{skill.category} • {skill.subcategory}</Text>
                    </Card>
                  </TouchableOpacity>
                ))}</View>
              ) : <Card><Text>No skills found.</Text></Card>
            )}
        {!q && !selectedCategory && (
          <View style={{ gap: 12 }}>
            {/* Hard Skills Section */}
             {categoriesHard.length > 0 && (
               <View>
                 <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                   <MaterialIcons name="code" size={20} color={colors.text} />
                   <Text style={{ fontSize: 20, fontWeight: '800', marginLeft: 8 }}>Hard Skills</Text>
                   <Text style={{ fontSize: 14, color: colors.muted, marginLeft: 8 }}>
                     ({skillsByType.hard.length})
                   </Text>
                 </View>
                 <Card style={{ marginBottom: 12, padding: 10, backgroundColor: colors.card, opacity: 0.95 }}>
                   <Text style={{ fontSize: 11, color: colors.muted, fontStyle: 'italic' }}>
                     Estimates based on measurable milestones and proficiency benchmarks
                   </Text>
                 </Card>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                  {categoriesHard.map(catRaw => {
                    const cat = (catRaw || 'Other');
                    // Create unique display name: use first meaningful part, but ensure uniqueness
                    const parts = cat.split(/[\/\s]/).filter(p => p.length > 0);
                    let display = parts[0];
                    // If first part alone would cause collision, add second part
                    const firstParts = categoriesHard.map(c => c.split(/[\/\s]/)[0]).filter(Boolean);
                    const collision = firstParts.filter(p => p === display).length > 1;
                    if (collision && parts.length > 1) {
                      display = `${parts[0]} ${parts[1]}`;
                    }
                    return (
                      <TouchableOpacity
                        key={`hard-${cat}`}
                        activeOpacity={0.9}
                        onPress={() => setSelectedCategory(cat)}
                        style={{ width: '48%', marginBottom: 14 }}
                      >
                        <AnimatedCategoryTile color={getCategoryColor(cat, 'hard')}>
                          <View style={{ flexDirection:'row', alignItems:'center', gap: 8 }}>
                            <CategoryIcon category={cat} size={20} color="#fff" />
                            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 18 }} numberOfLines={1}>
                              {display}
                            </Text>
                          </View>
                          <Text style={{ color: '#fff', opacity:0.85, fontSize: 13 }}>
                            {categorizedByType.hard[cat]?.length || 0} skills
                          </Text>
                        </AnimatedCategoryTile>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
            
            {/* Soft Skills Section */}
             {categoriesSoft.length > 0 && (
               <View>
                 <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                   <MaterialIcons name="psychology" size={20} color={colors.text} />
                   <Text style={{ fontSize: 20, fontWeight: '800', marginLeft: 8 }}>Soft Skills</Text>
                   <Text style={{ fontSize: 14, color: colors.muted, marginLeft: 8 }}>
                     ({skillsByType.soft.length})
                   </Text>
                 </View>
                 <Card style={{ marginBottom: 12, padding: 10, backgroundColor: colors.card, opacity: 0.95 }}>
                   <Text style={{ fontSize: 11, color: colors.muted, fontStyle: 'italic' }}>
                     Estimates based on qualitative growth and engagement patterns
                   </Text>
                 </Card>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                  {categoriesSoft.map(catRaw => {
                    const cat = (catRaw || 'Other');
                    // Create unique display name: use first meaningful part, but ensure uniqueness
                    const parts = cat.split(/[\/\s]/).filter(p => p.length > 0);
                    let display = parts[0];
                    // If first part alone would cause collision, add second part
                    const firstParts = categoriesSoft.map(c => c.split(/[\/\s]/)[0]).filter(Boolean);
                    const collision = firstParts.filter(p => p === display).length > 1;
                    if (collision && parts.length > 1) {
                      display = `${parts[0]} ${parts[1]}`;
                    }
                    return (
                      <TouchableOpacity
                        key={`soft-${cat}`}
                        activeOpacity={0.9}
                        onPress={() => setSelectedCategory(cat)}
                        style={{ width: '48%', marginBottom: 14 }}
                      >
                        <AnimatedCategoryTile color={getCategoryColor(cat, 'soft')}>
                          <View style={{ flexDirection:'row', alignItems:'center', gap: 8 }}>
                            <CategoryIcon category={cat} size={20} color="#fff" />
                            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 18 }} numberOfLines={1}>
                              {display}
                            </Text>
                          </View>
                          <Text style={{ color: '#fff', opacity:0.85, fontSize: 13 }}>
                            {categorizedByType.soft[cat]?.length || 0} skills
                          </Text>
                        </AnimatedCategoryTile>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
            
            {/* Fundamentals Section */}
             {categoriesFundamental.length > 0 && (
               <View>
                 <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                   <Text style={{ fontSize: 20, fontWeight: '800', marginRight: 8 }}>∞</Text>
                   <Text style={{ fontSize: 20, fontWeight: '800' }}>Fundamentals</Text>
                   <Text style={{ fontSize: 14, color: colors.muted, marginLeft: 8 }}>
                     ({skillsByType.fundamental.length})
                   </Text>
                 </View>
                 <Card style={{ marginBottom: 12, padding: 10, backgroundColor: colors.card, opacity: 0.95 }}>
                   <Text style={{ fontSize: 11, color: colors.muted, fontStyle: 'italic' }}>
                     Focus on balance and consistency, not mastery
                   </Text>
                 </Card>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                  {categoriesFundamental.map(catRaw => {
                    const cat = (catRaw || 'Other');
                    // Create unique display name: use first meaningful part, but ensure uniqueness
                    const parts = cat.split(/[\/\s]/).filter(p => p.length > 0);
                    let display = parts[0];
                    // If first part alone would cause collision, add second part
                    const firstParts = categoriesFundamental.map(c => c.split(/[\/\s]/)[0]).filter(Boolean);
                    const collision = firstParts.filter(p => p === display).length > 1;
                    if (collision && parts.length > 1) {
                      display = `${parts[0]} ${parts[1]}`;
                    }
                    return (
                      <TouchableOpacity
                        key={`fundamental-${cat}`}
                        activeOpacity={0.9}
                        onPress={() => setSelectedCategory(cat)}
                        style={{ width: '48%', marginBottom: 14 }}
                      >
                        <AnimatedCategoryTile color={getCategoryColor(cat, 'fundamental')}>
                          <View style={{ flexDirection:'row', alignItems:'center', gap: 8 }}>
                            <CategoryIcon category={cat} size={20} color="#fff" />
                            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 18 }} numberOfLines={1}>
                              {display}
                            </Text>
                          </View>
                          <Text style={{ color: '#fff', opacity:0.85, fontSize: 13 }}>
                            {categorizedByType.fundamental[cat]?.length || 0} skills
                          </Text>
                        </AnimatedCategoryTile>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </View>
        )}
            {/* DRILLDOWN: category -> skills */}
            {!q && selectedCategory && (
              <View>
                <TouchableOpacity onPress={() => setSelectedCategory(null)} style={{marginBottom:14}}>
                  <Text style={{ color: colors.primary, fontWeight:'700' }}>{'< Back to categories'}</Text>
                </TouchableOpacity>
                {/* Category Benchmark Info */}
                <Card style={{ marginBottom: 12, padding: 10, backgroundColor: colors.card, opacity: 0.95 }}>
                  <Text style={{ fontSize: 11, color: colors.muted, fontStyle: 'italic' }}>
                    Based on multiple learning curves and skill complexity analysis
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.muted, marginTop: 4 }}>
                    Estimates reflect typical time to reach independent proficiency level
                  </Text>
                </Card>
                {categorizedSkills[selectedCategory]?.map(skill => (
                  <TouchableOpacity key={skill.skill_id} onPress={() => setRoute({ name: 'SkillDetail', skill })}>
                    <Card>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>{skill.name}</Text>
                      <Text style={{ color: colors.muted, marginTop: 4 }}>{skill.category} • {skill.subcategory}</Text>
                    </Card>
                  </TouchableOpacity>
                ))}
              </View>
            )}
      </ScrollView>
      {/* Bottom fade mask - fades content under tab bar */}
      <LinearGradient
        pointerEvents="none"
        colors={['transparent', 'rgba(248,249,250,0.4)', 'rgba(248,249,250,0.85)', 'rgba(248,249,250,1)']}
        start={{ x:0, y:0 }} end={{ x:0, y:1 }}
        style={{ 
          position: 'absolute', 
          left: 0, 
          right: 0, 
          bottom: 0, 
          height: 80,
          zIndex: 1 
        }}
      />
      <TabBar />
      </View>
        </SafeAreaView>
      );
    }
  }

  // --- Splash Screen (shown before Onboarding) ---
  if (showSplash) {
    return (
      <SplashScreen
        onComplete={() => {
          setShowSplash(false);
          setRoute({ name: 'Onboarding' });
        }}
      />
    );
  }

  // --- Onboarding Flow ---
  if (route.name === 'Onboarding') {
    // Show new onboarding carousel
    return (
      <OnboardingCarousel
        slides={onboardingSlides}
        initialUsername={username}
        onComplete={(userName) => {
          appState.setUsername(userName || 'Guest');
          // TEST MODE: Onboarding-Status nicht setzen, damit es beim nächsten Start wieder kommt
          if (!FORCE_ONBOARDING) {
            appState.setOnboarded(true);
          }
          setRoute({ name: 'GlobalAssessment' });
        }}
      />
    );
  }

  if (route.name === 'Profile') {
    return (
      <SafeAreaView style={{ flex:1, backgroundColor: colors.background }}>
        <Header title="Profile" />
        <View style={{ padding: spacing.m }}>
          <Card>
            <Text style={{ fontWeight:'700' }}>Username</Text>
            <Text style={{ color: colors.muted, marginTop:6 }}>{(appState as any).getUsername ? (appState as any).getUsername() : 'Guest'}</Text>
          </Card>
          <Card>
            <Text style={{ fontWeight:'700' }}>Export / Import</Text>
            <View style={{ height: 8 }} />
            <Button title="Export" onPress={onExport} />
            <View style={{ height: 8 }} />
            <Button title="Import" onPress={onImport} />
          </Card>
          <Card>
            <Text style={{ fontWeight:'700' }}>Developer Options</Text>
            <View style={{ height: 8 }} />
            <Button 
              title="Reset Onboarding" 
              onPress={() => { 
                appState.setOnboarded(false); 
                setShowSplash(true);
                setRoute({ name: 'Onboarding' });
              }} 
            />
          </Card>
        </View>
        <TabBar />
      </SafeAreaView>
    );
  }

  // Settings merged into Profile

// --- Global Assessment Carousel ---
  if (route.name === 'GlobalAssessment') {
    const questions = [
      { k:'q1', label:'How many different things do you need to track at once?', tip:'1 = One simple thing at a time\n5 = Many complex layers and dependencies simultaneously' },
      { k:'q2', label:'How much new information appears per hour?', tip:'1 = Very little new information\n5 = Constant stream of new concepts, terms, and tools' },
      { k:'q3', label:'How quickly do you get feedback on your work?', tip:'1 = Instant feedback (immediately see results)\n5 = Delayed or indirect feedback (results come much later)' },
      { k:'q4', label:'How often does the approach change with different contexts?', tip:'1 = Same approach works everywhere\n5 = Very different approaches needed for different situations/tools/environments' },
      { k:'q5', label:'How serious are the consequences of mistakes?', tip:'1 = Easy to fix, minimal impact\n5 = Major consequences: loss of time, work, or important data' },
      { k:'q6', label:'How many different skill areas do you combine?', tip:'1 = Focused on one main area\n5 = Combining many areas (technical + analytical + creative + communication)' },
    ] as const;
  const clampedIndex = Math.min(Math.max(gaIndex, 0), questions.length - 1);
  const q = questions[clampedIndex];
    const commit = () => {
      // Save globally and mark onboarded
      const full = { ...ga, C: ga.q1+ga.q2+ga.q3+ga.q4+ga.q5+ga.q6, F: ga.q3, level_claim: 'F' as const };
      appState.setGlobalAssessment(full as any);
      appState.setOnboarded(true);
      setRoute({ name: 'Explore' });
    };
    return (
      <SafeAreaView style={{ flex:1, backgroundColor: colors.background }}>
      <Header title={`Assessment (${clampedIndex+1}/6)`} />
        <View style={{ padding: spacing.m }}>
          <Card>
            <Text style={{ fontWeight:'700', fontSize:18 }}>{q.label}</Text>
            <Text style={{ color: colors.muted, marginTop:6 }}>{q.tip}</Text>
            <View style={{ flexDirection:'row', gap:8, marginTop:12 }}>
              {[1,2,3,4,5].map(v => (
                <TouchableOpacity key={v} onPress={()=> setGAVal(q.k as any, v)} style={{ paddingVertical:10, paddingHorizontal:14, borderRadius:8, borderWidth:1, borderColor: (ga as any)[q.k]===v?colors.primary:colors.border, backgroundColor:(ga as any)[q.k]===v? colors.highlight: colors.card }}>
                  <Text style={{ color:(ga as any)[q.k]===v? colors.primary: colors.text }}>{v}</Text>
                </TouchableOpacity>
              ))}
            </View>
          <View style={{ marginTop:12 }}>
            <Button title="I'm not sure (pick 3)" onPress={()=> { setGAVal(q.k as any, 3); setGaIndex(i=> Math.min(questions.length-1, i+1)); }} />
          </View>
          </Card>
          <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
          <Button title="Back" onPress={()=> setGaIndex(i=> Math.max(0, i-1))} />
          {clampedIndex < questions.length-1 ? (
            <Button title="Next" onPress={()=> setGaIndex(i=> Math.min(questions.length-1, i+1))} />
            ) : (
              <Button title="Finish" onPress={commit} />
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // --- Show all skills in a selected category (when selectedCategory != null) ---
  if (selectedCategory) {
    const categorySkills = categoryMap[selectedCategory] || [];
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <Header title={selectedCategory} onBack={()=>setSelectedCategory(null)} />
        <View style={{ flex: 1, position: 'relative' }}>
        <ScrollView 
          contentContainerStyle={{ padding: spacing.m, paddingBottom: 96, rowGap: 12 }}
          removeClippedSubviews={false}
          style={{ overflow: 'hidden' }}
        >
          <Text style={{ fontWeight:'600', fontSize:18, marginBottom: 12 }}>{selectedCategory} Skills</Text>
          {categorySkills.length === 0 && (
            <Card><Text>No skills in this category yet.</Text></Card>
          )}
          {categorySkills.map(skill => (
            <TouchableOpacity key={skill.skill_id} onPress={()=>setRoute({ name: 'SkillDetail', skill })}>
              <Card>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>{skill.name}</Text>
                <Text style={{ color: colors.muted, marginTop: 4 }}>{skill.category} • {skill.subcategory}</Text>
                {/* badges or tags can go here */}
              </Card>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {/* Bottom fade mask - fades content under tab bar with smooth transition */}
        <LinearGradient
          pointerEvents="none"
          colors={['transparent', 'rgba(245,245,245,0.3)', 'rgba(245,245,245,0.6)', 'rgba(245,245,245,0.85)', 'rgba(245,245,245,1)']}
          start={{ x:0, y:0 }} end={{ x:0, y:1 }}
          style={{ 
            position: 'absolute', 
            left: 0, 
            right: 0, 
            bottom: 0, 
            height: 90,
            zIndex: 1 
          }}
        />
        <TabBar />
        </View>
      </SafeAreaView>
    );
  }

  if (route.name === "Assessment") {
    const skill = route.skill || assessmentState.skill;
    if (!skill) {
      return (
        <SafeAreaView style={{ flex:1, backgroundColor: colors.background }}>
          <Header title="Assessment" onBack={()=>setRoute({ name: 'Explore' })} />
          <View style={{ padding: spacing.m }}>
            <Card>
              <Text style={{ color: colors.muted }}>No skill selected. Please choose a skill first.</Text>
            </Card>
            <Button title="Back to Explore" onPress={() => setRoute({ name: 'Explore' })} />
          </View>
        </SafeAreaView>
      );
    }
    
    // Initialize assessment state when route changes - use direct check instead of useEffect
    if (route.skill && assessmentState.skill?.skill_id !== route.skill.skill_id) {
      const gaDefault = appState.getGlobalAssessment();
      const defaultA = gaDefault ?
        { q1:gaDefault.q1, q2:gaDefault.q2, q3:gaDefault.q3, q4:gaDefault.q4, q5:gaDefault.q5, q6:gaDefault.q6 } :
        { q1:3, q2:3, q3: skill?.F_preset ?? 3, q4:3, q5:3, q6:3 };
      setAssessmentState({ initial: true, a: defaultA, skill, questionIndex: 0 });
    }
    
    // Use global assessment defaults when available, otherwise sensible defaults/presets
    const gaDefault = appState.getGlobalAssessment();
    const defaultA = gaDefault ?
      { q1:gaDefault.q1, q2:gaDefault.q2, q3:gaDefault.q3, q4:gaDefault.q4, q5:gaDefault.q5, q6:gaDefault.q6 } :
      { q1:3, q2:3, q3: skill?.F_preset ?? 3, q4:3, q5:3, q6:3 };
    const a = assessmentState.a || defaultA;
    const questionIndex = assessmentState.questionIndex ?? 0;
    
    // Context-aware questions based on skill type and category
    const getContextualQuestions = () => {
      const skillType = skill.type || 'hard';
      const isLanguage = skill.expDomainKey === 'language';
      const isCoding = skill.category?.toLowerCase().includes('programming') || skill.category?.toLowerCase().includes('coding');
      const isDesign = skill.category?.toLowerCase().includes('design');
      
      return [
        {
          k: 'q1',
          label: isLanguage 
            ? `When learning ${skill.name}, how many grammar rules or vocabulary words do you need to remember at once?`
            : isCoding
            ? `When working with ${skill.name}, how many concepts, functions, or syntax rules do you need to keep in your mind simultaneously?`
            : isDesign
            ? `When creating with ${skill.name}, how many design principles, tools, and visual elements do you juggle at once?`
            : `When practicing ${skill.name}, how many different things do you need to track or remember at once?`,
          tip: '1 = One simple thing at a time\n5 = Many complex layers simultaneously',
          context: 'Think about a typical session where you work with this skill.'
        },
        {
          k: 'q2',
          label: isLanguage
            ? `How often do you encounter new ${skill.name} vocabulary, grammar structures, or expressions per hour of study?`
            : isCoding
            ? `How frequently do you discover new ${skill.name} methods, libraries, or best practices while learning?`
            : `How much new information about ${skill.name} appears during an hour of practice?`,
          tip: '1 = Very little new information\n5 = Constant stream of new concepts',
          context: 'Consider your typical learning pace.'
        },
        {
          k: 'q3',
          label: isLanguage
            ? `When practicing ${skill.name}, how quickly do you know if you used grammar or vocabulary correctly?`
            : isCoding
            ? `When writing ${skill.name} code, how fast do you see if it works correctly?`
            : `When working with ${skill.name}, how quickly do you get feedback on whether you're doing it right?`,
          tip: '1 = Instant feedback (immediately see results)\n5 = Delayed feedback (results come much later)',
          context: 'Think about how fast you know if you\'re on the right track.'
        },
        {
          k: 'q4',
          label: isLanguage
            ? `Does ${skill.name} usage change significantly in formal vs. casual settings, or different regions?`
            : isCoding
            ? `Does ${skill.name} require different approaches for different projects, frameworks, or team setups?`
            : `Does ${skill.name} require very different methods depending on the situation or context?`,
          tip: '1 = Same approach works everywhere\n5 = Very different approaches for different contexts',
          context: 'Consider how adaptable the skill needs to be.'
        },
        {
          k: 'q5',
          label: isLanguage
            ? `How serious are the consequences if you make mistakes when using ${skill.name}?`
            : isCoding
            ? `What happens if you make errors in ${skill.name} code?`
            : `How serious are mistakes when working with ${skill.name}?`,
          tip: '1 = Easy to fix, minimal impact\n5 = Major consequences: lost time, work, or data',
          context: 'Think about real-world impact of errors.'
        },
        {
          k: 'q6',
          label: isLanguage
            ? `Does learning ${skill.name} require combining speaking, listening, reading, writing, grammar, and vocabulary?`
            : isCoding
            ? `Does ${skill.name} require combining programming logic, problem-solving, tool knowledge, and system understanding?`
            : `Does ${skill.name} combine multiple different skill areas?`,
          tip: '1 = Focused on one main area\n5 = Combining many different skill types',
          context: 'Consider how interdisciplinary this skill is.'
        }
      ];
    };
    
    const questions = getContextualQuestions();
    const currentQ = questions[Math.min(questionIndex, questions.length - 1)];
    const setVal = (k:keyof typeof a, v:number)=> {
      const newA = {...a, [k]:v};
      setAssessmentState(prev=>({ ...prev, initial:false, a: newA, skill, questionIndex: prev.questionIndex }));
    };
    
    const minC = skill?.C_range ? skill.C_range[0] : 6;
    const maxC = skill?.C_range ? skill.C_range[1] : 30;
    const Cnum = Number(a.q1||0) + Number(a.q2||0) + Number(a.q3||0) + Number(a.q4||0) + Number(a.q5||0) + Number(a.q6||0);
    const isCValid = Cnum >= Math.max(6, minC) && Cnum <= Math.min(30, maxC);
    
    const onEstimate = () => {
      if (!isCValid) {
        Alert.alert("Check answers","Your total score (C = "+Cnum+") is outside the plausible range ["+minC+"–"+maxC+"]. Please review your answers.");
        return;
      }
      const { C, F } = estimator.calcSCI(a as any);
      const k = skill.k;
      const expDomain = skill.expDomainKey;
      const R_eff = 3; // default
      const E = 1.0;
      const L = estimator.estimateHours({ C, F, R_eff, E, k, expDomain, levelBias: "F" });
      store.addUserSkillFromAssessment(skill, a as any, L);
      setRoute({ name: "SkillDashboard", skillId: skill.skill_id });
      setAssessmentState({ initial: true, a: null, skill: null, questionIndex: 0 }); // reset
    };
    
    const currentValue = (a as any)[currentQ.k] || 3;
    
    return (
      <SafeAreaView style={{ flex:1, backgroundColor: colors.background }}>
        <Header title={`${skill.name} Assessment (${questionIndex + 1}/6)`} onBack={()=>{
          if (questionIndex > 0) {
            setAssessmentState(prev => ({ ...prev, questionIndex: prev.questionIndex - 1 }));
          } else {
            setAssessmentState({initial:true,a:null,skill:null,questionIndex:0});
            setRoute({name:"SkillDetail", skill});
          }
        }} />
        <ScrollView 
          contentContainerStyle={{ padding: spacing.m, paddingBottom: 40 }}
          removeClippedSubviews={false}
          style={{ overflow: 'hidden' }}
        >
          <Card>
            <Text style={{ fontWeight:'700', fontSize:18, marginBottom:8 }}>{currentQ.label}</Text>
            {currentQ.context && (
              <Text style={{ color: colors.primary, fontSize:13, fontStyle:'italic', marginBottom:8 }}>
                {currentQ.context}
              </Text>
            )}
            <Text style={{ color: colors.muted, marginTop:8, marginBottom:16, lineHeight:20 }}>{currentQ.tip}</Text>
            
            {/* Options with larger spacing */}
            <View style={{ flexDirection:'row', justifyContent:'space-between', gap:12, marginTop:12 }}>
              {[1,2,3,4,5].map(v => (
                <TouchableOpacity
                  key={v}
                  onPress={()=> setVal(currentQ.k as any, v)}
                  style={{
                    flex: 1,
                    paddingVertical:16,
                    paddingHorizontal:8,
                    borderRadius:12,
                    borderWidth:2,
                    borderColor: currentValue===v ? colors.primary : colors.border,
                    backgroundColor: currentValue===v ? colors.highlight : colors.card,
                    alignItems:'center',
                    minWidth: 50
                  }}
                >
                  <Text style={{ color:currentValue===v ? colors.primary : colors.text, fontWeight: currentValue===v ? '700' : '600', fontSize:18 }}>{v}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={{ marginTop:20 }}>
              <Button title="I'm not sure (pick 3)" onPress={()=> { setVal(currentQ.k as any, 3); if (questionIndex < questions.length - 1) setAssessmentState(prev => ({ ...prev, questionIndex: prev.questionIndex + 1 })); }} />
            </View>
          </Card>
          
          <View style={{ flexDirection:'row', justifyContent:'space-between', marginTop:16, gap:12 }}>
            <Button
              title="Back"
              onPress={()=> {
                if (questionIndex > 0) {
                  setAssessmentState(prev => ({ ...prev, questionIndex: prev.questionIndex - 1 }));
                }
              }}
            />
            {questionIndex < questions.length - 1 ? (
              <Button
                title="Next"
                onPress={()=> {
                  setAssessmentState(prev => ({ ...prev, questionIndex: prev.questionIndex + 1 }));
                }}
              />
            ) : (
              <Button title="Finish & Estimate" onPress={onEstimate} />
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (route.name === "Result") {
    const usId = route.userSkillId;
    const us = store.getUserSkill(usId);
    if (!us) return <SafeAreaView><Text>Not found.</Text></SafeAreaView>;
    const remaining = Math.max(us.estimates.L_hours - us.progress.logged_hours, 0);
    const eta1 = estimator.etaDays(remaining, 1);
    const eta2 = estimator.etaDays(remaining, 2);
    return (
      <SafeAreaView style={{ flex:1, backgroundColor: colors.background }}>
        <Header title="Estimate" onBack={()=>setRoute({name:"Search"})} />
        <View style={{ padding: spacing.m }}>
          <Card>
            <Text style={{ fontSize: 16, fontWeight: "700" }}>Estimated hours to Independent Level</Text>
            <Text style={{ marginTop: 6, fontSize: 28, fontWeight: "800" }}>{Math.round(us.estimates.L_hours)} h</Text>
            <Text style={{ color: colors.muted, marginTop: 6 }}>ETA: {eta1} days at 1h/day • {eta2} days at 2h/day</Text>
          </Card>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Button title="Start timer" onPress={()=>{ const now = Date.now(); setTimerState({ running: true, paused: false, start: now, accumSec: 0, lastActivity: now, skillId: us.skill_id }); transitionSessionFlow('in_progress', 'estimate-start'); Haptics.selectionAsync(); navigate({ name:"Timer", skillId: us.skill_id }); }} />
            <Button title="Go to dashboard" onPress={()=>navigate({ name:"SkillDashboard", skillId: us.skill_id })} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (route.name === "Timer") {
    if (!route.skillId) {
      // Hard-guard: Timer must always be opened with a skill
      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <Header title="Loading..." onBack={() => navigate({ name: 'Explore' })} />
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: colors.muted }}>Redirecting...</Text>
          </View>
        </SafeAreaView>
      );
    }
    const us = store.getUserSkillBySkillId(route.skillId);
    const { running, start } = timerState;
    const sid = us?.skill_id || timerState.skillId || route.skillId;
    function humanize(s:string){
      return s
        .replace(/[\/_-]+/g,' ')
        .replace(/\s+/g,' ')
        .trim()
        .replace(/\b\w/g, (c)=>c.toUpperCase());
    }
    const titleText = sid ? (skills.find(s=>s.skill_id===sid)?.name || humanize(sid)) : 'No skill selected';

    const stopAndPersistTimer = (navigateAfterStop: boolean) => {
      if (timerActionRef.current) return;
      timerActionRef.current = true;
      setIsTimerActionBusy(true);
      try {
        const now = Date.now();
        if (start) {
          const durMin = Math.max(1, Math.round((now - start)/60000));
          const sid2 = us?.skill_id || timerState.skillId || route.skillId;
          completeSessionForSkill(sid2, durMin, false);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        const finalSkillId = us?.skill_id || timerState.skillId || route.skillId;
        setTimerState({ running: false, paused: false, start: null, accumSec: 0, lastActivity: null, skillId: finalSkillId });
        if (navigateAfterStop && finalSkillId) {
          navigate({ name:'SkillDashboard', skillId: finalSkillId });
        }
      } finally {
        timerActionRef.current = false;
        setIsTimerActionBusy(false);
      }
    };

    // always reference timerState, update only with setTimerState
    const toggle = () => {
      if (timerActionRef.current) return;
      console.log('[Timer] ===== TOGGLE BUTTON PRESSED =====');
      console.log('[Timer] Current sid:', sid);
      console.log('[Timer] Current running:', running);
      console.log('[Timer] Current timerState:', JSON.stringify(timerState));
      if (!sid) {
        console.log('[Timer] ❌ No skill ID, cannot toggle');
        return;
      }
      if (!running) {
        timerActionRef.current = true;
        setIsTimerActionBusy(true);
        console.log('[Timer] Starting timer...');
        const now = Date.now();
        const sid2 = us?.skill_id || timerState.skillId || route.skillId;
        console.log('[Timer] Setting timerState to running with skill:', sid2);
        setTimerState({ running: true, paused: false, start: now, accumSec: timerState.accumSec, lastActivity: now, skillId: sid2 });
        transitionSessionFlow('in_progress', 'timer-start');
        Haptics.selectionAsync();
        timerActionRef.current = false;
        setIsTimerActionBusy(false);
      } else {
        stopAndPersistTimer(true);
      }
    };
    return (
      <SafeAreaView style={{ flex:1, backgroundColor: colors.background }}>
        <Header title="Timer" onBack={()=>{
          if (timerState.running) {
            Alert.alert('Timer Running','Stop the timer before going back?',[
              { text:'Cancel', style:'cancel' },
              { text:'Stop Timer', onPress:()=>{ stopAndPersistTimer(false); setRoute({name:'Explore'}); } }
            ]);
          } else {
            setRoute({name:'Explore'});
          }
        }} />
        <View style={{ padding: spacing.m, gap: 12 }}>
          <Card><Text style={{ fontWeight:"600" }} numberOfLines={1} ellipsizeMode="tail">{titleText}</Text></Card>
          <View style={{ alignItems: 'center', marginVertical: 12 }}>
            <Text style={{ fontSize: 32, fontWeight: 'bold', letterSpacing: 1 }}>
              {formatTime(displayTime)}
            </Text>
          </View>
          <Button title={running ? "Stop" : "Start"} onPress={toggle} disabled={isTimerActionBusy} loading={isTimerActionBusy} />
          <Button title="Dashboard" onPress={()=>{ const sid = us?.skill_id || timerState.skillId || route.skillId; if (sid) { transitionSessionFlow('next_recommended', 'timer-dashboard'); setRoute({ name:"SkillDashboard", skillId: sid }); } }} />
        </View>
        <Modal visible={afkModal.visible} transparent animationType="fade">
          <View style={{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'rgba(0,0,0,0.2)'}}>
            <View style={{backgroundColor:'white',borderRadius:14,padding:24,alignItems:'center',width: modalWidth}}>
              <Text style={{fontWeight:'700',fontSize:18,marginBottom:16}}>Still there?</Text>
              <Text style={{color:colors.muted,marginBottom:22}}>No activity detected for 30 minutes.</Text>
              <View style={{flexDirection:'row',gap:16}}>
                <Button title="Continue" onPress={()=>{lastUserActivityRef.current = Date.now();setAfkModal({ visible: false, timeout: null });const t = afkTimeoutRef.current;if (t != null) clearTimeout(t);afkTimeoutRef.current = null;Haptics.selectionAsync();}}/>
                <Button title="Stop Timer" onPress={()=>{setAfkModal({ visible: false, timeout: null });const t = afkTimeoutRef.current;if (t != null) clearTimeout(t);afkTimeoutRef.current = null;stopAndPersistTimer(true);}} disabled={isTimerActionBusy} loading={isTimerActionBusy}/>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  if (route.name === "Quiz") {
    const { quiz, answers, current, finished } = quizState;
    if (!quiz) return <SafeAreaView><Header title="Quiz" onBack={()=>setRoute({name:"SkillDashboard",skillId:route.skillId})}/><Text>Quiz not found.</Text></SafeAreaView>;
    const quizData = quiz;
    const numItems = quizData.items.length;
    const passMark = quizData.pass_mark || 0.7;

    function selectOption(qid: string, kid: string) {
      setQuizState(s => ({ ...s, answers: { ...s.answers, [qid]: kid } }));
      transitionSessionFlow('step_completed', 'quiz-option-selected');
    }
    function next() {
      if (current+1 < numItems) setQuizState(s => ({ ...s, current: s.current+1 }));
      else setQuizState(s => ({ ...s, finished: true }));
    }
    function restartQuiz() {
      setQuizState(s => ({ ...s, answers: {}, current: 0, finished: false }));
    }

    // Scoring
    function computeScore() {
      let correct = 0;
      for (const q of quizData.items) {
        const ans = answers[q.id];
        if (!ans) continue;
        if (q.type === "mcq_single") correct += q.options.find(o => o.k===ans && o.correct) ? 1 : 0;
        if (q.type === "true_false") correct += q.options.find(o => o.k===ans && o.correct) ? 1 : 0;
      }
      return { correct, total: numItems, percent: correct/numItems };
    }

    // quiz completion side-effects handled by top-level useEffect

    if (finished) {
      const { correct, total, percent } = computeScore();
      const passed = percent >= passMark;
      return (
        <SafeAreaView style={{ flex:1, backgroundColor: colors.background }}>
          <Header title="Quiz Result" onBack={()=>setRoute({name:"SkillDashboard", skillId: quizData.skill_id})}/>
          <View style={{ padding: spacing.m }}>
            <Card>
              <Text style={{fontWeight:"700",fontSize:18}}>{passed ? "Passed F-Level!" : "Not passed"}</Text>
              <Text style={{marginTop:8}}>{correct} out of {total} correct ({Math.round(percent*100)}%)</Text>
            </Card>
            <Button title="Retry Quiz" onPress={restartQuiz}/>
            <Button title="Back to Dashboard" onPress={()=>setRoute({name:"SkillDashboard", skillId: quizData.skill_id})} />
          </View>
        </SafeAreaView>
      );
    }
    // Show current question
    const q = quizData.items[current];
    return (
      <SafeAreaView style={{ flex:1, backgroundColor: colors.background }}>
        <Header title={`Quiz (${current+1} of ${numItems})`} onBack={()=>setRoute({name:"SkillDashboard", skillId: quizData.skill_id})} />
        <View style={{padding:spacing.m}}>
          <Card>
            <Text style={{fontWeight:"700",marginBottom:6}}>{q.stem}</Text>
            {q.options.map((opt: QuizItemOption) => (
              <TouchableOpacity key={opt.k}
                style={{borderWidth:1,borderColor:answers[q.id]===opt.k?colors.primary:colors.border,borderRadius:8,padding:12,marginVertical:4,backgroundColor:answers[q.id]===opt.k?colors.highlight:colors.card}}
                onPress={()=>selectOption(q.id, opt.k)}>
                <Text style={{color:answers[q.id]===opt.k?colors.primary:colors.text}}>{opt.text}</Text>
              </TouchableOpacity>
            ))}
          </Card>
          <Button title={current+1 === numItems ? "Finish Quiz" : "Next"} onPress={next} />
        </View>
      </SafeAreaView>
    );
  }

  if (route.name === "SkillDashboard") {
    const us = store.getUserSkillBySkillId(route.skillId);
    if (!us) {
      return (
        <SafeAreaView style={{ flex:1, backgroundColor: colors.background }}>
          <Header title="Dashboard" />
          <View style={{ padding: spacing.m, gap: 12 }}>
            <Card>
              <Text style={{ fontWeight:'700' }}>No data yet</Text>
              <Text style={{ color: colors.muted, marginTop:6 }}>Start a timer from any skill to see your progress here.</Text>
            </Card>
            <Button title="Go to Home" onPress={()=>setRoute({ name:'Explore' })} />
          </View>
          <TabBar />
        </SafeAreaView>
      );
    }
    const remaining = Math.max(us.estimates.L_hours - us.progress.logged_hours, 0);
    const pct = Math.min(100, Math.round((us.progress.logged_hours / Math.max(us.estimates.L_hours,1))*100));
    const skillId = us.skill_id;
    const quizMod = quizMap[skillId] || null;
    const fLevelPassed = us.f_level_passed === true;
    const SHORT_SESSION_MINUTES = 10;
    const allSessions = store.getSessionsForSkill(skillId) || [];
    // Weekly hours (last 7 days)
    const now = Date.now();
    const weekStart = now - 7*24*60*60*1000;
    const weekMinutes = allSessions.reduce((sum, s) => {
      const start = new Date(s.start_ts).getTime();
      return start >= weekStart ? sum + (s.duration_min || 0) : sum;
    }, 0);
    const weekHours = Math.round((weekMinutes/60)*10)/10;
    const shortSessions = allSessions.filter(s => s.duration_min < SHORT_SESSION_MINUTES);
    const shortSessionCount = shortSessions.length;
    const shortSessionTotal = shortSessions.reduce((sum, s) => sum + s.duration_min, 0);
    
    // Get feedback score for this week
    const weekEnd = now;
    const skill = skills.find(s => s.skill_id === skillId);
    const benchmarkType = skill?.benchmarkType || 'quantitative';
    const feedbackScore = allSessions.length > 0 
      ? getFeedbackForSkill(allSessions, weekStart, weekEnd, benchmarkType)
      : null;
    
    // Generate personalized tips based on feedback
    const getPersonalizedTips = () => {
      if (!feedbackScore) return "More sessions per week, faster feedback, and regularity.";
      const { metrics, comment, feedback_score } = feedbackScore;
      
      const tips: string[] = [];
      if (metrics.frequency < 3) {
        tips.push(`Aim for ${benchmarkType === 'balance' ? 'daily' : '3-5'} sessions per week`);
      }
      if (metrics.focus_score < 3.5) {
        tips.push("Improve focus during practice");
      }
      if (metrics.satisfaction < 3.5) {
        tips.push("Adjust practice methods for better engagement");
      }
      if (benchmarkType === 'balance' && Math.abs(metrics.energy_state - 3.5) > 1) {
        tips.push("Balance your energy for sustainable practice");
      }
      if (tips.length === 0) {
        return comment || "You're doing great! Maintain your consistency.";
      }
      return tips.join(" • ");
    };
    
    return (
      <SafeAreaView style={{ flex:1, backgroundColor: colors.background }}>
        <Header title={skills.find(s=>s.skill_id===us.skill_id)?.name || 'Dashboard'} onBack={()=>setRoute({name:"Explore"})} />
        <View style={{ padding: spacing.m, gap: 12 }}>
          <Card style={{ backgroundColor: colors.surfaceSoft }}>
            <Text style={{ fontWeight: "700" }}>Session State</Text>
            <Text style={{ marginTop: 6, color: colors.text }}>{flowLabel[sessionFlowState]}</Text>
            <Text style={{ marginTop: 4, color: colors.muted, fontSize: 12 }}>{flowNextHint[sessionFlowState]}</Text>
          </Card>
          <Card>
            <Text style={{ fontWeight:"700" }}>Progress</Text>
            <View style={{ height: 12 }} />
            <EnhancedProgressBar percent={pct} />
            <Text style={{ marginTop: 8, color: colors.muted }}>{us.progress.logged_hours.toFixed(1)} h / {Math.round(us.estimates.L_hours)} h • {pct}%</Text>
          </Card>
          {shortSessionCount > 0 && (
            <Card>
              <Text style={{ fontWeight: "700" }}>Short Sessions</Text>
              <View style={{marginTop:6}}>
                {shortSessions.map((s, i) => (
                  <View key={i} style={{flexDirection:'row',alignItems:'center',marginBottom:4}}>
                    <Text style={{fontSize:14}}>{Math.round(s.duration_min)} min</Text>
                    {s.is_historic && <HistoricBadge />}
                    {s.notes ? <Text style={{color:colors.muted,fontSize:12,marginLeft:8}}>{s.notes}</Text> : null}
                  </View>
                ))}
                <Text style={{marginTop:6,color:colors.muted,fontSize:13}}>
                  {shortSessionCount} short sessions, {shortSessionTotal} min
                </Text>
              </View>
            </Card>
          )}
          <Card>
            <Text style={{ fontWeight: "700" }}>This Week</Text>
            <Text style={{ marginTop:6, fontSize: 20, fontWeight:'800' }}>{weekHours} h</Text>
            <Text style={{ color: colors.muted, marginTop: 4 }}>Total practice time in the last 7 days</Text>
            {feedbackScore && (
              <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={{ color: colors.muted, fontSize: 13 }}>Practice Quality</Text>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: feedbackScore.feedback_score >= 0.7 ? colors.success : feedbackScore.feedback_score >= 0.5 ? colors.primary : colors.accent }}>
                    {Math.round(feedbackScore.feedback_score * 100)}%
                  </Text>
                </View>
                <Text style={{ color: colors.muted, fontSize: 12, fontStyle: 'italic' }}>
                  {feedbackScore.comment}
                </Text>
                <View style={{ marginTop: 6, flexDirection: 'row', gap: 12 }}>
                  <Text style={{ color: colors.muted, fontSize: 11 }}>{feedbackScore.metrics.frequency} sessions</Text>
                  <Text style={{ color: colors.muted, fontSize: 11 }}>Focus: {feedbackScore.metrics.focus_score.toFixed(1)}/5</Text>
                  <Text style={{ color: colors.muted, fontSize: 11 }}>Satisfaction: {feedbackScore.metrics.satisfaction.toFixed(1)}/5</Text>
                </View>
              </View>
            )}
          </Card>
          {allSessions.length === 0 && (
            <Card>
              <Text style={{color:colors.muted}}>No sessions yet! Start a timer or log your first session.</Text>
            </Card>
          )}
          <Card>
            <Text style={{ fontWeight:"700" }}>What speeds you up?</Text>
            <Text style={{ marginTop: 6, color: colors.muted }}>{getPersonalizedTips()}</Text>
          </Card>
          {quizMod && !fLevelPassed && (
            <Button title="Take F-Level Quiz" onPress={()=>{ setQuizState({ skillId, quiz: quizMod, answers: {}, current: 0, finished: false }); setRoute({ name: "Quiz", skillId }); }} />
          )}
          <Card>
            <Text style={{ fontWeight: '700', marginBottom: 8 }}>Session History</Text>
            {allSessions.length === 0 ? (
              <Text style={{ color: colors.muted }}>No sessions yet. Start the timer!</Text>
            ) : (
              allSessions.slice(0, 10).map((s, i) => (
                <View key={i} style={{ paddingVertical: 8, borderBottomWidth: i < Math.min(9, allSessions.length-1) ? 1 : 0, borderColor: colors.border }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems:'center' }}>
                    <View>
                      <Text style={{ fontWeight: '600' }}>{Math.round(s.duration_min)} min</Text>
                      <Text style={{ color: colors.muted, fontSize: 12 }}>{new Date(s.start_ts).toLocaleDateString()}</Text>
                    </View>
                    <View style={{ flexDirection:'row', gap: 8 }}>
                      <TouchableOpacity onPress={()=>{
                        setEditSession({ open:true, sessionId: s.session_id, duration: String(Math.round(s.duration_min)), notes: s.notes || '', historic: !!s.is_historic });
                      }}>
                        <Text style={{ color: colors.link }}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={()=>{
                        Alert.alert('Delete session?','This cannot be undone.',[
                          { text:'Cancel', style:'cancel' },
                          { text:'Delete', style:'destructive', onPress:()=>{ (store as any).deleteSession?.(s.session_id); setRoute({ name:'SkillDashboard', skillId }); } }
                        ]);
                      }}>
                        <Text style={{ color: colors.accent }}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  {s.is_historic && <HistoricBadge />}
                  {s.notes ? <Text style={{ color: colors.muted, fontSize: 13, marginTop: 2 }}>{s.notes}</Text> : null}
                </View>
              ))
            )}
          </Card>
          <Button title="Log Session Manually" onPress={() => setManualSession({ open: true, duration: '', notes: '', historic: false })} />
        </View>
        <Modal visible={manualSession.open} transparent animationType="slide">
          <View style={{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.15)' }}>
            <View style={{ backgroundColor:'white', borderRadius:12, padding:24, width: modalWidth }}>
              <Text style={{fontWeight:'700', fontSize:18, marginBottom:12}}>Log Session</Text>
              <Text>Duration (minutes):</Text>
              <TextInput 
                value={manualSession.duration} 
                onChangeText={v=>{
                  console.log('[Input] Manual Session Duration - Changed:', v);
                  setManualSession(s=>({...s, duration:v}));
                }} 
                keyboardType="numeric" 
                style={{borderWidth:1,borderColor:colors.border,borderRadius:8,padding:8,marginBottom:8}} 
                placeholder="e.g. 25" 
              />
              <Text>Notes (optional):</Text>
              <TextInput 
                value={manualSession.notes} 
                onChangeText={v=>{
                  console.log('[Input] Manual Session Notes - Changed:', v.length, 'chars');
                  setManualSession(s=>({...s, notes:v}));
                }} 
                style={{borderWidth:1,borderColor:colors.border,borderRadius:8,padding:8,marginBottom:8}} 
                placeholder="Notes..." 
              />
              <View style={{flexDirection:'row', alignItems:'center', marginBottom:12}}>
                <Switch value={manualSession.historic} onValueChange={v=>setManualSession(s=>({...s, historic:v}))}/>
                <Text>  Historic session?</Text>
              </View>
              <View style={{flexDirection:'row', gap:16, justifyContent:'flex-end'}}>
                <Button title="Cancel" onPress={()=>setManualSession({ open: false, duration: '', notes: '', historic: false })} disabled={isManualSessionSaving} />
                <Button title="Add" onPress={()=> {
                  if (isManualSessionSaving) return;
                  setIsManualSessionSaving(true);
                  const min = parseInt(manualSession.duration);
                  if (isNaN(min) || min <= 0) { Alert.alert('Please enter a valid duration'); setIsManualSessionSaving(false); return; }
                  completeSessionForSkill(route.skillId, min, false, manualSession.notes || '', manualSession.historic);
                  setManualSession({ open: false, duration: '', notes: '', historic: false });
                  setIsManualSessionSaving(false);
                }} disabled={isManualSessionSaving} loading={isManualSessionSaving} />
              </View>
            </View>
          </View>
        </Modal>
      {/* Edit Session Modal */}
      <Modal visible={editSession.open} transparent animationType="slide">
        <View style={{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.15)' }}>
          <View style={{ backgroundColor:'white', borderRadius:12, padding:24, width: modalWidth }}>
            <Text style={{fontWeight:'700', fontSize:18, marginBottom:12}}>Edit Session</Text>
            <Text>Duration (minutes):</Text>
            <TextInput 
              value={editSession.duration} 
              onChangeText={v=>{
                console.log('[Input] Edit Session Duration - Changed:', v);
                setEditSession(s=>({...s, duration:v}));
              }} 
              keyboardType="numeric" 
              style={{borderWidth:1,borderColor:colors.border,borderRadius:8,padding:8,marginBottom:8}} 
              placeholder="e.g. 25" 
            />
            <Text>Notes (optional):</Text>
            <TextInput 
              value={editSession.notes} 
              onChangeText={v=>{
                console.log('[Input] Edit Session Notes - Changed:', v.length, 'chars');
                setEditSession(s=>({...s, notes:v}));
              }} 
              style={{borderWidth:1,borderColor:colors.border,borderRadius:8,padding:8,marginBottom:8}} 
              placeholder="Notes..." 
            />
            <View style={{flexDirection:'row', alignItems:'center', marginBottom:12}}>
              <Switch value={editSession.historic} onValueChange={v=>setEditSession(s=>({...s, historic:v}))}/>
              <Text>  Historic session?</Text>
            </View>
            <View style={{flexDirection:'row', gap:16, justifyContent:'flex-end'}}>
              <Button title="Cancel" onPress={()=>setEditSession({ open: false, sessionId: undefined, duration: '', notes: '', historic: false })} disabled={isEditSessionSaving} />
              <Button title="Save" onPress={()=> {
                if (isEditSessionSaving) return;
                setIsEditSessionSaving(true);
                const min = parseInt(editSession.duration);
                if (!editSession.sessionId) { setEditSession({ open:false, sessionId: undefined, duration:'', notes:'', historic:false }); setIsEditSessionSaving(false); return; }
                if (isNaN(min) || min <= 0) { Alert.alert('Please enter a valid duration'); setIsEditSessionSaving(false); return; }
                (store as any).updateSession?.(editSession.sessionId, { duration_min: min, notes: editSession.notes || undefined, is_historic: editSession.historic });
                setEditSession({ open: false, sessionId: undefined, duration: '', notes: '', historic: false });
                setRoute({ name:'SkillDashboard', skillId });
                setIsEditSessionSaving(false);
              }} disabled={isEditSessionSaving} loading={isEditSessionSaving} />
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Skip Level Modal */}
      <Modal visible={skipLevelModal.open} transparent animationType="slide">
        <View style={{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.15)' }}>
          <View style={{ backgroundColor:'white', borderRadius:12, padding:24, width: modalWidth, maxHeight:'80%' }}>
            {/* Quiz Mode */}
            {skipLevelModal.selectedLevel && skipLevelQuiz.questions.length > 0 ? (
              <ScrollView>
                <Text style={{fontWeight:'700', fontSize:18, marginBottom:12}}>
                  Level Check: {skipLevelModal.selectedLevel === 'intermediate' ? 'Intermediate' : 'Expert'}
                </Text>
                <Text style={{ marginBottom:16, color: colors.muted, fontSize: 13 }}>
                  Answer 7 out of 10 questions correctly to skip to this level.
                </Text>
                {skipLevelQuiz.current < skipLevelQuiz.questions.length ? (
                  <>
                    <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 8 }}>
                      Question {skipLevelQuiz.current + 1} of {skipLevelQuiz.questions.length}
                    </Text>
                    {(() => {
                      const q = skipLevelQuiz.questions[skipLevelQuiz.current];
                      return (
                        <View>
                          <Text style={{ fontWeight:'600', marginBottom:12, fontSize:16 }}>{q.stem}</Text>
                          <View style={{ gap: 8 }}>
                            {q.options?.map((opt: any) => (
                              <TouchableOpacity
                                key={opt.k}
                                onPress={() => {
                                  setSkipLevelQuiz(prev => ({
                                    ...prev,
                                    answers: { ...prev.answers, [prev.current]: opt.k }
                                  }));
                                }}
                                style={{
                                  padding: 12,
                                  borderRadius: 8,
                                  borderWidth: 1,
                                  borderColor: skipLevelQuiz.answers[skipLevelQuiz.current] === opt.k ? colors.primary : colors.border,
                                  backgroundColor: skipLevelQuiz.answers[skipLevelQuiz.current] === opt.k ? colors.highlight : colors.card
                                }}
                              >
                                <Text style={{ color: skipLevelQuiz.answers[skipLevelQuiz.current] === opt.k ? colors.primary : colors.text }}>
                                  {opt.k}. {opt.text}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                          <View style={{ flexDirection:'row', gap:12, marginTop:16 }}>
                            {skipLevelQuiz.current > 0 && (
                              <Button title="Previous" onPress={() => setSkipLevelQuiz(prev => ({ ...prev, current: prev.current - 1 }))} />
                            )}
                            <View style={{ flex: 1 }} />
                            <Button 
                              title={skipLevelQuiz.current === skipLevelQuiz.questions.length - 1 ? "Submit" : "Next"} 
                              onPress={() => {
                                if (skipLevelQuiz.current === skipLevelQuiz.questions.length - 1) {
                                  handleSkipLevelQuizSubmit();
                                } else {
                                  setSkipLevelQuiz(prev => ({ ...prev, current: prev.current + 1 }));
                                }
                              }}
                            />
                          </View>
                        </View>
                      );
                    })()}
                  </>
                ) : null}
                <Button 
                  title="Cancel" 
                  onPress={() => {
                    setSkipLevelModal({ open: false, skill: null, selectedLevel: null });
                    setSkipLevelQuiz({ questions: [], current: 0, answers: {}, finished: false });
                  }} 
                />
              </ScrollView>
            ) : (
              /* Level Selection Mode */
              <>
                <Text style={{fontWeight:'700', fontSize:18, marginBottom:12}}>
                  Skip to Level
                </Text>
                {skipLevelModal.skill && (
                  <>
                    <Text style={{ marginBottom:16, color: colors.muted }}>
                      Already have experience with {skipLevelModal.skill.name}? Set your starting level:
                    </Text>
                    <View style={{ gap: 12, marginBottom: 16 }}>
                      <Button 
                        title="Intermediate (~50% progress)" 
                        onPress={() => handleSkipLevel(skipLevelModal.skill!, 'intermediate')} 
                      />
                      <Button 
                        title="Expert (~85% progress)" 
                        onPress={() => handleSkipLevel(skipLevelModal.skill!, 'expert')} 
                      />
                    </View>
                    <Button 
                      title="Cancel" 
                      onPress={() => setSkipLevelModal({ open: false, skill: null, selectedLevel: null })} 
                    />
                  </>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
      </SafeAreaView>
    );
  }

  return null;
}
