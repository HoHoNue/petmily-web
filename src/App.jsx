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
  serverTimestamp 
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
  Settings,
  PawPrint,
  Image as ImageIcon,
  Upload,
  LogOut,
  ArrowLeft,
  ChevronRight,
  Trophy,
  Crown,
  Medal,
  MessageSquare,
  MessageCircle,
  Send, 
  Plus, 
  Trash2, 
  HeartHandshake, 
  Filter, 
  CheckCircle2, 
  Sparkles, 
  Dog, 
  Cat, 
  Bird, 
  Ghost, 
  X, 
  ExternalLink, 
  AlertCircle, 
  UserPlus, 
  UserCheck, 
  Info, 
  Camera,
  History,
  Zap,
  CameraIcon,
  Pencil,
  AlertTriangle,
  Loader2,
  LogIn,
  Mouse
} from 'lucide-react';

// --- 1. Firebase & Global Settings ---

const firebaseConfig = {
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
const appIdKey = 'petmily-prod-v9';

const PET_TYPES = [
  { id: 'all', label: '전체', icon: <Sparkles size={14}/> },
  { id: '강아지', label: '강아지', icon: <Dog size={14}/> },
  { id: '고양이', label: '고양이', icon: <Cat size={14}/> },
  { id: '새', label: '새', icon: <Bird size={14}/> },
  { id: '햄스터', label: '햄스터', icon: <Mouse size={14}/> },
  { id: '기타', label: '기타', icon: <Ghost size={14}/> },
];

const MORE_LOADING_MESSAGES = ["꾹꾹이 중... 🐾", "간식 기다리는 중... 🍖", "냄새 맡는 중... 👃", "발바닥 젤리 충전 중... ⚡"];

const DEFAULT_PROFILE = { nickname: '', pets: [], following: [], profilePic: '' };

const handleImgError = (e) => {
  e.target.src = "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=petmily&backgroundColor=fdfcf8";
};

// 20 Unique High Quality Pet Images
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

// --- 2. Components ---

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(error) { return { hasError: true }; }
  render() {
    if (this.state.hasError) return (
      <div className="h-screen flex flex-col items-center justify-center p-10 text-center bg-[#FDFCF8]">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">시스템 복구 중... 🐾</h2>
        <p className="text-stone-500 text-sm mb-6">오류가 발생했습니다. 새로고침으로 다시 시도하세요.</p>
        <button onClick={() => window.location.reload()} className="px-8 py-3.5 bg-stone-900 text-white rounded-full font-bold">새로고침</button>
      </div>
    );
    return this.props.children;
  }
}

function ImageWithFallback({ src, className, alt }) {
  const [error, setError] = useState(false);
  if (error) {
    return (
      <div className={`${className} flex flex-col items-center justify-center bg-stone-100 text-stone-300 gap-2 border border-stone-50 font-bold`}>
        <AlertTriangle size={32} />
        <span className="text-[10px]">사진을 불러올 수 없어요 🐾</span>
      </div>
    );
  }
  return <img src={src} className={className} alt={alt} onError={() => setError(true)} />;
}

function PostCard({ post, currentUser, myProfile, onLike, onDelete, onCommentClick, onButlerClick, onShareClick }) {
  const [showOverlayPaw, setShowOverlayPaw] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isLiked = (post.likes || []).includes(currentUser?.uid);
  const isOwner = post.authorId === currentUser?.uid;
  const authorImage = isOwner && myProfile?.profilePic ? myProfile.profilePic : (post.authorPhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${post.authorName}`);

  return (
    <div id={`post-${post.id}`} className="bg-white mb-2 shadow-sm border-b border-stone-50 animate-in fade-in duration-500 text-left relative overflow-hidden font-bold">
      <div className="px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={onButlerClick}>
          <div className="w-10 h-10 rounded-full bg-stone-100 overflow-hidden border-2 border-white shadow-sm flex-shrink-0 group-hover:ring-orange-200 transition-all">
            <img src={authorImage} alt="av" className="w-full h-full object-cover" onError={handleImgError} />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-[14px] text-stone-800 tracking-tight leading-none group-hover:text-orange-500">{post.authorName}</span>
            {post.petType && <span className="text-[10px] text-stone-300 font-bold mt-1 leading-none">#{post.petType}</span>}
          </div>
        </div>
        {isOwner && (
          <div className="relative">
            <button onClick={() => setShowDeleteConfirm(!showDeleteConfirm)} className="p-2 text-stone-200 hover:text-red-400 active:scale-90"><Trash2 size={18} /></button>
            {showDeleteConfirm && (
              <div className="absolute right-0 top-full mt-2 z-50 bg-white border border-stone-100 shadow-2xl rounded-2xl p-4 w-40 animate-in zoom-in-95 duration-200">
                <p className="text-[10px] font-black text-stone-400 mb-3 leading-tight text-center">정말 삭제하시겠어요?</p>
                <div className="flex gap-2 font-bold"><button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2 bg-stone-50 text-stone-400 text-[10px] rounded-lg">취소</button><button onClick={() => { onDelete(); setShowDeleteConfirm(false); }} className="flex-1 py-2 bg-red-500 text-white text-[10px] rounded-lg">삭제</button></div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="relative overflow-hidden aspect-square bg-stone-50 cursor-pointer" onDoubleClick={() => { onLike(); setShowOverlayPaw(true); setTimeout(() => setShowOverlayPaw(false), 800); }}>
        <ImageWithFallback src={post.imageUrl} className="w-full h-full object-cover transition-transform duration-[1.5s] hover:scale-105" alt="pet" />
        {showOverlayPaw && <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-in zoom-in fade-out duration-700"><PawPrint size={100} className="text-orange-500/60 fill-orange-500" /></div>}
      </div>

      <div className="px-5 py-5 font-bold">
        <div className="flex gap-5 mb-4 items-center font-bold">
          <PawPrint onClick={onLike} size={32} className={`cursor-pointer transition-all active:scale-150 ${isLiked ? 'fill-orange-500 text-orange-500 drop-shadow-md' : 'text-stone-800 hover:text-orange-400'}`} />
          <MessageSquare onClick={onCommentClick} size={30} className="text-stone-800 cursor-pointer active:scale-125 transition-transform hover:text-indigo-500" />
          <Send onClick={onShareClick} size={28} className="text-stone-800 ml-auto opacity-50 hover:opacity-100 cursor-pointer active:scale-125 transition-all" />
        </div>
        <p className="text-[12px] font-black text-stone-400 mb-2 uppercase tracking-tighter leading-none">{(post.likes || []).length} Pet Lovers 꾹!</p>
        <p className="text-sm leading-relaxed"><span className="font-black mr-2 text-stone-900 cursor-pointer hover:underline" onClick={onButlerClick}>{post.authorName}</span><span className="text-stone-600 font-bold tracking-tight break-words">{post.caption}</span></p>
      </div>
    </div>
  );
}

function CommentModal({ post, onClose, onAddComment }) {
  const [text, setText] = useState('');
  if (!post) return null;
  return (
    <div className="fixed inset-0 z-[140] flex items-end justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-300 p-0 font-bold">
      <div className="w-full max-w-md bg-white rounded-t-[4rem] p-10 animate-in slide-in-from-bottom duration-500 flex flex-col h-[90vh] shadow-2xl text-left">
        <div className="flex justify-between items-center mb-10"><div className="flex items-center gap-3"><MessageCircle size={26} className="text-indigo-500" /><h3 className="text-2xl font-black text-stone-800 tracking-tighter italic leading-none">이야기 나누기</h3></div><button onClick={onClose} className="p-3.5 bg-stone-100 rounded-full text-stone-400 active:scale-90 hover:bg-stone-200 transition-all shadow-sm font-bold"><X size={22} /></button></div>
        <div className="flex-1 overflow-y-auto space-y-8 px-2 pb-10 scrollbar-hide">
          {(!post.comments || post.comments.length === 0) ? (<div className="text-center py-32"><Sparkles className="mx-auto text-stone-100 mb-6" size={64} /><p className="text-stone-300 font-bold italic text-xl leading-snug tracking-tight">첫 응원을 남겨보세요! 🐾</p></div>) : (post.comments.map((c, i) => (<div key={i} className="flex gap-5 animate-in fade-in slide-in-from-left-3 duration-300"><div className="w-11 h-11 rounded-full bg-stone-50 flex-shrink-0 overflow-hidden border border-stone-100 shadow-sm"><img src={`https://api.dicebear.com/7.x/initials/svg?seed=${c.name}`} alt="av" onError={handleImgError} /></div><div className="flex-1 font-bold"><div className="bg-stone-50 p-5 rounded-[2.2rem] rounded-tl-none shadow-sm"><p className="text-[12px] font-bold text-stone-400 mb-1 uppercase tracking-widest leading-none truncate">{c.name}</p><p className="text-[15px] text-stone-800 font-bold leading-relaxed break-words">{c.text}</p></div></div></div>)))}
        </div>
        <div className="pt-8 border-t border-stone-100 flex gap-4 pb-12 font-bold font-bold"><input type="text" placeholder="따뜻한 한마디..." className="flex-1 bg-stone-50 rounded-[2.2rem] px-8 py-5 text-[15px] outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-bold border-none shadow-inner" value={text} onChange={(e) => setText(e.target.value)} onKeyPress={(e) => { if(e.key === 'Enter' && text) { onAddComment(post.id, text); setText(''); }}} /><button onClick={() => { if(text) { onAddComment(post.id, text); setText(''); }}} className="bg-stone-900 text-white p-5 rounded-full shadow-xl active:scale-75 transition-transform"><Send size={26} /></button></div>
      </div>
    </div>
  );
}

function CreatePostScreen({ onClose, onSave, userPets }) {
  const [desc, setDesc] = useState('');
  const [imgData, setImgData] = useState('');
  const [selectedPetType, setSelectedPetType] = useState(userPets?.[0]?.type || '강아지');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 800000) { alert("사진 용량이 너무 큽니다. 🐾"); return; }
      const reader = new FileReader(); reader.onloadend = () => setImgData(reader.result); reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-end justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-300 p-0 font-bold">
      <div className="w-full max-w-md bg-white rounded-t-[4rem] p-10 animate-in slide-in-from-bottom duration-500 shadow-2xl max-h-[95vh] overflow-y-auto text-left scrollbar-hide font-bold">
        <div className="flex justify-between items-center mb-10"><h2 className="text-3xl font-black text-stone-800 tracking-tighter italic leading-none">새 글 작성 🐾</h2><button onClick={onClose} className="p-3.5 bg-stone-100 rounded-full text-stone-400 active:scale-90 hover:bg-stone-200 transition-all shadow-sm font-bold"><X size={22} /></button></div>
        <div className="space-y-8 font-bold">
          <section><label className="text-[10px] font-black text-stone-300 uppercase tracking-widest block mb-4 font-bold">누구의 사진인가요?</label><div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 font-bold">{['강아지', '고양이', '새', '햄스터', '기타'].map(type => (<button key={type} onClick={() => setSelectedPetType(type)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${selectedPetType === type ? 'bg-orange-500 text-white border-orange-500 shadow-md font-bold' : 'bg-stone-50 text-stone-400 border-stone-100 font-bold'}`}>{type}</button>))}</div></section>
          
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
          {imgData ? (
            <div className="relative aspect-square rounded-[3.5rem] overflow-hidden border-8 border-stone-50 shadow-2xl group font-bold">
              <img src={imgData} className="w-full h-full object-cover font-bold font-bold" alt="prev" />
              <button onClick={() => setImgData('')} className="absolute top-6 right-6 p-4 bg-black/60 text-white rounded-full active:scale-90 shadow-lg backdrop-blur-md transition-all hover:bg-black/80 font-bold"><X size={18} /></button>
            </div>
          ) : (
            <div onClick={() => fileInputRef.current.click()} className="w-full aspect-square bg-stone-50 rounded-[3.5rem] border-4 border-dashed border-stone-200 flex flex-col items-center justify-center cursor-pointer hover:bg-stone-100 transition-all gap-5 active:scale-95 group shadow-inner shadow-stone-100 font-bold">
              <div className="p-7 bg-white rounded-full shadow-2xl text-orange-500 group-hover:scale-110 transition-transform font-bold"><Upload size={40} /></div>
              <p className="text-lg font-bold text-stone-500 tracking-tight leading-none font-bold">사진첩 열기</p>
            </div>
          )}

          <textarea rows="3" placeholder="아이의 매력을 한마디로!" className="w-full bg-stone-50 rounded-[2rem] p-6 text-base outline-none resize-none shadow-inner font-bold focus:ring-4 focus:ring-orange-100 transition-all border-none font-bold" value={desc} onChange={(e) => setDesc(e.target.value)} />
          
          <button onClick={() => { setIsSubmitting(true); onSave({ caption: desc, imageUrl: imgData, petType: selectedPetType }).then(() => setIsSubmitting(false)); }} disabled={!desc || !imgData || isSubmitting} className="w-full bg-stone-900 text-white py-7 rounded-[2.5rem] font-bold shadow-2xl active:scale-95 transition-all mb-4 uppercase tracking-[0.3em] text-[15px] disabled:bg-stone-300 flex items-center justify-center gap-3 font-bold font-bold">
            {isSubmitting ? <><Loader2 size={20} className="animate-spin font-bold" />게시 중...</> : "게시하기"}
          </button>
        </div>
      </div>
    </div>
  );
}

function LoginModal({ onClose, onLogin }) {
  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-300 font-bold font-bold">
      <div className="w-[92%] max-w-sm bg-white rounded-[4rem] p-14 text-center shadow-2xl relative overflow-hidden font-bold font-bold">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 via-indigo-500 to-orange-400 font-bold font-bold font-bold"></div>
        <div className="w-24 h-24 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 text-indigo-600 ring-8 ring-white shadow-inner shadow-indigo-100 font-bold font-bold"><Camera size={44} /></div>
        <h2 className="text-3xl font-black text-stone-800 mb-4 tracking-tighter uppercase italic leading-none">Welcome!</h2>
        <p className="text-stone-500 text-[14px] mb-12 leading-relaxed font-bold tracking-tight font-bold font-bold">로그인을 하시면 자랑스러운 우리 아이를<br/>명예의 전당에 올릴 수 있어요! 🐾</p>
        <div className="space-y-4 font-bold font-bold font-bold">
           <button onClick={onLogin} className="w-full bg-indigo-600 text-white py-5 rounded-[2.5rem] font-bold shadow-lg active:scale-95 transition-all text-lg tracking-tight uppercase border-none font-bold">Google 로그인</button>
           <button onClick={onClose} className="w-full py-4 text-stone-300 font-bold text-[13px] uppercase tracking-[0.4em] hover:text-stone-500 transition-colors active:scale-90 leading-none font-bold">나중에 할게요</button>
        </div>
      </div>
    </div>
  );
}

// --- [전문가/QA] 3. 메인 앱 컴포넌트 ---

function PetmilyApp() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [realPosts, setRealPosts] = useState([]);
  const [dummyPosts, setDummyPosts] = useState(INITIAL_DUMMY_POSTS);
  const [view, setView] = useState('feed'); 
  const [petFilter, setPetFilter] = useState('all'); 
  const [activeProfileTab, setActiveProfileTab] = useState('gallery');
  const [activeRankingTab, setActiveRankingTab] = useState('new'); 
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', visible: false });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedPostIdForComment, setSelectedPostIdForComment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedButler, setSelectedButler] = useState(null); 
  const [targetButlerProfile, setTargetButlerProfile] = useState(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const [isMoreLoading, setIsMoreLoading] = useState(false);
  const observerTarget = useRef(null);

  // [전문가/QA] isMainView를 useMemo로 감싸 참조 이슈 방지
  const isMainView = useMemo(() => ['feed', 'search', 'leaderboard', 'my_page', 'butler_profile'].includes(view), [view]);

  const showToast = (msg) => {
    setToast({ message: msg, visible: true });
    setTimeout(() => setToast({ message: '', visible: false }), 2500);
  };

  const handleHomeClick = () => {
    if (view === 'feed') { window.scrollTo({ top: 0, behavior: 'smooth' }); setVisibleCount(10); }
    else { setView('feed'); window.scrollTo(0, 0); }
  };

  const allPosts = useMemo(() => {
    const combined = [...realPosts, ...dummyPosts];
    return combined.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  }, [realPosts, dummyPosts]);

  const filteredPosts = useMemo(() => {
    return allPosts.filter(post => {
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        if (!((post.caption || "").toLowerCase().includes(s) || (post.authorName || "").toLowerCase().includes(s))) return false;
      }
      if (petFilter !== 'all' && post.petType !== petFilter) return false;
      if (view === 'my_page') {
        if (activeProfileTab === 'activity') return (post.likes || []).includes(user?.uid) && post.authorId !== user?.uid;
        if (activeProfileTab === 'gallery') return post.authorId === user?.uid;
      }
      if (view === 'butler_profile') return post.authorId === selectedButler?.id;
      return true;
    });
  }, [allPosts, view, activeProfileTab, selectedButler, searchTerm, petFilter, user?.uid]);

  const rankingData = useMemo(() => {
    const now = Date.now() / 1000;
    const thirtyDaysInSeconds = 30 * 24 * 60 * 60;
    const newRanking = allPosts.filter(p => (now - (p.createdAt?.seconds || 0)) <= thirtyDaysInSeconds).sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0)).slice(0, 10).map(p => ({ ...p, score: p.likes?.length || 0 }));
    const cumulativeRanking = [...allPosts].sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0)).slice(0, 5).map(p => ({ ...p, score: p.likes?.length || 0 }));
    const userScores = {};
    allPosts.forEach(post => {
      const count = (post.likes || []).length;
      if (count > 0 && post.authorId) {
        if (!userScores[post.authorId]) userScores[post.authorId] = { id: post.authorId, name: post.authorName, score: 0 };
        userScores[post.authorId].score += count;
      }
    });
    return { newRanking, cumulativeRanking, userRanking: Object.values(userScores).sort((a, b) => b.score - a.score).slice(0, 10) };
  }, [allPosts]);

  const myRank = useMemo(() => {
    if (!user || user.isAnonymous) return null;
    const index = rankingData.userRanking.findIndex(u => u.id === user.uid);
    return index !== -1 ? index + 1 : null;
  }, [rankingData, user]);

  const handleJumpToPost = (postId) => {
    setView('feed'); setPetFilter('all');
    const targetIdx = allPosts.findIndex(p => p.id === postId);
    if (targetIdx !== -1 && targetIdx >= visibleCount) setVisibleCount(targetIdx + 5); 
    setTimeout(() => {
      const el = document.getElementById(`post-${postId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  };

  const handleLogout = async () => {
    try { 
      setLoading(true); 
      await signOut(auth); 
      setUser(null);
      setProfile(DEFAULT_PROFILE);
      setView('feed'); 
      showToast("로그아웃 되었습니다! 🐾"); 
    } catch (e) { 
      showToast("실패 ❌"); 
      setLoading(false); 
    }
  };

  const handleSavePost = async (newPost) => {
    if (!user || user.isAnonymous) { setIsLoginModalOpen(true); return; }
    try {
      const postsRef = collection(db, 'artifacts', appIdKey, 'public', 'data', 'posts');
      await addDoc(postsRef, { 
        ...newPost, 
        authorId: user.uid, 
        authorName: profile?.nickname || '익명집사', 
        likes: [], 
        comments: [], 
        createdAt: serverTimestamp(), 
        authorPhoto: profile.profilePic || '' 
      });
      setIsCreateModalOpen(false); setView('feed'); showToast("게시 완료! ✨");
    } catch (err) { showToast("실패 ❌"); }
  };

  const handleSaveProfile = async (profileData) => {
    if (!user) return;
    try {
      const profileRef = doc(db, 'artifacts', appIdKey, 'users', user.uid, 'profile', 'info');
      await setDoc(profileRef, { ...profileData, following: profile.following || [] }, { merge: true });
      setProfile({ ...profileData, following: profile.following || [] });
      setView('feed'); showToast("정보 저장 완료! 🐾");
    } catch (err) { console.error(err); }
  };

  const handleAddComment = async (postId, text) => {
    if (!user || user.isAnonymous) { setIsLoginModalOpen(true); return; }
    const newComment = { name: profile?.nickname || '집사', text, createdAt: Date.now() };
    if (postId.startsWith('d')) setDummyPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: [...(p.comments || []), newComment] } : p));
    else await updateDoc(doc(db, 'artifacts', appIdKey, 'public', 'data', 'posts', postId), { comments: arrayUnion(newComment) });
    showToast("이야기 완료! 🐾");
  };

  const handleFollow = async (butlerId) => {
    if (!user || user.isAnonymous) { setIsLoginModalOpen(true); return; }
    if (user.uid === butlerId) return;
    const isFollowing = profile.following?.includes(butlerId);
    const profileRef = doc(db, 'artifacts', appIdKey, 'users', user.uid, 'profile', 'info');
    try {
      await updateDoc(profileRef, { following: isFollowing ? arrayRemove(butlerId) : arrayUnion(butlerId) });
      setProfile(prev => ({ ...prev, following: isFollowing ? prev.following.filter(id => id !== butlerId) : [...(prev.following || []), butlerId] }));
      showToast(isFollowing ? "팔로우 취소" : "팔로우 시작! ✨");
    } catch (e) { showToast("오류 발생 ❌"); }
  };

  const navigateToProtected = (targetView, tab) => {
    if (!user || user.isAnonymous) {
      setIsLoginModalOpen(true);
      return;
    }
    setView(targetView);
    if (tab) setActiveProfileTab(tab);
  };

  useEffect(() => {
    const initAuth = async () => {
      const safetyTimer = setTimeout(() => { if (loading) setLoading(false); }, 6000);
      try {
        await setPersistence(auth, browserLocalPersistence);
        onAuthStateChanged(auth, async (u) => {
          clearTimeout(safetyTimer);
          if (!u) {
            await signInAnonymously(auth).catch(() => setLoading(false));
          } else {
            setUser(u);
            if (!u.isAnonymous) {
              const profileRef = doc(db, 'artifacts', appIdKey, 'users', u.uid, 'profile', 'info');
              const profileSnap = await getDoc(profileRef);
              if (profileSnap.exists()) setProfile(profileSnap.data());
              else setView('profile_setup');
            } else setProfile(DEFAULT_PROFILE);
            setLoading(false);
          }
        });
      } catch (err) { setLoading(false); }
    };
    initAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(collection(db, 'artifacts', appIdKey, 'public', 'data', 'posts'), (snapshot) => {
      setRealPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (view !== 'feed') return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && filteredPosts.length > visibleCount && !isMoreLoading) {
        setIsMoreLoading(true);
        setTimeout(() => { setVisibleCount(prev => prev + 10); setIsMoreLoading(false); }, 800);
      }
    }, { threshold: 1.0 });
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [filteredPosts.length, visibleCount, view, isMoreLoading]);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#FDFCF8] pb-32 font-sans text-stone-800 shadow-2xl overflow-x-hidden text-left border-x border-gray-100 relative selection:bg-orange-100 font-bold">
      
      {toast.visible && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[150] animate-in slide-in-from-top-4 duration-300">
          <div className="bg-stone-900/90 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 border border-white/10">
            <CheckCircle2 size={16} className="text-orange-400" />
            <span className="text-xs font-bold tracking-tight font-bold">{toast.message}</span>
          </div>
        </div>
      )}

      {isMainView && (
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm font-bold">
          <div className="px-5 py-4 flex justify-between items-center font-bold">
            <div className="flex items-center gap-3 font-bold">
              {view !== 'feed' && <button onClick={() => setView('feed')} className="p-2 hover:bg-stone-100 rounded-full transition-all active:scale-90 font-bold font-bold"><ArrowLeft size={22} /></button>}
              <div className="flex items-center cursor-pointer group" onClick={handleHomeClick}>
                <div className="w-9 h-9 bg-stone-900 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300 font-bold">
                   <PawPrint size={22} className="text-orange-400 fill-orange-400 font-bold" />
                </div>
                <div className="flex flex-col ml-2.5 font-bold">
                  <div className="flex items-center gap-1 font-bold">
                    <h1 className="text-xl font-black text-stone-800 tracking-tighter italic leading-none font-bold">Petmily</h1>
                    <span className="bg-orange-500 text-white text-[7px] font-black px-1 py-0.5 rounded uppercase shadow-sm mb-1 font-bold">Beta</span>
                  </div>
                  {view === 'feed' && (
                      <div onClick={(e) => { e.stopPropagation(); setView('leaderboard'); }} className="flex items-center gap-1 mt-0.5 group/link font-bold">
                        <Trophy size={9} className="text-orange-500 fill-orange-500 font-bold" />
                        <span className="text-[8px] font-black text-orange-600 tracking-tight uppercase group-hover/link:underline font-bold font-bold">{!myRank ? '명예의 전당' : `${myRank}위`}</span>
                        <ChevronRight size={8} className="text-orange-400 font-bold" />
                      </div>
                  )}
                </div>
              </div>
            </div>
            
            {(user && !user.isAnonymous) ? (
              <button onClick={() => setView('profile_edit')} className="w-9 h-9 bg-stone-50 rounded-full overflow-hidden border border-stone-100 active:scale-90 shadow-sm font-bold">
                <img src={profile.profilePic || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.nickname || 'Petmily'}`} alt="me" className="w-full h-full object-cover font-bold" onError={handleImgError} />
              </button>
            ) : (
              <button 
                onClick={() => setIsLoginModalOpen(true)} 
                className="flex items-center gap-1.5 bg-orange-500 text-white px-4 py-2 rounded-full font-black text-[11px] shadow-lg shadow-orange-200 active:scale-90 transition-all border-none font-bold"
              >
                <LogIn size={14} />
                로그인
              </button>
            )}
          </div>

          {view === 'feed' && (
            <div className="px-5 pb-3 flex gap-2 overflow-x-auto scrollbar-hide animate-in fade-in duration-300 font-bold">
              {PET_TYPES.map(type => (
                <button 
                  key={type.id} 
                  onClick={() => setPetFilter(type.id)} 
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black whitespace-nowrap transition-all border font-bold ${petFilter === type.id ? 'bg-stone-900 text-white border-stone-900 shadow-md font-bold' : 'bg-white text-stone-400 border-stone-100 font-bold'}`}
                >
                  {type.icon} {type.label}
                </button>
              ))}
            </div>
          )}
        </header>
      )}

      <main className="px-0 mt-2 font-bold">
        {view === 'feed' && (
          <div className="space-y-4 font-bold">
            {filteredPosts.length === 0 ? (
              <div className="py-40 text-center px-10 font-bold"><Filter className="mx-auto text-stone-100 mb-4 font-bold" size={48} /><p className="text-stone-300 font-bold tracking-tight font-bold">아이들을 찾을 수 없어요 🐾</p></div>
            ) : (
              filteredPosts.slice(0, visibleCount).map(post => (
                <PostCard 
                  key={post.id} post={post} currentUser={user} myProfile={profile}
                  onLike={() => {
                    const isLiked = (post.likes || []).includes(user?.uid);
                    if (post.id.startsWith('d')) {
                      setDummyPosts(prev => prev.map(p => p.id === post.id ? { ...p, likes: isLiked ? p.likes.filter(id => id !== user?.uid) : [...p.likes, user?.uid] } : p));
                    } else {
                      updateDoc(doc(db, 'artifacts', appIdKey, 'public', 'data', 'posts', post.id), { likes: isLiked ? arrayRemove(user?.uid) : arrayUnion(user?.uid) });
                    }
                  }} 
                  onDelete={async () => { await deleteDoc(doc(db, 'artifacts', appIdKey, 'public', 'data', 'posts', post.id)); showToast("삭제 완료!"); }}
                  onCommentClick={() => {
                    if (!user || user.isAnonymous) setIsLoginModalOpen(true);
                    else { setSelectedPostIdForComment(post.id); setIsCommentModalOpen(true); }
                  }} 
                  onButlerClick={() => { setSelectedButler({ id: post.authorId, name: post.authorName }); setView('butler_profile'); }} 
                  onShareClick={() => showToast("공유 문구가 복사되었습니다!")} 
                />
              ))
            )}
            <div ref={observerTarget} className="py-12 flex flex-col items-center justify-center gap-3 font-bold">
              {filteredPosts.length > visibleCount && (<><Loader2 className="animate-spin text-orange-400 font-bold" size={28} /><p className="text-xs font-black text-stone-400 animate-pulse font-bold">{MORE_LOADING_MESSAGES[Math.floor(Math.random() * MORE_LOADING_MESSAGES.length)]}</p></>)}
            </div>
          </div>
        )}

        {view === 'leaderboard' && (
          <div className="px-5 space-y-8 animate-in slide-in-from-bottom-4 pb-20 text-left font-bold">
            <div className="text-center py-6 font-bold"><h2 className="text-3xl font-black italic tracking-tighter text-stone-800 leading-none font-bold">명예의 전당</h2><p className="text-stone-400 text-[10px] font-black uppercase tracking-widest mt-1 leading-none font-bold">Hall of Fame</p></div>
            <div className="flex p-1.5 bg-stone-100 rounded-[1.8rem] gap-2 border border-stone-50 shadow-inner font-bold">
              <button onClick={() => setActiveRankingTab('new')} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[1.2rem] font-black text-sm transition-all duration-300 font-bold ${activeRankingTab === 'new' ? 'bg-white text-orange-500 shadow-md scale-100 font-bold' : 'text-stone-400 scale-95 font-bold'}`}><Zap size={18} className="font-bold" /> 신규 (30일)</button>
              <button onClick={() => setActiveRankingTab('cumulative')} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[1.2rem] font-black text-sm transition-all duration-300 font-bold ${activeRankingTab === 'cumulative' ? 'bg-white text-orange-500 shadow-md scale-100 font-bold' : 'text-stone-400 scale-95 font-bold'}`}><History size={18} className="font-bold" /> 누적 명예</button>
            </div>
            
            <div className="space-y-6 mt-8 font-bold">
              {(activeRankingTab === 'new' ? rankingData.newRanking : rankingData.cumulativeRanking).map((post, idx) => (
                activeRankingTab === 'cumulative' ? (
                  <div key={post.id} onClick={() => handleJumpToPost(post.id)} className="group relative aspect-video rounded-[2.5rem] overflow-hidden border-2 border-stone-100 shadow-xl active:scale-98 transition-all cursor-pointer font-bold">
                    <ImageWithFallback src={post.imageUrl} className="w-full h-full object-cover font-bold" alt="best" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-6 flex flex-col justify-end font-bold">
                       <div className="flex items-center justify-between font-bold">
                          <div>
                            <div className="flex items-center gap-2 mb-1 font-bold">
                              <span className="text-2xl font-black italic text-orange-500 font-bold">
                                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                              </span>
                              <p className="text-white font-black text-lg leading-none font-bold">{post.authorName}</p>
                            </div>
                            <p className="text-stone-400 text-xs font-bold line-clamp-1 font-bold">{post.caption}</p>
                          </div>
                          <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-2xl font-bold"><p className="text-white font-black text-sm font-bold">{post.score} 꾹</p></div>
                       </div>
                    </div>
                  </div>
                ) : (
                  <div key={post.id} onClick={() => handleJumpToPost(post.id)} className="group relative aspect-[4/5] rounded-[2.2rem] overflow-hidden border-2 border-stone-100 shadow-md active:scale-95 transition-all cursor-pointer font-bold">
                    <ImageWithFallback src={post.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 font-bold" alt="rank" />
                    <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-white text-[10px] font-black shadow-xl font-bold ${idx < 3 ? 'bg-orange-500 ring-2 ring-white/30 font-bold' : 'bg-black/60 font-bold'}`}>#{idx + 1}</div>
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-10 font-bold"><p className="text-[10px] text-white font-black truncate leading-none mb-1 font-bold">{post.authorName}</p><p className="text-[10px] text-orange-400 font-black flex items-center gap-1 leading-none font-bold"><PawPrint size={10} className="font-bold" /> {post.score} 꾹</p></div>
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        {(view === 'my_page' || view === 'butler_profile') && (
          <div className="px-5 space-y-6 pb-20 animate-in slide-in-from-bottom-4 text-left font-bold">
            <div className="bg-stone-900 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden ring-4 ring-white/5 font-bold">
              <div className="relative z-10 flex flex-col gap-6 font-bold">
                <div className="flex justify-between items-center font-bold">
                  <div className="flex items-center gap-4 max-w-[70%] font-bold">
                    <div className="w-16 h-16 rounded-[1.8rem] bg-white/10 border border-white/20 overflow-hidden flex-shrink-0 font-bold">
                      <img src={(view === 'my_page' ? profile.profilePic : targetButlerProfile?.profilePic) || `https://api.dicebear.com/7.x/initials/svg?seed=${view === 'my_page' ? (profile?.nickname || 'Butler') : selectedButler?.name}`} alt="av" className="w-full h-full object-cover font-bold" onError={handleImgError} />
                    </div>
                    <div className="flex flex-col min-w-0 font-bold">
                      <h2 className="text-2xl font-black italic tracking-tighter leading-none truncate break-all mb-1 font-bold">{view === 'my_page' ? (profile?.nickname || '집사') : selectedButler?.name}</h2>
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-[0.2em] leading-none font-bold">Star Pet Butler</p>
                    </div>
                  </div>
                  {view === 'butler_profile' && selectedButler?.id !== user?.uid && (
                    <button onClick={() => handleFollow(selectedButler.id)} className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full font-black text-[11px] transition-all shadow-xl active:scale-90 flex-shrink-0 font-bold ${profile.following?.includes(selectedButler.id) ? 'bg-white text-stone-900 border-none font-bold' : 'bg-orange-500 text-white font-bold'}`}>{profile.following?.includes(selectedButler.id) ? <UserCheck size={14} className="font-bold"/> : <UserPlus size={14} className="font-bold"/>}{profile.following?.includes(selectedButler.id) ? "팔로잉" : "팔로우"}</button>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pb-20 font-bold">
              {filteredPosts.map(post => (<div key={post.id} onClick={() => handleJumpToPost(post.id)} className="aspect-square rounded-[2.2rem] overflow-hidden shadow-md active:scale-95 transition-transform border border-stone-100 cursor-pointer font-bold"><img src={post.imageUrl} className="w-full h-full object-cover font-bold" onError={handleImgError} /></div>))}
            </div>
          </div>
        )}

        {(view === 'profile_setup' || view === 'profile_edit') && (
          <ProfileForm isEdit={view === 'profile_edit'} initialData={profile} onSave={handleSaveProfile} onBack={() => setView('feed')} onLogout={handleLogout} />
        )}
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[380px] bg-stone-900/95 backdrop-blur-xl px-2 py-3 rounded-[2.5rem] flex justify-between items-center shadow-2xl z-[130] border border-white/10 ring-1 ring-white/5 animate-in slide-in-from-bottom-4 duration-500 font-bold">
        <button onClick={handleHomeClick} className={`flex-1 flex flex-col items-center gap-1 transition-all active:scale-75 font-bold ${view === 'feed' ? 'text-white font-bold' : 'text-stone-500 font-bold'}`}><Home size={20} className="font-bold"/><span className="text-[8px] font-black uppercase tracking-tighter leading-none font-bold">홈</span></button>
        <button onClick={() => setView('search')} className={`flex-1 flex flex-col items-center gap-1 transition-all active:scale-75 font-bold ${view === 'search' ? 'text-white font-bold' : 'text-stone-500 font-bold'}`}><Search size={20} className="font-bold"/><span className="text-[8px] font-black uppercase tracking-tighter leading-none font-bold">찾기</span></button>
        <div className="flex-1 flex justify-center font-bold font-bold"><button onClick={() => user?.isAnonymous ? setIsLoginModalOpen(true) : setIsCreateModalOpen(true)} className="bg-gradient-to-br from-orange-400 to-orange-600 text-white p-3.5 rounded-2xl shadow-lg active:scale-75 transition-transform font-bold font-bold font-bold font-bold"><PlusSquare size={24} className="font-bold"/></button></div>
        <button onClick={() => navigateToProtected('my_page', 'activity')} className={`flex-1 flex flex-col items-center gap-1 transition-all active:scale-75 font-bold ${view === 'my_page' && activeProfileTab === 'activity' ? 'text-white font-bold' : 'text-stone-500 font-bold'}`}><PawPrint size={20} className="font-bold"/><span className="text-[8px] font-black uppercase tracking-tighter leading-none font-bold">꾹</span></button>
        <button onClick={() => navigateToProtected('my_page', 'gallery')} className={`flex-1 flex flex-col items-center gap-1 transition-all active:scale-75 font-bold ${view === 'my_page' && activeProfileTab === 'gallery' ? 'text-white font-bold' : 'text-stone-500 font-bold'}`}><User size={20} className="font-bold"/><span className="text-[8px] font-black uppercase tracking-tighter font-bold">보물함</span></button>
      </nav>

      {isLoginModalOpen && <LoginModal onClose={() => setIsLoginModalOpen(false)} onLogin={async () => { const provider = new GoogleAuthProvider(); await signInWithPopup(auth, provider).then(() => setIsLoginModalOpen(false)).catch(console.error); }} />}
      {isCommentModalOpen && <CommentModal post={activePostForComment} onClose={() => {setIsCommentModalOpen(false); setSelectedPostIdForComment(null);}} onAddComment={handleAddComment} />}
      {isCreateModalOpen && <CreatePostScreen onClose={() => setIsCreateModalOpen(false)} onSave={handleSavePost} userPets={profile.pets} />}
    </div>
  );
}

export default function Root() {
  return (
    <ErrorBoundary>
      <PetmilyApp />
    </ErrorBoundary>
  );
}