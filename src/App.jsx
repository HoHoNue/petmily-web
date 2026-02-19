import React, { useState, useEffect, useRef, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  addDoc,
  setDoc,
  getDoc,
  deleteDoc,
  arrayUnion, 
  arrayRemove, 
  serverTimestamp,
  query
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  setPersistence,
  browserLocalPersistence,
  signInWithCustomToken
} from 'firebase/auth';
import { 
  Home, 
  Search, 
  PlusSquare, 
  User, 
  PawPrint, 
  Image as ImageIcon,
  Upload,
  LogOut,
  ArrowLeft,
  Trophy,
  MessageSquare,
  MessageCircle,
  Send, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Sparkles, 
  X, 
  AlertTriangle,
  Loader2,
  LogIn,
  ShoppingBag,
  ShoppingBasket,
  Timer,
  Check,
  Zap,
  History,
  CreditCard,
  Truck,
  MapPin,
  RotateCcw,
  AlertCircle,
  Smile,
  Palette,
  Undo2,
  ChevronRight,
  Phone,
  User as UserIcon,
  ClipboardList
} from 'lucide-react';

// --- [전문가/QA] 1. 전역 설정 및 고정 데이터 ---

const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : {
      apiKey: "AIzaSyAfu0ZuAQCI2FMnD0kR8221DZXjrcl-P2c",
      authDomain: "petmily-jhkim.firebaseapp.com",
      projectId: "petmily-jhkim",
      storageBucket: "petmily-jhkim.firebasestorage.app",
      messagingSenderId: "346277353781",
      appId: "1:346277353781:web:31b2c0db0e7e29c792947c",
    };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// [FIX] 경로 오류 방지를 위해 appId 정제 및 통일
const rawAppId = typeof __app_id !== 'undefined' ? __app_id : 'petmily-v25-stable';
const appId = rawAppId.replace(/\//g, '_'); 

const DEFAULT_PROFILE = { nickname: '', pets: [], following: [], profilePic: '' };

const PET_TYPES = [
  { id: 'all', label: '전체', icon: <Sparkles size={14}/> },
  { id: '강아지', label: '강아지' },
  { id: '고양이', label: '고양이' },
  { id: '새', label: '새' },
  { id: '햄스터', label: '햄스터' },
  { id: '기타', label: '기타' },
];

const PHOTO_FILTERS = [
  { name: '원본', class: '' },
  { name: '감성', class: 'sepia(0.4) contrast(1.1) brightness(1.1)' },
  { name: '느와르', class: 'grayscale(1) contrast(1.2)' },
  { name: '선셋', class: 'sepia(0.5) hue-rotate(-30deg) saturate(1.4)' },
  { name: '시원한', class: 'contrast(1.1) brightness(1.1) hue-rotate(180deg) saturate(0.8)' },
  { name: '비비드', class: 'saturate(1.8) contrast(1.1)' },
];

const STICKERS = [
  { id: 'sb1', type: 'bubble', content: '간식 줘!', emoji: '🍖' },
  { id: 'sb2', type: 'bubble', content: '산책 가자!', emoji: '🌳' },
  { id: 'sb3', type: 'bubble', content: '나 예뻐?', emoji: '💖' },
  { id: 'sb4', type: 'bubble', content: '츄르 내놔!', emoji: '🐟' },
  { id: 's1', type: 'deco', content: '👑' },
  { id: 's2', type: 'deco', content: '🕶️' },
  { id: 's3', type: 'deco', content: '✨' },
  { id: 's4', type: 'deco', content: '💝' },
];

const INITIAL_DUMMY_POSTS = [
  { id: 'd1', authorId: 'u1', authorName: '산책대장', imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800', caption: '우리 뽀삐 윙크 발사! 😉', likes: Array(145).fill('u'), petType: '강아지', createdAt: { seconds: Date.now()/1000 - 86400 * 1 } },
  { id: 'd2', authorId: 'u2', authorName: '박스냥이', imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800', caption: '상자만 보면 환장하는 우리 애기.. 🐾', likes: Array(172).fill('u'), petType: '고양이', createdAt: { seconds: Date.now()/1000 - 86400 * 2 } },
  { id: 'd3', authorId: 'u3', authorName: '달리기왕', imageUrl: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=800', caption: '오늘도 5km 완주했습니다! 🐕💨', likes: Array(164).fill('u'), petType: '강아지', createdAt: { seconds: Date.now()/1000 - 86400 * 3 } },
  { id: 'd4', authorId: 'u4', authorName: '해바라기', imageUrl: 'https://images.unsplash.com/photo-1509564323148-35cc78546b48?w=800', caption: '해바라기씨 꽉꽉 채웠어요 🐹', likes: Array(42).fill('u'), petType: '햄스터', createdAt: { seconds: Date.now()/1000 - 86400 * 4 } },
  { id: 'd5', authorId: 'u5', authorName: '앵무박사', imageUrl: 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=800', caption: '안녕하세요! 말 가르치는 중이에요.', likes: Array(131).fill('u'), petType: '새', createdAt: { seconds: Date.now()/1000 - 86400 * 5 } },
  { id: 'd6', authorId: 'u6', authorName: '절미맘', imageUrl: 'https://images.unsplash.com/photo-1530281739849-51dd3ad7f3cf?w=800', caption: '인절미가 따로 없네요 정말ㅋㅋ', likes: Array(128).fill('u'), petType: '강아지', createdAt: { seconds: Date.now()/1000 - 86400 * 6 } },
  { id: 'd7', authorId: 'u7', authorName: '치즈식빵', imageUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800', caption: '햇빛 아래서 낮잠 자는게 제일 좋아.', likes: Array(55).fill('u'), petType: '고양이', createdAt: { seconds: Date.now()/1000 - 86400 * 7 } },
  { id: 'd8', authorId: 'u8', authorName: '불독파파', imageUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=800', caption: '표정이 왜 그래? 간식 줄까?', likes: Array(39).fill('u'), petType: '강아지', createdAt: { seconds: Date.now()/1000 - 86400 * 8 } },
  { id: 'd9', authorId: 'u9', authorName: '솜사탕', imageUrl: 'https://images.unsplash.com/photo-1591160674255-fc8b9f70d515?w=800', caption: '구름이 걸어다니는 중입니다 ☁️', likes: Array(288).fill('u'), petType: '강아지', createdAt: { seconds: Date.now()/1000 - 86400 * 9 } },
  { id: 'd10', authorId: 'u10', authorName: '시바랜드', imageUrl: 'https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?w=800', caption: '볼살 만지실 분 구함 (1/100)', likes: Array(161).fill('u'), petType: '강아지', createdAt: { seconds: Date.now()/1000 - 86400 * 10 } },
  { id: 'd11', authorId: 'u11', authorName: '눈보라', imageUrl: 'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=800', caption: '오늘 첫 눈 구경했어요!', likes: Array(85).fill('u'), petType: '강아지', createdAt: { seconds: Date.now()/1000 - 86400 * 11 } },
  { id: 'd12', authorId: 'u12', authorName: '우주집사', imageUrl: 'https://images.unsplash.com/photo-1511044568932-338cba0ad803?w=800', caption: '우주를 담은 눈동자 ✨', likes: Array(92).fill('u'), petType: '고양이', createdAt: { seconds: Date.now()/1000 - 86400 * 12 } },
  { id: 'd13', authorId: 'u13', authorName: '토끼댁', imageUrl: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=800', caption: '코 씰룩씰룩 하는 것 좀 보세요.', likes: Array(33).fill('u'), petType: '기타', createdAt: { seconds: Date.now()/1000 - 86400 * 13 } },
  { id: 'd14', authorId: 'u14', authorName: '도치아빠', imageUrl: 'https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?w=800', caption: '밤송이가 아니라 우리 공주님입니다.', likes: Array(22).fill('u'), petType: '기타', createdAt: { seconds: Date.now()/1000 - 86400 * 14 } },
  { id: 'd15', authorId: 'u15', authorName: '웰시마니아', imageUrl: 'https://images.unsplash.com/photo-1519098901909-b1553a1190af?w=800', caption: '식빵 굽는 엉덩이가 매력 포인트 🍞', likes: Array(110).fill('u'), petType: '강아지', createdAt: { seconds: Date.now()/1000 - 86400 * 15 } },
  { id: 'd16', authorId: 'u16', authorName: '포근이', imageUrl: 'https://images.unsplash.com/photo-1491485880348-85d48a9e5312?w=800', caption: '이불 속이 제일 따뜻하고 좋아요..', likes: Array(98).fill('u'), petType: '고양이', createdAt: { seconds: Date.now()/1000 - 86400 * 16 } },
  { id: 'd17', authorId: 'u17', authorName: '캠핑댕댕', imageUrl: 'https://images.unsplash.com/photo-1523626797181-8c5ae80d40c2?w=800', caption: '캠핑 와서 신난 우리 강쥐! 🏕️', likes: Array(77).fill('u'), petType: '강아지', createdAt: { seconds: Date.now()/1000 - 86400 * 17 } },
  { id: 'd18', authorId: 'u18', authorName: '버틀러J', imageUrl: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=800', caption: '리트리버의 아침 인사.', likes: Array(142).fill('u'), petType: '강아지', createdAt: { seconds: Date.now()/1000 - 86400 * 18 } },
  { id: 'd19', authorId: 'u19', authorName: '나비엄마', imageUrl: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=800', caption: '창밖 구경하는 뒷태가 치명적..', likes: Array(65).fill('u'), petType: '고양이', createdAt: { seconds: Date.now()/1000 - 86400 * 19 } },
  { id: 'd20', authorId: 'u20', authorName: '요정집사', imageUrl: 'https://images.unsplash.com/photo-1444464666168-49d633b867ad?w=800', caption: '어깨 위에 앉은 작은 천사입니다. 🐦', likes: Array(167).fill('u'), petType: '새', createdAt: { seconds: Date.now()/1000 - 86400 * 20 } },
];

const INITIAL_DEALS = [
  { id: 'g1', title: '국내산 수제 연어 져키 1kg', sellerId: 'admin', seller: '펫키친', price: 15000, originalPrice: 25000, goal: 5, current: 5, imageUrl: 'https://images.unsplash.com/photo-1582747157583-94aa03828786?w=600', deadline: new Date(Date.now() + 86400000).toISOString() },
  { id: 'g2', title: '무선 저소음 자동 급수기', sellerId: 'otherseller', seller: '캣룸', price: 32000, originalPrice: 48000, goal: 30, current: 15, imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600', deadline: new Date(Date.now() + 172800000).toISOString() },
];

const MOCK_PARTICIPANTS = [
  { name: '김집사', phone: '010-1234-5678', date: '2026-02-15' },
  { name: '이멍멍', phone: '010-9988-7766', date: '2026-02-16' },
  { name: '최야옹', phone: '010-5544-3322', date: '2026-02-17' },
];

// --- [UI 헬퍼 컴포넌트] ---

function ImageWithFallback({ src, className, alt, filter = '', decorations = [] }) {
  const [error, setError] = useState(false);
  if (error) return (
    <div className={`${className} flex flex-col items-center justify-center bg-stone-100 text-stone-300 gap-2 border border-stone-50 font-bold`}>
      <AlertTriangle size={32} />
      <span className="text-[10px]">Image Load Error 🐾</span>
    </div>
  );

  return (
    <div className="relative overflow-hidden w-full h-full">
      <img src={src} className={className} alt={alt} style={{ filter: filter }} onError={() => setError(true)} />
      {decorations.map((deco, idx) => (
        <div key={idx} className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ left: `${deco.x}%`, top: `${deco.y}%` }}>
          {deco.type === 'bubble' ? (
            <div className="relative bg-white text-stone-800 px-3 py-1.5 rounded-2xl text-[10px] font-bold shadow-lg border-2 border-stone-800 whitespace-nowrap animate-bounce">
              {deco.content} {deco.emoji}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[7px] border-t-stone-800"></div>
            </div>
          ) : ( <span className="text-3xl drop-shadow-md">{deco.content}</span> )}
        </div>
      ))}
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(error) { return { hasError: true }; }
  render() {
    if (this.state.hasError) return (
      <div className="h-screen flex flex-col items-center justify-center p-10 text-center bg-[#FDFCF8]">
        <AlertTriangle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2 text-stone-800">문제가 발생했습니다.</h2>
        <button onClick={() => window.location.reload()} className="px-8 py-3 bg-stone-900 text-white rounded-full font-bold">새로고침</button>
      </div>
    );
    return this.props.children;
  }
}

// --- [메인 앱 컴포넌트] ---

function PetmilyApp() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [realPosts, setRealPosts] = useState([]);
  const [dummyPosts, setDummyPosts] = useState(INITIAL_DUMMY_POSTS);
  const [deals, setDeals] = useState(INITIAL_DEALS);
  const [myOrders, setMyOrders] = useState([]);
  
  const [view, setView] = useState('feed'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [petFilter, setPetFilter] = useState('all');
  const [activeRankingTab, setActiveRankingTab] = useState('new');
  const [activeProfileTab, setActiveProfileTab] = useState('mine'); 
  
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', visible: false });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  
  const [selectedPostIdForComment, setSelectedPostIdForComment] = useState(null);
  const [selectedDealForReservation, setSelectedDealForReservation] = useState(null);

  const isMainView = useMemo(() => ['feed', 'search', 'leaderboard', 'my_page', 'group_buy'].includes(view), [view]);

  const showToast = (msg) => {
    setToast({ message: msg, visible: true });
    setTimeout(() => setToast({ message: '', visible: false }), 2500);
  };

  const handleHomeClick = () => {
    if (view === 'feed') window.scrollTo({ top: 0, behavior: 'smooth' });
    else { setView('feed'); setSearchTerm(''); setPetFilter('all'); }
  };

  const allPosts = useMemo(() => {
    const combined = [...realPosts, ...dummyPosts];
    return combined.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  }, [realPosts, dummyPosts]);

  const filteredPosts = useMemo(() => {
    return allPosts.filter(post => {
      const matchSearch = (post.caption || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (post.authorName || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchFilter = petFilter === 'all' || post.petType === petFilter;
      return matchSearch && matchFilter;
    });
  }, [allPosts, searchTerm, petFilter]);

  const rankingData = useMemo(() => {
    const now = Date.now() / 1000;
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60);
    if (activeRankingTab === 'new') {
      return [...allPosts].filter(p => (p.createdAt?.seconds || 0) > thirtyDaysAgo)
        .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0)).slice(0, 10);
    }
    return [...allPosts].sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0)).slice(0, 10);
  }, [allPosts, activeRankingTab]);

  const myPosts = useMemo(() => allPosts.filter(p => p.authorId === user?.uid), [allPosts, user]);
  const likedPosts = useMemo(() => allPosts.filter(p => (p.likes || []).includes(user?.uid)), [allPosts, user]);
  const mySalesDeals = useMemo(() => deals.filter(d => d.sellerId === 'admin' || d.sellerId === user?.uid), [deals, user]);

  const handleLogout = async () => {
    try { 
      setLoading(true); 
      await signOut(auth); 
      setUser(null); setProfile(DEFAULT_PROFILE); setView('feed'); 
      showToast("로그아웃 되었습니다! 🐾"); 
    } catch (e) { showToast("실패 ❌"); } finally { setLoading(false); }
  };

  const handleLike = async (postId, likes) => {
    if (!user || user.isAnonymous) { setIsLoginModalOpen(true); return; }
    const isLiked = (likes || []).includes(user.uid);
    if (postId.startsWith('d')) {
      setDummyPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: isLiked ? p.likes.filter(id => id !== user.uid) : [...p.likes, user.uid] } : p));
    } else {
      const postRef = doc(db, 'artifacts', appId, 'public', 'data', 'posts', postId);
      await updateDoc(postRef, { likes: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid) });
    }
  };

  const handleReservationComplete = (deal, info) => {
    setDeals(prev => prev.map(d => d.id === deal.id ? { ...d, current: d.current + 1 } : d));
    const orderData = {
      ...deal,
      current: deal.current + 1,
      orderDate: new Date().toLocaleDateString(),
      contactInfo: info
    };
    setMyOrders(prev => [orderData, ...prev]);
    setIsReservationModalOpen(false);
    showToast("조공 예약이 완료되었습니다! 🎁");
  };

  const navigateToProtected = (targetView) => {
    if (!user || user.isAnonymous) { setIsLoginModalOpen(true); return; }
    setView(targetView);
  };

  const handleJumpToPost = (postId) => {
    setView('feed');
    setTimeout(() => {
      document.getElementById(`post-${postId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
  };

  // --- [Firebase 인증 및 데이터 연동 - 규칙 준수] ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth error:", err);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        if (!u.isAnonymous) {
          // Rule 1 준수된 경로
          const profileRef = doc(db, 'artifacts', appId, 'users', u.uid, 'profile', 'info');
          try {
            const profileSnap = await getDoc(profileRef);
            if (profileSnap.exists()) setProfile(profileSnap.data());
          } catch(e) { console.error("Profile fetch error:", e); }
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    // Rule 1 준수된 경로
    const postsRef = collection(db, 'artifacts', appId, 'public', 'data', 'posts');
    const unsubscribe = onSnapshot(postsRef, (snapshot) => {
      setRealPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => console.error("Firestore onSnapshot error:", error));
    return () => unsubscribe();
  }, [user]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#FDFCF8]">
      <Loader2 className="w-10 h-10 text-orange-400 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#FDFCF8] pb-32 font-sans text-stone-800 shadow-2xl relative border-x border-gray-100 overflow-x-hidden font-bold">
      
      {toast.visible && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[150] animate-in slide-in-from-top-4 duration-300">
          <div className="bg-stone-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 border border-white/10 font-bold">
            <CheckCircle2 size={16} className="text-orange-400 font-bold" />
            <span className="text-xs font-bold">{toast.message}</span>
          </div>
        </div>
      )}

      {isMainView && (
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-5 py-4 flex flex-col gap-3 font-bold">
          <div className="flex justify-between items-center font-bold">
            <div className="flex flex-col gap-1 font-bold">
              <div className="flex items-center gap-2 font-bold cursor-pointer" onClick={handleHomeClick}>
                 <div className="w-8 h-8 bg-stone-900 rounded-lg flex items-center justify-center">
                    <PawPrint size={18} className="text-orange-400 fill-orange-400" />
                 </div>
                 <div className="flex items-center gap-1.5">
                    <h1 className="text-lg font-black italic tracking-tighter">Petmily</h1>
                    <span className="bg-orange-500 text-white text-[7px] px-1.5 py-0.5 rounded-full font-black uppercase">Beta</span>
                 </div>
              </div>
              <button onClick={() => setView('leaderboard')} className="flex items-center gap-1 text-[9px] font-black text-stone-300 hover:text-orange-500 transition-colors pl-1">
                <Trophy size={10} className="text-orange-400" /> 명예의 전당 바로가기 <ChevronRight size={10} />
              </button>
            </div>
            <div className="flex gap-2 font-bold">
              {user?.isAnonymous ? (
                <button onClick={() => setIsLoginModalOpen(true)} className="bg-orange-500 text-white px-4 py-1.5 rounded-full text-xs font-bold border-none shadow-md">로그인</button>
              ) : (
                <button onClick={handleLogout} className="text-stone-300 p-1 font-bold"><LogOut size={20}/></button>
              )}
            </div>
          </div>
          {view === 'feed' && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1 font-bold">
              {PET_TYPES.map(type => (
                <button key={type.id} onClick={() => setPetFilter(type.id)} className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[10px] font-bold border transition-all ${petFilter === type.id ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-400 border-stone-100'}`}>
                  {type.label}
                </button>
              ))}
            </div>
          )}
        </header>
      )}

      <main className="font-bold">
        {view === 'feed' && (
          <div className="space-y-1 font-bold">
            {filteredPosts.map(post => (
              <PostCardItem 
                key={post.id} post={post} user={user} 
                onLike={() => handleLike(post.id, post.likes)} 
                onComment={() => { setSelectedPostIdForComment(post.id); setIsCommentModalOpen(true); }}
              />
            ))}
          </div>
        )}

        {view === 'search' && (
          <div className="px-5 py-6 animate-in fade-in font-bold">
             <h2 className="text-2xl font-black mb-6 italic font-bold">친구 찾기 🔍</h2>
             <div className="flex items-center bg-white border border-stone-100 rounded-2xl px-4 py-3 shadow-sm mb-6 font-bold">
                <Search size={18} className="text-stone-300 mr-2 font-bold" />
                <input type="text" placeholder="집사 닉네임이나 키워드 검색" className="w-full bg-transparent outline-none text-sm font-bold" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
             </div>
             <div className="grid grid-cols-2 gap-3 font-bold">
               {filteredPosts.map(post => (
                 <div key={post.id} onClick={() => handleJumpToPost(post.id)} className="aspect-square rounded-2xl overflow-hidden shadow-md font-bold">
                    <img src={post.imageUrl} className="w-full h-full object-cover font-bold" alt="result" />
                 </div>
               ))}
             </div>
          </div>
        )}

        {view === 'group_buy' && (
          <div className="px-5 py-6 animate-in slide-in-from-bottom-4 font-bold">
            <div className="flex items-center justify-between mb-8 font-bold">
              <h2 className="text-2xl font-black italic font-bold font-bold">오늘의 조공 🛒</h2>
              <div className="bg-orange-50 px-3 py-1 rounded-full flex items-center gap-1.5 font-bold">
                <Timer size={14} className="text-orange-500 animate-pulse font-bold" />
                <span className="text-[10px] text-orange-600 font-black uppercase font-bold">Limited</span>
              </div>
            </div>
            <div className="space-y-8 font-bold">
              {deals.map(deal => {
                const now = new Date();
                const deadline = new Date(deal.deadline);
                const isExpired = deadline < now;
                const progress = (deal.current / deal.goal) * 100;
                const isSuccess = deal.current >= deal.goal;
                return (
                  <div key={deal.id} className={`bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-50 flex flex-col font-bold ${isExpired ? 'opacity-70 grayscale' : ''}`}>
                    <div className="relative aspect-video font-bold">
                      <img src={deal.imageUrl} className="w-full h-full object-cover font-bold" alt="deal" />
                      {isExpired && !isSuccess && <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm font-bold"><div className="bg-white text-stone-800 px-6 py-2 rounded-full font-black text-sm flex items-center gap-2"><RotateCcw size={18}/> 미달성 환불됨</div></div>}
                      {isSuccess && <div className="absolute inset-0 bg-orange-500/20 flex items-center justify-center backdrop-blur-sm font-bold"><div className="bg-orange-500 text-white px-6 py-2 rounded-full font-black text-sm shadow-2xl animate-bounce font-bold">조공 성공!</div></div>}
                    </div>
                    <div className="p-7 space-y-4 font-bold">
                      <h3 className="font-black text-lg tracking-tight font-bold">{deal.title}</h3>
                      <div className="flex items-baseline gap-2 font-bold">
                        <span className="text-2xl font-black text-orange-500 font-bold">{deal.price.toLocaleString()}원</span>
                        <span className="text-sm text-stone-300 line-through font-bold font-bold">{deal.originalPrice.toLocaleString()}원</span>
                      </div>
                      <div className="space-y-2 font-bold">
                        <div className="h-3 w-full bg-stone-100 rounded-full overflow-hidden font-bold">
                          <div className={`h-full transition-all duration-1000 ${isSuccess ? 'bg-orange-500' : 'bg-stone-800'}`} style={{ width: `${progress}%` }}></div>
                        </div>
                        <div className="flex justify-between text-[11px] font-black text-gray-400 font-bold">
                           <span>참여도 {Math.round(progress)}%</span>
                           <span>{deal.current} / {deal.goal}명</span>
                        </div>
                      </div>
                      <button disabled={isExpired && !isSuccess} onClick={() => { setSelectedDealForReservation(deal); setIsReservationModalOpen(true); }} className={`w-full py-5 rounded-[1.8rem] font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg font-bold ${isSuccess ? 'bg-orange-500 text-white' : isExpired ? 'bg-stone-200 text-stone-400' : 'bg-stone-900 text-white'}`}>
                        <ShoppingBasket size={18} /> {isSuccess ? "구매하기" : isExpired ? "마감되었습니다" : "조공참여 (예약)"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {view === 'leaderboard' && (
          <div className="px-5 py-6 animate-in slide-in-from-bottom-4 font-bold">
            <div className="flex items-center gap-2 mb-8 font-bold">
               <button onClick={() => setView('feed')} className="p-2 bg-stone-50 rounded-full"><ArrowLeft size={20}/></button>
               <h2 className="text-2xl font-black italic font-bold">명예의 전당 👑</h2>
            </div>
            <div className="space-y-6 mt-8 font-bold">
              <div className="flex p-1.5 bg-stone-100 rounded-[1.5rem] gap-2 mb-8 font-bold">
                <button onClick={() => setActiveRankingTab('new')} className={`flex-1 py-3 rounded-xl font-black text-xs transition-all font-bold ${activeRankingTab === 'new' ? 'bg-white text-orange-500 shadow-md' : 'text-stone-400'}`}>신규 랭킹</button>
                <button onClick={() => setActiveRankingTab('total')} className={`flex-1 py-3 rounded-xl font-black text-xs transition-all font-bold ${activeRankingTab === 'total' ? 'bg-white text-orange-500 shadow-md' : 'text-stone-400'}`}>누적 명예</button>
              </div>
              {rankingData.map((post, idx) => (
                <div key={post.id} onClick={() => handleJumpToPost(post.id)} className="group relative aspect-video rounded-[2.5rem] overflow-hidden border-2 border-stone-100 shadow-xl active:scale-98 transition-all cursor-pointer font-bold">
                  <ImageWithFallback src={post.imageUrl} className="w-full h-full object-cover font-bold" alt="best" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-6 flex flex-col justify-end font-bold">
                     <div className="flex items-center justify-between font-bold">
                        <div>
                          <div className="flex items-center gap-2 mb-1 font-bold"><span className="text-2xl font-black italic text-orange-500">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}</span><p className="text-white font-black text-lg leading-none font-bold">{post.authorName}</p></div>
                          <p className="text-stone-400 text-xs font-bold line-clamp-1 font-bold font-bold">{post.caption}</p>
                        </div>
                        <div className="bg-white/10 border border-white/20 px-4 py-2 rounded-2xl font-bold font-bold"><p className="text-white font-black text-sm font-bold">{(post.likes || []).length} 꾹</p></div>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'my_page' && (
          <div className="px-5 py-6 animate-in slide-in-from-bottom-4 font-bold">
             <div className="bg-stone-900 rounded-[3rem] p-10 text-white flex flex-col gap-6 shadow-2xl relative overflow-hidden font-bold">
                <div className="flex items-center gap-5 z-10 font-bold">
                  <div className="w-20 h-20 rounded-[2rem] bg-white/10 border border-white/20 overflow-hidden shadow-inner font-bold"><img src={user?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.uid}`} alt="me" className="w-full h-full object-cover" /></div>
                  <div className="font-bold"><h2 className="text-3xl font-black italic tracking-tighter">{auth.currentUser?.displayName || '집사님'}</h2><p className="text-stone-500 text-xs font-bold mt-1 uppercase tracking-widest font-bold">My Pet Room</p></div>
                </div>
                <div className="flex p-1 bg-white/5 rounded-2xl z-10 font-bold overflow-x-auto scrollbar-hide">
                  <button onClick={() => setActiveProfileTab('mine')} className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black transition-all whitespace-nowrap ${activeProfileTab === 'mine' ? 'bg-white text-stone-900 shadow-lg' : 'text-stone-500 font-bold'}`}>보물함</button>
                  <button onClick={() => setActiveProfileTab('liked')} className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black transition-all whitespace-nowrap ${activeProfileTab === 'liked' ? 'bg-white text-stone-900 shadow-lg' : 'text-stone-500'}`}>내 꾹</button>
                  <button onClick={() => setActiveProfileTab('orders')} className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black transition-all whitespace-nowrap ${activeProfileTab === 'orders' ? 'bg-white text-stone-900 shadow-lg' : 'text-stone-500'}`}>참여내역</button>
                  <button onClick={() => setActiveProfileTab('sales')} className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black transition-all whitespace-nowrap ${activeProfileTab === 'sales' ? 'bg-white text-stone-900 shadow-lg' : 'text-stone-500'}`}>판매관리</button>
                </div>
            </div>

            <div className="mt-8 font-bold">
              {activeProfileTab === 'mine' && <div className="grid grid-cols-2 gap-3">{myPosts.map(post => (<div key={post.id} onClick={() => handleJumpToPost(post.id)} className="aspect-square rounded-[1.8rem] overflow-hidden shadow-md border border-stone-100 font-bold"><img src={post.imageUrl} className="w-full h-full object-cover font-bold" alt="mine" /></div>))}</div>}
              {activeProfileTab === 'liked' && <div className="grid grid-cols-2 gap-3">{likedPosts.map(post => (<div key={post.id} onClick={() => handleJumpToPost(post.id)} className="aspect-square rounded-[1.8rem] overflow-hidden shadow-md border border-stone-100 font-bold"><img src={post.imageUrl} className="w-full h-full object-cover font-bold" alt="liked" /></div>))}</div>}
              {activeProfileTab === 'orders' && <div className="space-y-4 font-bold">{myOrders.length === 0 ? <p className="text-center py-20 text-stone-300 italic font-bold">참여 내역이 없습니다 🐾</p> : myOrders.map((order, i) => (<div key={i} className="flex gap-4 p-4 bg-white rounded-3xl border border-stone-100 shadow-sm font-bold"><img src={order.imageUrl} className="w-20 h-20 rounded-2xl object-cover font-bold" /><div className="flex flex-col justify-center flex-1 font-bold"><span className="bg-orange-100 text-orange-600 text-[8px] font-bold px-2 py-0.5 rounded w-fit mb-1">참여완료</span><h4 className="font-black text-sm font-bold line-clamp-1">{order.title}</h4><p className="text-orange-500 font-black text-sm font-bold">{order.price.toLocaleString()}원</p></div></div>))}</div>}
              {activeProfileTab === 'sales' && (
                <div className="space-y-6 font-bold">
                  {mySalesDeals.length === 0 ? <p className="text-center py-20 text-stone-300 italic font-bold">등록된 판매 상품이 없습니다 🐾</p> : mySalesDeals.map((deal) => { 
                    const isSuccess = deal.current >= deal.goal; 
                    return (
                      <div key={deal.id} className="bg-white rounded-[2.5rem] p-6 border border-stone-100 shadow-md space-y-4 font-bold">
                        <div className="flex gap-4 items-center font-bold">
                          <img src={deal.imageUrl} className="w-16 h-16 rounded-2xl object-cover" />
                          <div>
                            <h4 className="font-black text-sm">{deal.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded ${isSuccess ? 'bg-green-100 text-green-600' : 'bg-orange-50 text-orange-600'}`}>{isSuccess ? '조공 성공' : '진행 중'}</span>
                              <span className="text-[10px] text-stone-400">{deal.current} / {deal.goal}명</span>
                            </div>
                          </div>
                        </div>
                        <div className="pt-4 border-t border-dashed border-stone-100 font-bold">
                          <h5 className="text-[11px] font-black text-stone-800 flex items-center gap-1 mb-3"><ClipboardList size={14}/> 참여자 정보</h5>
                          {isSuccess ? (
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-hide font-bold">
                              {MOCK_PARTICIPANTS.map((p, i) => (
                                <div key={i} className="bg-stone-50 p-3 rounded-xl flex justify-between items-center animate-in fade-in font-bold">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-[10px] font-black shadow-sm text-orange-500">{i+1}</div>
                                    <span className="text-xs font-black">{p.name}</span>
                                  </div>
                                  <span className="text-xs text-stone-500 font-medium">{p.phone}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="py-8 bg-stone-50 rounded-2xl flex flex-col items-center justify-center gap-2 opacity-40">
                              <X size={20} className="text-stone-300" />
                              <p className="text-[10px] font-bold text-stone-400">데이터가 잠겨있습니다.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ); 
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[380px] bg-stone-900/95 backdrop-blur-xl px-2 py-3.5 rounded-[2.5rem] flex justify-between items-center shadow-2xl z-50 border border-white/10 font-bold">
        <button onClick={handleHomeClick} className={`flex-1 flex flex-col items-center gap-1 transition-all active:scale-75 ${view === 'feed' ? 'text-white' : 'text-stone-50'}`}><Home size={22} /><span className="text-[8px] font-bold">홈</span></button>
        <button onClick={() => setView('search')} className={`flex-1 flex flex-col items-center gap-1 transition-all active:scale-75 ${view === 'search' ? 'text-white' : 'text-stone-50'}`}><Search size={22} /><span className="text-[8px] font-bold uppercase">찾기</span></button>
        <div className="flex-1 flex justify-center font-bold"><button onClick={() => navigateToProtected('studio')} className="bg-gradient-to-br from-orange-400 to-orange-600 text-white p-4 rounded-2xl shadow-lg -translate-y-2 active:scale-75 transition-all"><PlusSquare size={24} /></button></div>
        <button onClick={() => setView('group_buy')} className={`flex-1 flex flex-col items-center gap-1 transition-all active:scale-75 ${view === 'group_buy' ? 'text-orange-400' : 'text-stone-50'}`}><ShoppingBag size={22} /><span className="text-[8px] font-bold uppercase">조공</span></button>
        <button onClick={() => navigateToProtected('my_page')} className={`flex-1 flex flex-col items-center gap-1 transition-all active:scale-75 ${view === 'my_page' ? 'text-white' : 'text-stone-50'}`}><User size={22} /><span className="text-[8px] font-bold uppercase">보물함</span></button>
      </nav>

      {view === 'studio' && <StudioModal onClose={() => setView('feed')} onSave={async (p) => { await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'posts'), { ...p, authorId: user.uid, authorName: auth.currentUser?.displayName || '익명집사', likes: [], createdAt: serverTimestamp() }); setView('feed'); showToast("게시 완료!"); }} />}
      {isReservationModalOpen && <ReservationModal deal={selectedDealForReservation} onClose={() => setIsReservationModalOpen(false)} onComplete={handleReservationComplete} />}
      {isLoginModalOpen && <LoginModal onClose={() => setIsLoginModalOpen(false)} onLogin={async () => { const provider = new GoogleAuthProvider(); await signInWithPopup(auth, provider).then(() => setIsLoginModalOpen(false)).catch(console.error); }} />}
      {isCommentModalOpen && <CommentModal post={allPosts.find(p => p.id === selectedPostIdForComment)} onClose={() => setIsCommentModalOpen(false)} onAddComment={async (id, t) => { /* 댓글 로직 */ }} />}
    </div>
  );
}

function PostCardItem({ post, user, onLike, onComment }) {
  const isLiked = (post.likes || []).includes(user?.uid);
  return (
    <div id={`post-${post.id}`} className="bg-white border-b border-gray-50 animate-in fade-in duration-500 font-bold mb-1">
      <div className="px-5 py-4 flex items-center justify-between font-bold"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden border border-gray-100 shadow-sm font-bold"><img src={`https://api.dicebear.com/7.x/initials/svg?seed=${post.authorName}`} alt="av" /></div><div className="flex flex-col font-bold"><span className="font-black text-[14px] text-stone-800 font-bold">{post.authorName}</span><span className="text-[10px] text-stone-300 font-bold">#{post.petType}</span></div></div></div>
      <ImageWithFallback src={post.imageUrl} className="w-full aspect-square object-cover font-bold" alt="post" />
      <div className="p-5 space-y-2 font-bold"><div className="flex gap-5 mb-1 items-center font-bold"><PawPrint onClick={onLike} className={`cursor-pointer transition-all active:scale-150 ${isLiked ? 'text-orange-500 fill-orange-500' : 'text-stone-800 font-bold'}`} size={28} /><MessageCircle onClick={onComment} className="text-stone-800 cursor-pointer font-bold" size={26} /><Send className="text-stone-800 ml-auto opacity-30 cursor-pointer font-bold" size={24} /></div><p className="text-xs font-black text-stone-400 font-bold">{(post.likes || []).length} Pet Lovers 꾹!</p><p className="text-sm leading-relaxed font-bold"><span className="font-black mr-2 text-stone-900 font-bold">{post.authorName}</span>{post.caption}</p></div>
    </div>
  );
}

function ReservationModal({ deal, onClose, onComplete }) {
  const [step, setStep] = useState(1);
  const [info, setInfo] = useState({ name: '', phone: '' });
  if (!deal) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-xl p-6 font-bold"><div className="bg-white rounded-[3rem] w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 font-bold"><div className="p-8 space-y-6 font-bold">{step === 1 ? (<><div className="flex justify-between items-center font-bold"><h3 className="text-xl font-black font-bold">조공 참여 예약 ✍️</h3><button onClick={onClose}><X size={20}/></button></div><div className="flex gap-4 items-center bg-stone-50 p-4 rounded-2xl font-bold border border-stone-100 font-bold"><img src={deal.imageUrl} className="w-16 h-16 rounded-xl object-cover font-bold" /><div className="font-bold overflow-hidden font-bold"><p className="text-sm font-bold truncate font-bold">{deal.title}</p><p className="text-orange-500 font-black font-bold">{deal.price.toLocaleString()}원</p></div></div><div className="space-y-3 font-bold"><div className="relative font-bold"><UserIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" /><input type="text" placeholder="성함" className="w-full bg-stone-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold" value={info.name} onChange={e=>setInfo({...info, name: e.target.value})} /></div><div className="relative font-bold"><Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" /><input type="tel" placeholder="연락처" className="w-full bg-stone-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold" value={info.phone} onChange={e=>setInfo({...info, phone: e.target.value})} /></div></div><button disabled={!info.name || !info.phone} onClick={() => setStep(2)} className="w-full py-5 bg-stone-900 text-white rounded-3xl font-black shadow-xl active:scale-95 disabled:bg-stone-200 font-bold">예약 완료하기</button></>) : (<div className="text-center py-10 space-y-6 font-bold"><div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto animate-in zoom-in font-bold"><Check size={40} strokeWidth={3} /></div><h3 className="text-2xl font-black font-bold">예약 완료!</h3><p className="text-stone-400 text-sm mt-2 font-bold">조공 목표가 달성되면 알려드릴게요.</p><button onClick={() => onComplete(deal, info)} className="w-full py-5 bg-green-500 text-white rounded-3xl font-black shadow-xl font-bold">확인</button></div>)}</div></div></div>
  );
}

function StudioModal({ onClose, onSave }) {
  const [imgData, setImgData] = useState('');
  const [caption, setCaption] = useState('');
  const [selectedFilter, setSelectedFilter] = useState(PHOTO_FILTERS[0]);
  const [activeDecorations, setActiveDecorations] = useState([]);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const handleFileChange = (e) => { const file = e.target.files[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => { setImgData(reader.result); setStep(2); }; reader.readAsDataURL(file); } };
  const addDeco = (item) => { const newDeco = { ...item, x: 30 + Math.random() * 40, y: 30 + Math.random() * 40 }; setActiveDecorations([...activeDecorations, newDeco]); };
  return (
    <div className="fixed inset-0 z-[200] bg-white animate-in slide-in-from-bottom duration-300 flex flex-col font-bold"><div className="px-5 py-4 border-b border-stone-100 flex justify-between items-center bg-white font-bold"><button onClick={onClose} className="p-2 text-stone-400 font-bold"><X /></button><h2 className="text-lg font-black italic font-bold">Pet Studio</h2>{step > 1 && (<button onClick={async () => { if (step < 3) setStep(step + 1); else { setIsSubmitting(true); await onSave({ imageUrl: imgData, caption, filter: selectedFilter.class, decorations: activeDecorations, petType: '기타' }); setIsSubmitting(false); } }} className="text-orange-500 font-black text-sm" disabled={isSubmitting}>{isSubmitting ? '...' : (step === 3 ? '공유' : '다음')}</button>)}</div><div className="flex-1 overflow-y-auto bg-[#FDFCF8] font-bold">{step === 1 ? (<div className="h-full flex flex-col items-center justify-center p-10 gap-6 font-bold"><div onClick={() => fileInputRef.current.click()} className="w-full aspect-square bg-white border-2 border-dashed border-stone-200 rounded-[3rem] flex flex-col items-center justify-center gap-4 cursor-pointer font-bold"><ImageIcon size={40} className="text-orange-500"/><p className="text-stone-400 font-bold">사진 고르기</p></div><input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept="image/*" /></div>) : (<div className="flex flex-col h-full font-bold"><div className="w-full aspect-square bg-black relative font-bold overflow-hidden"><ImageWithFallback src={imgData} className="w-full h-full object-contain font-bold" filter={selectedFilter.class} decorations={activeDecorations} /></div>{step === 2 ? (<div className="p-6 space-y-8 font-bold"><section><label className="text-xs text-stone-400 block mb-3 font-bold uppercase tracking-widest font-bold">Filter</label><div className="flex gap-3 overflow-x-auto scrollbar-hide font-bold">{PHOTO_FILTERS.map((f, i) => (<button key={i} onClick={() => setSelectedFilter(f)} className="flex-shrink-0 flex flex-col items-center gap-2 font-bold"><div className={`w-14 h-14 rounded-2xl overflow-hidden border-2 ${selectedFilter.name === f.name ? 'border-orange-500' : 'border-white'} font-bold`}><img src={imgData} style={{ filter: f.class }} className="w-full h-full object-cover" /></div><span className="text-[10px] font-bold">{f.name}</span></button>))}</div></section><section><div className="flex justify-between items-center mb-3 font-bold"><label className="text-xs text-stone-400 font-bold uppercase tracking-widest font-bold">Deco</label><button onClick={() => setActiveDecorations([])} className="text-[10px] text-stone-300 font-bold font-bold">지우기</button></div><div className="flex flex-wrap gap-2 font-bold">{STICKERS.map(s => (<button key={s.id} onClick={() => addDeco(s)} className="px-3 py-1.5 bg-white border border-stone-100 rounded-xl text-xs font-bold shadow-sm font-bold">{s.type === 'bubble' ? s.emoji : s.content}</button>))}</div></section></div>) : (<div className="p-6 animate-in slide-in-from-right font-bold"><textarea value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="아이의 소중한 한마디..." className="w-full h-40 bg-white border-2 border-stone-100 rounded-3xl p-5 outline-none focus:border-orange-400 resize-none font-bold" /></div>)}</div>)}</div></div>
  );
}

function LoginModal({ onClose, onLogin }) {
  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/80 backdrop-blur-xl p-6 font-bold"><div className="bg-white rounded-[3rem] p-10 text-center w-full max-w-xs shadow-2xl relative overflow-hidden font-bold"><div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 to-indigo-500 font-bold"></div><h2 className="text-2xl font-black mb-4 italic font-bold">Welcome!</h2><p className="text-sm text-stone-400 mb-8 leading-relaxed font-bold">로그인을 하시면 자랑스러운 우리 아이를<br/>명예의 전당에 올릴 수 있어요! 🐾</p><button onClick={onLogin} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg mb-4 font-bold">Google 로그인</button><button onClick={onClose} className="text-stone-300 text-xs uppercase font-bold font-bold">나중에 하기</button></div></div>
  );
}

function CommentModal({ post, onClose }) {
  if (!post) return null;
  return (
    <div className="fixed inset-0 z-[140] flex items-end justify-center bg-black/70 backdrop-blur-md font-bold"><div className="w-full max-w-md bg-white rounded-t-[4rem] p-10 h-[80vh] flex flex-col shadow-2xl font-bold"><div className="flex justify-between items-center mb-8 font-bold"><h3 className="text-2xl font-black italic tracking-tighter font-bold">이야기 나누기</h3><button onClick={onClose} className="p-3 bg-stone-50 rounded-full text-stone-400 font-bold"><X size={20} /></button></div><div className="flex-1 overflow-y-auto space-y-6 scrollbar-hide font-bold"><MessageSquare size={48} className="mx-auto mb-4 opacity-20 font-bold" /><p className="font-bold tracking-tight font-bold text-center text-stone-300">첫 댓글의 주인공이 되어주세요!</p></div></div></div>
  );
}

export default function Root() {
  return (
    <ErrorBoundary>
      <PetmilyApp />
    </ErrorBoundary>
  );
}