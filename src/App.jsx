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
  getDoc 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
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
  MessageSquare
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

export default function App() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [view, setView] = useState('feed'); 
  const [loading, setLoading] = useState(true);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [toast, setToast] = useState({ message: '', visible: false });

  // 인앱 브라우저 감지 및 자동 전환 로직
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const isInApp = ua.indexOf('kakaotalk') > -1 || ua.indexOf('instagram') > -1 || ua.indexOf('line') > -1;
    
    if (isInApp) {
      setIsInAppBrowser(true);

      // 안드로이드: intent 스키마를 사용하여 크롬 브라우저 자동 호출 시도
      if (ua.match(/android/)) {
        const currentUrl = window.location.href.replace(/https?:\/\//, '');
        window.location.href = `intent://${currentUrl}#Intent;scheme=https;package=com.android.chrome;end`;
      }
      // iOS: 시스템 보안상 자동 전환이 불가능하므로 안내 모달을 띄움
    }
  }, []);

  const showToast = (msg) => {
    setToast({ message: msg, visible: true });
    setTimeout(() => setToast({ message: '', visible: false }), 2500);
  };

  const loadingMessage = useMemo(() => {
    const messages = ["가족들을 부르는 중...", "기다려! 하는 중...", "꼬리 흔드는 중...", "발도장 찍는 중..."];
    return messages[Math.floor(Math.random() * messages.length)];
  }, [loading]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (!u) {
        signInAnonymously(auth).catch(console.error);
      } else {
        setUser(u);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const postsRef = collection(db, 'artifacts', appId, 'public', 'data', 'posts');
    const unsubscribe = onSnapshot(postsRef, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      postsData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setPosts(postsData);
    });
    return () => unsubscribe();
  }, [user]);

  const handleLike = async (postId, likes = []) => {
    if (!user) return;
    const postRef = doc(db, 'artifacts', appId, 'public', 'data', 'posts', postId);
    const isLiked = likes.includes(user.uid);
    await updateDoc(postRef, { 
      likes: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid) 
    });
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#FDFCF8]">
      <div className="flex flex-col items-center">
        <PawPrint className="w-16 h-16 text-orange-400 animate-bounce mb-4" />
        <p className="text-stone-500 font-black text-xl animate-pulse">{loadingMessage}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#FDFCF8] pb-32 font-sans text-stone-800 shadow-2xl overflow-x-hidden text-left border-x border-gray-100 relative">
      
      {toast.visible && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 duration-300">
          <div className="bg-stone-900/90 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2">
            <CheckCircle2 size={16} className="text-orange-400" />
            <span className="text-xs font-bold">{toast.message}</span>
          </div>
        </div>
      )}

      {/* 인앱 브라우저 탈출 안내 모달 (iOS 및 자동 전환 실패 대비) */}
      {isInAppBrowser && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-8 text-center shadow-2xl border-t-8 border-orange-500 max-w-[320px]">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ExternalLink className="text-orange-500" size={32} />
            </div>
            <h2 className="text-xl font-black mb-3 tracking-tight text-stone-800">외부 브라우저로 연결</h2>
            <p className="text-stone-500 text-sm leading-relaxed mb-8">
              인앱 브라우저에서는 <b>구글 로그인</b>이<br/>
              제한되어 서비스 이용이 어려워요!<br/>
              <span className="text-orange-600 font-bold underline decoration-orange-200">크롬이나 사파리</span>로 다시 열까요?
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => {
                  const url = window.location.href;
                  // 모바일 브라우저별 강제 이동 시도
                  window.location.href = `googlechrome://navigate?url=${url}`;
                  setTimeout(() => {
                    window.location.href = url;
                  }, 500);
                }}
                className="w-full bg-orange-500 text-white py-4 rounded-2xl font-black text-sm active:scale-95 transition-all shadow-lg shadow-orange-100"
              >
                브라우저로 바로가기
              </button>
              <div className="text-[10px] text-stone-300 py-2 font-bold uppercase tracking-widest">
                상단 [ ⋮ ] {"->"} [다른 브라우저로 열기]
              </div>
              <button 
                onClick={() => setIsInAppBrowser(false)}
                className="w-full bg-stone-100 text-stone-400 py-3 rounded-2xl font-black text-xs active:scale-95 transition-all"
              >
                나중에 하기
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md px-5 py-4 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-2" onClick={() => setView('feed')}>
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center rotate-3 shadow-lg shadow-orange-200">
            <PawPrint size={18} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-stone-800 tracking-tighter italic leading-none">Petgram</h1>
        </div>
        <button onClick={() => setView('profile_edit')} className="p-2 bg-stone-50 rounded-full text-stone-600 border border-stone-100 shadow-sm transition-all active:scale-90"><Settings size={20} /></button>
      </header>

      {view === 'feed' && (
        <main className="px-0 space-y-4 mt-2">
          {posts.length === 0 ? (
            <div className="text-center py-40 px-10">
              <Camera className="text-stone-200 mx-auto mb-4" size={48} />
              <p className="text-stone-400 font-bold">아직 소식이 없어요!</p>
            </div>
          ) : (
            posts.map(post => (
              <PostCard 
                key={post.id} 
                post={post} 
                currentUser={user} 
                onLike={() => handleLike(post.id, post.likes)} 
              />
            ))
          )}
        </main>
      )}

      {view === 'profile_edit' && (
        <div className="p-10 text-center animate-in fade-in slide-in-from-bottom-4">
          <h2 className="text-xl font-black mb-6 tracking-tight">집사 정보 설정</h2>
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 mb-8">
            <p className="text-stone-500 text-sm mb-4 font-bold">로그인 상태가 아닙니다.</p>
            <button className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-indigo-100">Google 로그인</button>
          </div>
          <button onClick={() => setView('feed')} className="text-stone-400 font-bold text-sm underline underline-offset-4">돌아가기</button>
        </div>
      )}

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[380px] bg-stone-900/95 backdrop-blur-xl rounded-[2rem] px-2 py-3 flex justify-between items-center shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] z-50 border border-white/10 ring-1 ring-white/5">
        <button onClick={() => setView('feed')} className={`flex-1 flex flex-col items-center gap-1 transition-all active:scale-75 ${view === 'feed' ? 'text-white' : 'text-stone-500'}`}>
          <Home size={20} />
          <span className="text-[8px] font-black uppercase tracking-tighter">홈</span>
        </button>
        <button className="flex-1 flex flex-col items-center gap-1 text-stone-500 transition-all active:scale-75">
          <Search size={20} />
          <span className="text-[8px] font-black uppercase tracking-tighter">찾기</span>
        </button>
        <div className="flex-1 flex justify-center">
          <button className="bg-gradient-to-br from-orange-400 to-orange-600 text-white p-3 rounded-2xl shadow-[0_10px_20px_-5px_rgba(249,115,22,0.5)] border-2 border-white/10 active:scale-75 transition-transform">
            <PlusSquare size={24} />
          </button>
        </div>
        <button className="flex-1 flex flex-col items-center gap-1 text-stone-500 transition-all active:scale-75">
          <PawPrint size={20} />
          <span className="text-[8px] font-black uppercase tracking-tighter">꾹</span>
        </button>
        <button className="flex-1 flex flex-col items-center gap-1 text-stone-500 transition-all active:scale-75">
          <User size={20} />
          <span className="text-[8px] font-black uppercase tracking-tighter">보물함</span>
        </button>
      </nav>
    </div>
  );
}

function PostCard({ post, currentUser, onLike }) {
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
    <div className="bg-white mb-2 shadow-sm border-b border-stone-50">
      <div className="px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-stone-100 overflow-hidden border-2 border-white shadow-sm ring-1 ring-stone-100">
             <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${post.authorName}`} alt="owner" />
          </div>
          <span className="font-black text-[14px] text-stone-800 tracking-tight">{post.authorName}</span>
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
        <div className="flex gap-6 mb-4">
          <PawPrint 
            onClick={handleBtnClick} 
            size={32} 
            className={`cursor-pointer transition-all active:scale-150 ${isLiked ? 'fill-orange-500 text-orange-500 drop-shadow-md' : 'text-stone-800'}`} 
          />
          <MessageSquare size={32} className="text-stone-800" />
        </div>
        <p className="text-[12px] font-black text-stone-400 mb-2 uppercase tracking-tighter">{(post.likes || []).length} Awesome Pet Lovers 꾹!</p>
        <p className="text-sm leading-relaxed">
          <span className="font-black mr-2 text-stone-900">{post.authorName}</span>
          <span className="text-stone-600 font-bold">{post.caption}</span>
        </p>
      </div>
    </div>
  );
}