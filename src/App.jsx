import React, { useState, useEffect, useRef, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  serverTimestamp, 
  getDoc,
  setDoc,
  addDoc
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { 
  Heart, 
  MessageCircle, 
  PlusSquare, 
  User, 
  X, 
  Send, 
  Home, 
  Search, 
  Camera, 
  Settings,
  PawPrint,
  ExternalLink,
  AlertTriangle,
  LogOut,
  Image as ImageIcon,
  Upload,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  MessageSquare,
  Trophy,
  Medal,
  Crown,
  Sparkles,
  Dog,
  Cat,
  Bird,
  Ghost,
  Plus,
  Trash2
} from 'lucide-react';

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyAfu0ZuAQCI2FMnD0kR8221DZXjrcl-P2c",
  authDomain: "petmily-jhkim.firebaseapp.com",
  projectId: "petmily-jhkim",
  storageBucket: "petmily-jhkim.firebasestorage.app",
  messagingSenderId: "346277353781",
  appId: "1:346277353781:web:31b2c0db0e7e29c792947c",
  measurementId: "G-CKYMX9KY42"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "petmily-app-v6";

// --- 풍성한 샘플 데이터 (20개) ---
const INITIAL_DUMMY_POSTS = [
  { id: 'd1', authorId: 'u1', authorName: '산책대장', imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800', caption: '우리 뽀삐 윙크 발사! 😉', likes: Array(85).fill('u'), comments: [{name: '초코맘', text: '어머 너무 예뻐요!'}], createdAt: { seconds: Date.now()/1000 - 10000 } },
  { id: 'd2', authorId: 'u2', authorName: '박스냥이', imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800', caption: '상자만 보면 환장하는 우리 애기..', likes: Array(72).fill('u'), comments: [], createdAt: { seconds: Date.now()/1000 - 20000 } },
  { id: 'd3', authorId: 'u3', authorName: '달리기왕', imageUrl: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=800', caption: '오늘도 5km 완주했습니다! 🐕💨', likes: Array(64).fill('u'), comments: [], createdAt: { seconds: Date.now()/1000 - 30000 } },
  { id: 'd4', authorId: 'u4', authorName: '해바라기', imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=800', caption: '볼주머니에 해바라기씨 꽉꽉 채웠어요.', likes: Array(42).fill('u'), comments: [], createdAt: { seconds: Date.now()/1000 - 40000 } },
  { id: 'd5', authorId: 'u5', authorName: '앵무박사', imageUrl: 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=800', caption: '안녕하세요! 말 가르치는 중이에요.', likes: Array(31).fill('u'), comments: [], createdAt: { seconds: Date.now()/1000 - 50000 } },
  { id: 'd6', authorId: 'u6', authorName: '절미맘', imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800', caption: '인절미가 따로 없네요 정말ㅋㅋ', likes: Array(128).fill('u'), comments: [], createdAt: { seconds: Date.now()/1000 - 60000 } },
  { id: 'd7', authorId: 'u7', authorName: '치즈식빵', imageUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800', caption: '햇빛 아래서 낮잠 자는게 제일 좋아.', likes: Array(55).fill('u'), comments: [], createdAt: { seconds: Date.now()/1000 - 70000 } },
  { id: 'd8', authorId: 'u8', authorName: '불독파파', imageUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800', caption: '표정이 왜 그래? 간식 줄까?', likes: Array(39).fill('u'), comments: [], createdAt: { seconds: Date.now()/1000 - 80000 } },
  { id: 'd9', authorId: 'u9', authorName: '솜사탕', imageUrl: 'https://images.unsplash.com/photo-1591160674255-fc8b9f70d515?w=800', caption: '구름이 걸어다니는 중입니다 ☁️', likes: Array(88).fill('u'), comments: [], createdAt: { seconds: Date.now()/1000 - 90000 } },
  { id: 'd10', authorId: 'u10', authorName: '시바랜드', imageUrl: 'https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?w=800', caption: '볼살 만지실 분 구함 (1/100)', likes: Array(61).fill('u'), comments: [], createdAt: { seconds: Date.now()/1000 - 100000 } },
  { id: 'd11', authorId: 'u11', authorName: '도치파파', imageUrl: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800', caption: '우리집 가시공주님 자랑합니다.', likes: Array(25).fill('u'), createdAt: { seconds: Date.now()/1000 - 110000 } },
  { id: 'd12', authorId: 'u12', authorName: '비숑프리제', imageUrl: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800', caption: '산책 가기 전 하이텐션!', likes: Array(54).fill('u'), createdAt: { seconds: Date.now()/1000 - 120000 } },
  { id: 'd13', authorId: 'u13', authorName: '웰시코기', imageUrl: 'https://images.unsplash.com/photo-1519098901909-b1553a1190af?w=800', caption: '식빵 굽는 중인 웰시코기 보실래요?', likes: Array(76).fill('u'), createdAt: { seconds: Date.now()/1000 - 130000 } },
  { id: 'd14', authorId: 'u14', authorName: '러블블루', imageUrl: 'https://images.unsplash.com/photo-1513245543132-31f507417b26?w=800', caption: '은빛 털이 너무 예쁜 우리 아이.', likes: Array(41).fill('u'), createdAt: { seconds: Date.now()/1000 - 140000 } },
  { id: 'd15', authorId: 'u15', authorName: '닥스월드', imageUrl: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800', caption: '다리는 짧아도 산책 속도는 광속!', likes: Array(33).fill('u'), createdAt: { seconds: Date.now()/1000 - 150000 } },
  { id: 'd16', authorId: 'u1', authorName: '산책대장', imageUrl: 'https://images.unsplash.com/photo-1517423440428-a5a00ad1e3e8?w=800', caption: '기다려! 교육 중인데 간식만 봐요.', likes: Array(22).fill('u'), createdAt: { seconds: Date.now()/1000 - 160000 } },
  { id: 'd17', authorId: 'u16', authorName: '코숏사랑', imageUrl: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=800', caption: '길에서 만난 우리 공주님.', likes: Array(62).fill('u'), createdAt: { seconds: Date.now()/1000 - 170000 } },
  { id: 'd18', authorId: 'u17', authorName: '말티즈맘', imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800', caption: '말티즈는 역시 참지 않아요ㅋㅋ', likes: Array(49).fill('u'), createdAt: { seconds: Date.now()/1000 - 180000 } },
  { id: 'd19', authorId: 'u18', authorName: '우아한집', imageUrl: 'https://images.unsplash.com/photo-1557246565-8a3d3ab5d7f6?w=800', caption: '우아함의 끝판왕 페르시안.', likes: Array(38).fill('u'), createdAt: { seconds: Date.now()/1000 - 190000 } },
  { id: 'd20', authorId: 'u19', authorName: '박스수집가', imageUrl: 'https://images.unsplash.com/photo-1505628346881-b72b27e84531?w=800', caption: '새 집보다 박스가 좋은가봐요..', likes: Array(45).fill('u'), createdAt: { seconds: Date.now()/1000 - 200000 } },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ nickname: '', pets: [] });
  const [realPosts, setRealPosts] = useState([]);
  const [dummyPosts, setDummyPosts] = useState(INITIAL_DUMMY_POSTS);
  const [view, setView] = useState('feed'); 
  const [activeProfileTab, setActiveProfileTab] = useState('gallery');
  const [loading, setLoading] = useState(true);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [toast, setToast] = useState({ message: '', visible: false });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedPostIdForComment, setSelectedPostIdForComment] = useState(null);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedButler, setSelectedButler] = useState(null); // 집사 상세 페이지를 위한 상태

  // 인앱 브라우저 감지 및 자동 전환
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const isInApp = ua.indexOf('kakaotalk') > -1 || ua.indexOf('instagram') > -1 || ua.indexOf('line') > -1;
    if (isInApp) {
      setIsInAppBrowser(true);
      if (ua.match(/android/)) {
        const currentUrl = window.location.href.replace(/https?:\/\//, '');
        window.location.href = `intent://${currentUrl}#Intent;scheme=https;package=com.android.chrome;end`;
      }
    }
  }, []);

  const showToast = (msg) => {
    setToast({ message: msg, visible: true });
    setTimeout(() => setToast({ message: '', visible: false }), 2500);
  };

  const loadingMessage = useMemo(() => {
    const messages = ["가족들을 부르는 중...", "기다려! 하는 중...", "꼬리 흔드는 중...", "엉덩이 실룩실룩~ 🍑"];
    return messages[Math.floor(Math.random() * messages.length)];
  }, [loading]);

  // 인증 및 프로필 로드
  useEffect(() => {
    const initAuth = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
        onAuthStateChanged(auth, async (u) => {
          if (!u) {
            try { await signInAnonymously(auth); } catch (e) { setLoading(false); }
          } else {
            setUser(u);
            if (!u.isAnonymous) {
              const profileRef = doc(db, 'artifacts', appId, 'users', u.uid, 'profile', 'info');
              const profileSnap = await getDoc(profileRef);
              if (profileSnap.exists()) setProfile(profileSnap.data());
              else setView('profile_setup');
            }
            setLoading(false);
          }
        });
      } catch (err) { setLoading(false); }
    };
    initAuth();
  }, []);

  // 게시물 실시간 구독
  useEffect(() => {
    if (!user) return;
    const postsRef = collection(db, 'artifacts', appId, 'public', 'data', 'posts');
    const unsubscribe = onSnapshot(postsRef, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRealPosts(postsData);
    });
    return () => unsubscribe();
  }, [user]);

  const allPosts = useMemo(() => {
    const combined = [...realPosts, ...dummyPosts];
    return combined.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  }, [realPosts, dummyPosts]);

  // 랭킹 데이터 계산 (이미지 랭킹용)
  const rankingData = useMemo(() => {
    const thirtyDaysAgo = Date.now() / 1000 - 30 * 24 * 60 * 60;
    const userScores = {};
    const postRankingList = [];

    allPosts.forEach(post => {
      if ((post.createdAt?.seconds || 0) >= thirtyDaysAgo) {
        const likeCount = (post.likes || []).length;
        if (likeCount > 0) {
          if (post.authorId) {
            if (!userScores[post.authorId]) userScores[post.authorId] = { id: post.authorId, name: post.authorName, score: 0 };
            userScores[post.authorId].score += likeCount;
          }
          postRankingList.push({ ...post, score: likeCount });
        }
      }
    });

    return {
      userRanking: Object.values(userScores).sort((a, b) => b.score - a.score).slice(0, 50),
      postRanking: postRankingList.sort((a, b) => b.score - a.score).slice(0, 50)
    };
  }, [allPosts]);

  const myRank = useMemo(() => {
    if (!user || user.isAnonymous) return null;
    const index = rankingData.userRanking.findIndex(u => u.id === user.uid);
    return index !== -1 ? index + 1 : "unranked";
  }, [rankingData, user]);

  const activePostForComment = useMemo(() => allPosts.find(p => p.id === selectedPostIdForComment), [allPosts, selectedPostIdForComment]);

  // 핸들러 함수들
  const goToButler = (butlerId, butlerName) => {
    setSelectedButler({ id: butlerId, name: butlerName });
    setView('butler_profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLike = async (postId, likes = []) => {
    if (!user) { setIsLoginModalOpen(true); return; }
    if (postId.startsWith('d')) {
      const isLiked = likes.includes(user.uid);
      setDummyPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: isLiked ? p.likes.filter(id => id !== user.uid) : [...p.likes, user.uid] } : p));
      return;
    }
    const postRef = doc(db, 'artifacts', appId, 'public', 'data', 'posts', postId);
    const isLiked = likes.includes(user.uid);
    await updateDoc(postRef, { likes: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid) });
  };

  const handleAddComment = async (postId, text) => {
    if (!user) { setIsLoginModalOpen(true); return; }
    const newComment = { name: profile?.nickname || user.displayName || '집사', text, createdAt: Date.now() };
    if (postId.startsWith('d')) {
      setDummyPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: [...(p.comments || []), newComment] } : p));
    } else {
      const postRef = doc(db, 'artifacts', appId, 'public', 'data', 'posts', postId);
      await updateDoc(postRef, { comments: arrayUnion(newComment) });
    }
    showToast("댓글을 남겼습니다! 🐾");
  };

  const handleSavePost = async (newPost) => {
    if (!user || user.isAnonymous) { setIsLoginModalOpen(true); return; }
    const postsRef = collection(db, 'artifacts', appId, 'public', 'data', 'posts');
    await addDoc(postsRef, { ...newPost, authorId: user.uid, authorName: profile?.nickname || user.displayName || '집사', likes: [], comments: [], createdAt: serverTimestamp() });
    setIsCreateModalOpen(false);
    setView('feed');
    showToast("게시되었습니다! ✨");
  };

  const handleSaveProfile = async (profileData) => {
    if (!user) return;
    try {
      const cleanedPets = profileData.pets.filter(p => p.name.trim() !== '');
      const finalData = { ...profileData, pets: cleanedPets };
      const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'info');
      await setDoc(profileRef, { ...finalData, updatedAt: serverTimestamp() });
      setProfile(finalData);
      setView('feed');
      showToast("정보가 저장되었습니다! 🐾");
    } catch (err) { console.error(err); }
  };

  // 뷰 필터링
  const filteredPosts = allPosts.filter(post => {
    if (view === 'my_page') {
      if (activeProfileTab === 'gallery') return post.authorId === user?.uid;
      if (activeProfileTab === 'activity') return (post.likes || []).includes(user?.uid);
    }
    if (view === 'butler_profile') return post.authorId === selectedButler?.id;
    if (view === 'search') {
      const searchLower = searchTerm.toLowerCase();
      return (post.caption || "").toLowerCase().includes(searchLower) || (post.authorName || "").toLowerCase().includes(searchLower);
    }
    return true;
  });

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#FDFCF8]">
      <div className="flex flex-col items-center">
        <PawPrint className="w-16 h-16 text-orange-400 animate-bounce mb-4" />
        <p className="text-stone-800 font-black text-2xl tracking-tighter italic mb-1 leading-none">Petmily</p>
        <p className="text-stone-400 font-black text-sm animate-pulse">{loadingMessage}</p>
      </div>
    </div>
  );

  const isMainView = ['feed', 'search', 'leaderboard', 'my_page', 'butler_profile'].includes(view);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#FDFCF8] pb-32 font-sans text-stone-800 shadow-2xl overflow-x-hidden text-left border-x border-gray-100 relative selection:bg-orange-100">
      
      {toast.visible && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 duration-300">
          <div className="bg-stone-900/90 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 border border-white/10">
            <CheckCircle2 size={16} className="text-orange-400" />
            <span className="text-xs font-bold tracking-tight">{toast.message}</span>
          </div>
        </div>
      )}

      {/* 인앱 브라우저 탈출 모달 */}
      {isInAppBrowser && (
        <div className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-8 text-center shadow-2xl border-t-8 border-orange-500 max-w-[320px]">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6"><ExternalLink className="text-orange-500" size={32} /></div>
            <h2 className="text-xl font-black mb-3 tracking-tight text-stone-800 leading-none">외부 브라우저 권장</h2>
            <p className="text-stone-500 text-sm leading-relaxed mb-8">인앱 브라우저에서는 <b>구글 로그인</b>이 제한되어 서비스 이용이 어려워요!<br/><span className="text-orange-600 font-bold underline decoration-orange-200">크롬이나 사파리</span>로 다시 열까요?</p>
            <div className="space-y-3">
              <button onClick={() => { const url = window.location.href; window.location.href = `googlechrome://navigate?url=${url}`; setTimeout(() => { window.location.href = url; }, 500); }} className="w-full bg-orange-500 text-white py-4 rounded-2xl font-black text-sm active:scale-95 transition-all shadow-lg">브라우저로 바로가기</button>
              <div className="text-[10px] text-stone-300 py-2 font-bold uppercase tracking-widest">상단 [ ⋮ ] {"->"} [다른 브라우저로 열기]</div>
              <button onClick={() => setIsInAppBrowser(false)} className="w-full bg-stone-100 text-stone-400 py-3 rounded-2xl font-black text-xs active:scale-95 transition-all">나중에 하기</button>
            </div>
          </div>
        </div>
      )}

      {isMainView && (
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md px-5 py-4 border-b border-gray-100 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-3">
            {view !== 'feed' && (
              <button onClick={() => setView('feed')} className="p-2 hover:bg-stone-100 rounded-full transition-all active:scale-90"><ArrowLeft size={22} /></button>
            )}
            <div className="flex flex-col cursor-pointer" onClick={() => setView('feed')}>
               <h1 className="text-2xl font-black text-stone-800 tracking-tighter italic leading-none">Petmily</h1>
               {view === 'feed' && (
                  <div onClick={(e) => { e.stopPropagation(); setView('leaderboard'); }} className="flex items-center gap-1 mt-0.5 cursor-pointer group">
                    <Trophy size={10} className="text-orange-500 fill-orange-500" />
                    <span className="text-[9px] font-black text-orange-600 tracking-tight uppercase group-hover:underline">{myRank === 'unranked' || !myRank ? '명예의 전당' : `${myRank}위`}</span>
                    <ChevronRight size={10} className="text-orange-400" />
                  </div>
               )}
            </div>
          </div>
          <button onClick={() => setView('profile_edit')} className="p-2 bg-stone-50 rounded-full text-stone-600 border border-stone-100 transition-all active:scale-90"><Settings size={20} /></button>
        </header>
      )}

      <main className="px-0 space-y-4 mt-2">
        {view === 'feed' && (
          filteredPosts.map(post => (
            <PostCard 
              key={post.id} 
              post={post} 
              currentUser={user} 
              onLike={() => handleLike(post.id, post.likes)} 
              onCommentClick={() => { setSelectedPostIdForComment(post.id); setIsCommentModalOpen(true); }}
              onButlerClick={() => goToButler(post.authorId, post.authorName)}
            />
          ))
        )}
        
        {view === 'search' && (
          <div className="px-5 space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center gap-3 bg-white border border-stone-200 rounded-[2rem] p-5 shadow-lg focus-within:ring-4 focus-within:ring-orange-100 transition-all">
              <Search size={22} className="text-stone-400" />
              <input type="text" placeholder="친구 닉네임이나 내용 검색..." className="w-full text-sm outline-none font-bold bg-transparent placeholder:text-stone-300" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3 pb-20">
              {filteredPosts.map(post => (
                <div key={post.id} onClick={() => { setView('feed'); setTimeout(() => { document.getElementById(`post-${post.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 100); }} className="aspect-square rounded-3xl overflow-hidden shadow-md cursor-pointer active:scale-95 transition-transform border border-stone-50"><img src={post.imageUrl} className="w-full h-full object-cover" alt="search result" /></div>
              ))}
            </div>
          </div>
        )}

        {view === 'leaderboard' && (
          <div className="px-5 space-y-8 animate-in slide-in-from-bottom-4 pb-20 text-left">
            <div className="text-center py-6"><h2 className="text-3xl font-black italic tracking-tighter text-stone-800 leading-none">명예의 전당</h2><p className="text-stone-400 text-[10px] font-black uppercase tracking-widest mt-1">Best Pet Moments</p></div>
            
            {/* 베스트 포스트 랭킹 (이미지 비주얼 유지!) */}
            <section className="space-y-4">
              <h3 className="text-[12px] font-black text-stone-400 uppercase tracking-widest px-2 mb-4 flex items-center gap-2">🏅 베스트 모먼트</h3>
              <div className="grid grid-cols-2 gap-4">
                {rankingData.postRanking.map((post, idx) => (
                  <div key={post.id} onClick={() => { setView('feed'); setTimeout(() => document.getElementById(`post-${post.id}`)?.scrollIntoView({behavior: 'smooth', block: 'center'}), 100); }} className="group relative aspect-[4/5] rounded-[2.5rem] overflow-hidden border-2 border-stone-100 cursor-pointer hover:border-orange-400 transition-all shadow-lg active:scale-95">
                    <img src={post.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="best post" />
                    <div className={`absolute top-4 left-4 backdrop-blur-md px-3 py-1 rounded-full text-white text-[11px] font-black shadow-xl ${idx < 3 ? 'bg-orange-500' : 'bg-black/60'}`}>#{idx + 1}</div>
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-10">
                      <p className="text-[11px] text-white font-black truncate mb-0.5">{post.authorName}</p>
                      <p className="text-[10px] text-orange-400 font-bold flex items-center gap-1"><PawPrint size={10} className="fill-current" /> {post.score} 꾹</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 명예 집사 랭킹 */}
            <section className="space-y-4 mt-12">
               <h3 className="text-[12px] font-black text-stone-400 uppercase tracking-widest px-2 mb-4 flex items-center gap-2">👑 명예 집사</h3>
               {rankingData.userRanking.map((rankUser, idx) => (
                 <div key={idx} onClick={() => goToButler(rankUser.id, rankUser.name)} className="flex items-center gap-4 p-5 rounded-[2.5rem] bg-white border border-stone-100 shadow-sm transition-all hover:bg-orange-50 cursor-pointer active:scale-95">
                   <div className="w-8 text-center font-black italic text-stone-800 text-lg">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}</div>
                   <div className="w-12 h-12 rounded-full bg-stone-100 border-2 border-white overflow-hidden shadow-md flex-shrink-0"><img src={`https://api.dicebear.com/7.x/initials/svg?seed=${rankUser.name}`} alt="avatar" /></div>
                   <div className="flex-1"><p className="font-black text-sm text-stone-800 flex items-center gap-1">{rankUser.name} {idx < 3 && <Crown size={12} className="text-orange-500 fill-orange-500" />}</p><p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Top Butler</p></div>
                   <div className="text-right"><p className="text-xs font-black text-orange-500 bg-orange-50 px-4 py-2 rounded-full border border-orange-100 shadow-sm">{rankUser.score} 꾹</p></div>
                 </div>
               ))}
            </section>
          </div>
        )}

        {(view === 'my_page' || view === 'butler_profile') && (
          <div className="px-5 space-y-6 pb-20 animate-in slide-in-from-bottom-4 text-left">
            <div className="bg-stone-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden ring-4 ring-white/5">
              <div className="relative z-10">
                <h2 className="text-2xl font-black italic tracking-tighter mb-1">{view === 'my_page' ? (profile?.nickname || '집사') : selectedButler?.name}님의 공간</h2>
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-[0.3em]">Total {filteredPosts.length} Treasures</p>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl"></div>
            </div>

            {/* 통합 뷰 탭 스위치 (다른 집사 프로필에선 갤러리만 고정) */}
            {view === 'my_page' && (
              <div className="flex p-1.5 bg-stone-100 rounded-[1.8rem] gap-2 border border-stone-50 shadow-inner">
                <button 
                  onClick={() => setActiveProfileTab('activity')} 
                  className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[1.2rem] font-black text-sm transition-all duration-300 ${activeProfileTab === 'activity' ? 'bg-white text-orange-500 shadow-lg scale-100' : 'text-stone-400 scale-95 hover:text-stone-600'}`}
                >
                  <PawPrint size={18} className={activeProfileTab === 'activity' ? 'fill-orange-500' : ''} /> 내가 꾹한 글
                </button>
                <button 
                  onClick={() => setActiveProfileTab('gallery')} 
                  className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[1.2rem] font-black text-sm transition-all duration-300 ${activeProfileTab === 'gallery' ? 'bg-white text-orange-500 shadow-lg scale-100' : 'text-stone-400 scale-95 hover:text-stone-600'}`}
                >
                  <ImageIcon size={18} /> 내 보물함
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {filteredPosts.length === 0 ? (
                <div className="col-span-2 py-32 text-center bg-white/50 rounded-[3rem] border border-dashed border-stone-200">
                  <Camera className="mx-auto text-stone-200 mb-4" size={48} />
                  <p className="text-stone-300 font-bold">아직 사진이 없어요 🐾</p>
                </div>
              ) : (
                filteredPosts.map(post => (
                  <div key={post.id} onClick={() => { setView('feed'); setTimeout(() => { document.getElementById(`post-${post.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 100); }} className="aspect-square rounded-[2rem] overflow-hidden shadow-md active:scale-95 transition-transform border border-stone-100"><img src={post.imageUrl} className="w-full h-full object-cover" alt="post" /></div>
                ))
              )}
            </div>
          </div>
        )}

        {(view === 'profile_setup' || view === 'profile_edit') && (
          <ProfileForm isEdit={view === 'profile_edit'} initialData={profile} onSave={handleSaveProfile} onBack={() => setView('feed')} onLogout={() => { signOut(auth); window.location.reload(); }} />
        )}
      </main>

      {/* 하단 네비게이션 - 5버튼 슬림 & 플로팅 디자인 */}
      {isMainView && (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[380px] bg-stone-900/95 backdrop-blur-xl px-2 py-3 rounded-[2.2rem] flex justify-between items-center shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] z-[100] border border-white/10 ring-1 ring-white/5 animate-in slide-in-from-bottom-4 duration-500">
          <button onClick={() => setView('feed')} className={`flex-1 flex flex-col items-center gap-1 transition-all active:scale-75 ${view === 'feed' ? 'text-white' : 'text-stone-500'}`}><Home size={20} /><span className="text-[8px] font-black uppercase tracking-tighter leading-none">홈</span></button>
          <button onClick={() => setView('search')} className={`flex-1 flex flex-col items-center gap-1 transition-all active:scale-75 ${view === 'search' ? 'text-white' : 'text-stone-500'}`}><Search size={20} /><span className="text-[8px] font-black uppercase tracking-tighter leading-none">찾기</span></button>
          
          <div className="flex-1 flex justify-center">
            <button onClick={() => user.isAnonymous ? setIsLoginModalOpen(true) : setIsCreateModalOpen(true)} className="bg-gradient-to-br from-orange-400 to-orange-600 text-white p-3.5 rounded-2xl shadow-[0_10px_20px_-5px_rgba(249,115,22,0.5)] border-2 border-white/10 active:scale-75 transition-transform"><PlusSquare size={24} /></button>
          </div>
          
          <button onClick={() => { setView('my_page'); setActiveProfileTab('activity'); }} className={`flex-1 flex flex-col items-center gap-1 transition-all active:scale-75 ${view === 'my_page' && activeProfileTab === 'activity' ? 'text-white' : 'text-stone-500'}`}><PawPrint size={20} /><span className="text-[8px] font-black uppercase tracking-tighter leading-none">꾹</span></button>
          <button onClick={() => { setView('my_page'); setActiveProfileTab('gallery'); }} className={`flex-1 flex flex-col items-center gap-1 transition-all active:scale-75 ${view === 'my_page' && activeProfileTab === 'gallery' ? 'text-white' : 'text-stone-500'}`}><User size={20} /><span className="text-[8px] font-black uppercase tracking-tighter leading-none">보물함</span></button>
        </nav>
      )}

      {/* 모달들 */}
      {isCreateModalOpen && <CreateModal onClose={() => setIsCreateModalOpen(false)} onSave={handleSavePost} userName={profile?.nickname || user?.displayName || ''} />}
      {isLoginModalOpen && <LoginModal onClose={() => setIsLoginModalOpen(false)} onLogin={async () => { const provider = new GoogleAuthProvider(); try { await signInWithPopup(auth, provider); setIsLoginModalOpen(false); showToast("로그인 성공!"); } catch(e) { console.error(e); }}} />}
      {isCommentModalOpen && <CommentModal post={activePostForComment} onClose={() => {setIsCommentModalOpen(false); setSelectedPostIdForComment(null);}} onAddComment={handleAddComment} />}
    </div>
  );
}

function PostCard({ post, currentUser, onLike, onCommentClick, onButlerClick }) {
  const [showOverlayPaw, setShowOverlayPaw] = useState(false);
  const isLiked = (post.likes || []).includes(currentUser?.uid);

  const handleDoubleClick = () => {
    onLike();
    setShowOverlayPaw(true);
    setTimeout(() => setShowOverlayPaw(false), 800);
  };

  const handleBtnClick = () => {
    onLike();
    if (!isLiked) {
      setShowOverlayPaw(true);
      setTimeout(() => setShowOverlayPaw(false), 800);
    }
  };

  return (
    <div id={`post-${post.id}`} className="bg-white mb-2 shadow-sm border-b border-stone-50 animate-in fade-in duration-500 text-left">
      <div className="px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={onButlerClick}>
          <div className="w-10 h-10 rounded-full bg-stone-100 overflow-hidden border-2 border-white shadow-sm ring-1 ring-stone-100 flex-shrink-0 group-hover:ring-orange-200 transition-all">
             <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${post.authorName}`} alt="owner" />
          </div>
          <span className="font-black text-[14px] text-stone-800 tracking-tight leading-none group-hover:text-orange-500 transition-colors">{post.authorName}</span>
        </div>
      </div>
      <div className="relative overflow-hidden aspect-square bg-stone-50 cursor-pointer" onDoubleClick={handleDoubleClick}>
        <img src={post.imageUrl} className="w-full h-full object-cover transition-transform duration-[1.5s] hover:scale-105" alt="pet" />
        {showOverlayPaw && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-in zoom-in fade-out duration-700">
            <PawPrint size={100} className="text-orange-500/60 fill-orange-500" />
          </div>
        )}
      </div>
      <div className="px-5 py-5">
        <div className="flex gap-6 mb-4 items-center">
          <PawPrint onClick={handleBtnClick} size={32} className={`cursor-pointer transition-all active:scale-150 ${isLiked ? 'fill-orange-500 text-orange-500 drop-shadow-md' : 'text-stone-800 hover:text-orange-400'}`} />
          <MessageSquare onClick={onCommentClick} size={30} className="text-stone-800 cursor-pointer active:scale-125 transition-transform hover:text-indigo-500" />
          <Send size={28} className="text-stone-800 ml-auto opacity-20" />
        </div>
        <p className="text-[12px] font-black text-stone-400 mb-2 uppercase tracking-tighter leading-none">{(post.likes || []).length} Awesome Pet Lovers 꾹!</p>
        <p className="text-sm leading-relaxed">
          <span className="font-black mr-2 text-stone-900 cursor-pointer hover:underline" onClick={onButlerClick}>{post.authorName}</span>
          <span className="text-stone-600 font-bold tracking-tight">{post.caption}</span>
        </p>
        {post.comments?.length > 0 && (
           <p onClick={onCommentClick} className="text-[13px] text-stone-300 font-bold mt-2 cursor-pointer hover:text-stone-400 transition-colors tracking-tight italic">댓글 {post.comments.length}개 모두 보기...</p>
        )}
      </div>
    </div>
  );
}

function ProfileForm({ isEdit, initialData, onSave, onBack, onLogout }) {
  const [nickname, setNickname] = useState(initialData?.nickname || '');
  const [pets, setPets] = useState(initialData?.pets || []);
  const PET_OPTIONS = [
    { id: '강아지', label: '산책 광인', icon: <Dog size={16}/>, color: 'bg-amber-100 text-amber-700' },
    { id: '고양이', label: '지구 정복자', icon: <Cat size={16}/>, color: 'bg-indigo-100 text-indigo-700' },
    { id: '새', label: '요정', icon: <Bird size={16}/>, color: 'bg-sky-100 text-sky-700' },
    { id: '햄스터', label: '간식 도둑', icon: <Sparkles size={16}/>, color: 'bg-rose-100 text-rose-700' },
    { id: '기타', label: '포켓몬', icon: <Ghost size={16}/>, color: 'bg-stone-100 text-stone-700' },
  ];
  const addPet = () => setPets([...pets, { id: Date.now(), name: '', type: '강아지', customType: '' }]);
  const removePet = (id) => setPets(pets.filter(p => p.id !== id));
  const updatePet = (id, field, value) => setPets(pets.map(p => p.id === id ? { ...p, [field]: value } : p));
  return (
    <div className="min-h-screen bg-white p-8 animate-in fade-in duration-500 pb-40 text-left">
      <div className="flex justify-between items-center mb-14"><button onClick={onBack} className="p-3.5 bg-stone-50 rounded-full hover:bg-stone-100 transition-all active:scale-90"><ArrowLeft size={24} /></button><h2 className="text-3xl font-black text-stone-800 tracking-tighter italic leading-none">설정</h2><div className="w-10" /></div>
      <div className="space-y-12">
        <section><label className="text-[12px] font-black text-stone-300 block mb-5 px-1 uppercase tracking-[0.3em] leading-none">Butler Name</label><input type="text" placeholder="집사 닉네임 입력" className="w-full bg-stone-50 border-none rounded-[1.8rem] p-6 text-base outline-none transition-all font-black shadow-inner focus:ring-4 focus:ring-orange-100" value={nickname} onChange={(e) => setNickname(e.target.value)} /></section>
        <section className="space-y-8">
          <div className="flex justify-between items-center px-1"><label className="text-[12px] font-black text-stone-300 uppercase tracking-[0.3em] leading-none">Family ({pets.length})</label><button onClick={addPet} className="flex items-center gap-2 text-[11px] font-black text-orange-500 bg-orange-50 px-5 py-2.5 rounded-full shadow-sm active:scale-95 transition-all"><Plus size={16} />아이 추가</button></div>
          {pets.length === 0 && <div className="p-10 border-2 border-dashed border-stone-100 rounded-[3rem] text-center"><Sparkles className="mx-auto text-orange-200 mb-4" size={32} /><p className="text-stone-300 font-bold text-sm leading-relaxed">아직 아이가 없으신가요?<br/>나중에 천천히 등록해도 괜찮아요! ✨</p></div>}
          {pets.map((pet, idx) => (
            <div key={pet.id} className="p-7 bg-stone-50/80 border border-stone-100 rounded-[3rem] space-y-6 relative animate-in zoom-in-95 shadow-sm">
              <button onClick={() => removePet(pet.id)} className="absolute top-6 right-6 p-2.5 text-stone-300 hover:text-red-400 transition-colors active:scale-75"><Trash2 size={20}/></button>
              <div className="flex items-center gap-4"><div className="w-10 h-10 bg-stone-900 text-white rounded-[1.2rem] flex items-center justify-center font-black text-sm shadow-lg">{idx + 1}</div><input type="text" placeholder="아이 이름" className="bg-transparent border-b-2 border-stone-100 focus:border-orange-400 outline-none text-lg font-black p-1 w-full transition-all" value={pet.name} onChange={(e) => updatePet(pet.id, 'name', e.target.value)} /></div>
              <div className="flex flex-wrap gap-2.5">{PET_OPTIONS.map(opt => (<button key={opt.id} onClick={() => updatePet(pet.id, 'type', opt.id)} className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-[11px] font-black transition-all border-2 active:scale-95 ${pet.type === opt.id ? `${opt.color} border-current scale-105 shadow-md shadow-orange-100` : 'bg-white text-stone-400 border-stone-100'}`}>{opt.icon}<span>{opt.label}</span></button>))}</div>
            </div>
          ))}
        </section>
        <button onClick={() => onSave({ nickname, pets })} disabled={!nickname} className="w-full bg-stone-900 text-white py-6 rounded-[2.5rem] font-black shadow-2xl active:scale-95 transition-all disabled:bg-stone-200 disabled:text-stone-400 uppercase tracking-[0.2em] text-[15px] leading-none">저장하고 시작하기</button>
        {isEdit && <button onClick={onLogout} className="w-full py-4 text-stone-300 font-black text-[13px] flex items-center justify-center gap-2 mt-6 hover:text-red-500 transition-colors active:scale-90 underline underline-offset-8 uppercase tracking-widest leading-none">로그아웃</button>}
      </div>
    </div>
  );
}

function CreateModal({ onClose, onSave, userName }) {
  const [desc, setDesc] = useState('');
  const [imgData, setImgData] = useState('');
  const fileInputRef = useRef(null);
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImgData(reader.result);
      reader.readAsDataURL(file);
    }
  };
  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white rounded-t-[3.5rem] p-10 animate-in slide-in-from-bottom duration-500 shadow-2xl max-h-[95vh] overflow-y-auto text-left">
        <div className="flex justify-between items-center mb-10"><h2 className="text-3xl font-black text-stone-800 tracking-tighter italic leading-none">새 글 작성 🐾</h2><button onClick={onClose} className="p-3.5 bg-stone-100 rounded-full text-stone-400 hover:bg-stone-200 transition-all active:scale-90"><X size={22} /></button></div>
        <div className="space-y-10">
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
          {imgData ? (<div className="relative aspect-square rounded-[3rem] overflow-hidden border-8 border-stone-50 shadow-2xl group"><img src={imgData} className="w-full h-full object-cover" alt="preview" /><button onClick={() => setImgData('')} className="absolute top-6 right-6 p-4 bg-black/60 text-white rounded-full backdrop-blur-md transition-all active:scale-90 shadow-lg"><X size={18} /></button></div>) : (<div onClick={() => fileInputRef.current.click()} className="w-full aspect-square bg-stone-50 rounded-[3.5rem] border-4 border-dashed border-stone-200 flex flex-col items-center justify-center cursor-pointer hover:bg-stone-100 transition-all gap-5 active:scale-95 group"><div className="p-7 bg-white rounded-full shadow-2xl text-orange-500 group-hover:scale-110 transition-transform"><Upload size={40} /></div><p className="text-lg font-black text-stone-500 tracking-tight leading-none">사진첩 열기</p></div>)}
          <textarea rows="3" placeholder="아이의 매력을 한마디로!" className="w-full bg-stone-50 rounded-[1.8rem] p-6 text-base outline-none resize-none shadow-inner font-black focus:ring-4 focus:ring-orange-100 transition-all border-none" value={desc} onChange={(e) => setDesc(e.target.value)} />
          <button onClick={() => onSave({ caption: desc, imageUrl: imgData })} disabled={!desc || !imgData} className="w-full bg-stone-900 text-white py-7 rounded-[2.5rem] font-black shadow-2xl active:scale-95 transition-all mb-4 uppercase tracking-[0.3em] text-[15px] leading-none">게시하기</button>
        </div>
      </div>
    </div>
  );
}

function CommentModal({ post, onClose, onAddComment }) {
  const [text, setText] = useState('');
  if (!post) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white rounded-t-[4rem] p-10 animate-in slide-in-from-bottom duration-500 flex flex-col h-[90vh] shadow-2xl text-left">
        <div className="flex justify-between items-center mb-10"><div className="flex items-center gap-3"><MessageCircle size={26} className="text-indigo-500" /><h3 className="text-2xl font-black text-stone-800 tracking-tighter italic leading-none">이야기 나누기</h3></div><button onClick={onClose} className="p-3.5 bg-stone-100 rounded-full text-stone-400 hover:bg-stone-200 transition-all active:scale-90"><X size={22} /></button></div>
        <div className="flex-1 overflow-y-auto space-y-8 px-2 pb-10">
          {(!post.comments || post.comments.length === 0) ? (<div className="text-center py-32"><Sparkles className="mx-auto text-stone-100 mb-6" size={64} /><p className="text-stone-300 font-black italic text-xl leading-snug tracking-tight">첫 응원을 남겨보세요! 🐾</p></div>) : (post.comments.map((c, i) => (<div key={i} className="flex gap-5 animate-in fade-in slide-in-from-left-3 duration-300"><div className="w-11 h-11 rounded-full bg-stone-50 flex-shrink-0 overflow-hidden border border-stone-100 shadow-sm"><img src={`https://api.dicebear.com/7.x/initials/svg?seed=${c.name}`} alt="av" /></div><div className="flex-1"><div className="bg-stone-50 p-5 rounded-[2rem] rounded-tl-none shadow-sm"><p className="text-[12px] font-black text-stone-400 mb-1 uppercase tracking-widest leading-none">{c.name}</p><p className="text-[15px] text-stone-800 font-bold leading-relaxed">{c.text}</p></div></div></div>)))}
        </div>
        <div className="pt-8 border-t border-stone-100 flex gap-4 pb-12"><input type="text" placeholder="따뜻한 한마디..." className="flex-1 bg-stone-50 rounded-[2rem] px-8 py-5 text-[15px] outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-black border-none placeholder:text-stone-300" value={text} onChange={(e) => setText(e.target.value)} onKeyPress={(e) => { if(e.key === 'Enter' && text) { onAddComment(post.id, text); setText(''); }}} /><button onClick={() => { if(text) { onAddComment(post.id, text); setText(''); }}} className="bg-stone-900 text-white p-5 rounded-[2rem] shadow-xl active:scale-75 transition-transform"><Send size={26} /></button></div>
      </div>
    </div>
  );
}

function LoginModal({ onClose, onLogin }) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="w-[92%] max-w-sm bg-white rounded-[4rem] p-14 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 via-indigo-500 to-orange-400"></div>
        <div className="w-24 h-24 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 text-indigo-600 ring-8 ring-white"><Camera size={44} /></div>
        <h2 className="text-3xl font-black text-stone-800 mb-4 tracking-tighter uppercase italic leading-none">Welcome!</h2>
        <p className="text-stone-500 text-[14px] mb-12 leading-relaxed font-bold tracking-tight">로그인을 하시면 자랑스러운 우리 아이를<br/>명예의 전당에 올릴 수 있어요! 🐾</p>
        <div className="space-y-4">
           <button onClick={onLogin} className="w-full bg-indigo-600 text-white py-5 rounded-[2.5rem] font-black shadow-lg active:scale-95 transition-all text-lg tracking-tight uppercase border-none">Google 로그인</button>
           <button onClick={onClose} className="w-full py-4 text-stone-300 font-black text-[13px] uppercase tracking-[0.4em] hover:text-stone-500 transition-colors active:scale-90 leading-none">나중에 할게요</button>
        </div>
      </div>
    </div>
  );
}