import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import {
    getFirestore,
    collection,
    addDoc,
    onSnapshot,
    serverTimestamp
} from 'firebase/firestore';
import {
    getAuth,
    signInAnonymously,
    onAuthStateChanged
} from 'firebase/auth';
import {
    Heart, Send, Plus, X, Sparkles, Camera, Music, Coffee, Star,
    Image as ImageIcon, Youtube, Upload, Smile, Sticker, Sun,
    Cloud, Flower2, Moon, Bird, Facebook, HardDrive,
    ChevronLeft, ChevronRight, Trophy, Gem, Palmtree, ExternalLink
} from 'lucide-react';

// --- Dán Firebase Config của bạn vào đây ---
const firebaseConfig = {
    apiKey: "AIzaSyCuZUpdNlCanpUHftaq4oZFKuF54ivH9Oo",
    authDomain: "farewellhrm.firebaseapp.com",
    projectId: "farewellhrm",
    storageBucket: "farewellhrm.firebasestorage.app",
    messagingSenderId: "3699617145",
    appId: "1:3699617145:web:f3456f5492f1d938ac93a8",
    measurementId: "G-0Q62EL7G13"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Các màu washi tape trang trí
const WASHI_COLORS = [
    'bg-pink-400/60', 'bg-blue-400/60', 'bg-yellow-400/60',
    'bg-green-400/60', 'bg-purple-400/60'
];

const MESSAGES_PER_PAGE = 6;

const ensureAbsoluteUrl = (url) => {
    if (!url) return '';
    const trimmed = url.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    return `https://${trimmed}`;
};

const getYoutubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}`;
    }
    return null;
};

const App = () => {
    const [messages, setMessages] = useState([]);
    const [user, setUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMsg, setSelectedMsg] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const fileInputRef = useRef(null);

    const [newMsg, setNewMsg] = useState({
        sender: '', content: '', colorIndex: 0, imageUrl: '',
        videoUrl: '', driveUrl: '', facebookUrl: ''
    });

    // Tự động đăng nhập ẩn danh & Load Font
    useEffect(() => {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Pattaya&family=Kalam:wght@400;700&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);

        signInAnonymously(auth).catch(err => console.error("Lỗi đăng nhập:", err));
        const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
        return () => unsubscribe();
    }, []);

    // Lắng nghe dữ liệu từ Firestore
    useEffect(() => {
        if (!user) return;
        const msgCollection = collection(db, 'messages'); // Tên collection trong Firestore của bạn
        const unsubscribe = onSnapshot(msgCollection, (snapshot) => {
            const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(docs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width, height = img.height, maxDim = 1000;
                if (width > height) { if (width > maxDim) { height *= maxDim / width; width = maxDim; } }
                else { if (height > maxDim) { width *= maxDim / height; height = maxDim; } }
                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                setNewMsg(prev => ({ ...prev, imageUrl: canvas.toDataURL('image/jpeg', 0.8) }));
            };
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newMsg.sender.trim() || !newMsg.content.trim() || !user || isSubmitting) return;
        setIsSubmitting(true);
        try {
            const msgCollection = collection(db, 'messages');
            await addDoc(msgCollection, { ...newMsg, userId: user.uid, createdAt: serverTimestamp() });
            setNewMsg({
                sender: '', content: '', colorIndex: Math.floor(Math.random() * WASHI_COLORS.length),
                imageUrl: '', videoUrl: '', driveUrl: '', facebookUrl: ''
            });
            setIsModalOpen(false);
            setCurrentPage(0);
        } catch (err) { console.error("Lỗi gửi:", err); } finally { setIsSubmitting(false); }
    };

    const totalPages = Math.ceil(messages.length / MESSAGES_PER_PAGE);
    const currentMessages = messages.slice(currentPage * MESSAGES_PER_PAGE, (currentPage + 1) * MESSAGES_PER_PAGE);

    return (
        <div className="min-h-screen bg-[#4a3528] p-4 md:p-8 flex items-center justify-center font-sans overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>

            <div className="relative w-full max-w-6xl aspect-[16/10] bg-white rounded-lg shadow-2xl flex overflow-hidden border-8 border-white/20">

                {/* Trang Trái */}
                <div className="flex-1 bg-[#fdfbf7] p-8 relative flex flex-col items-center border-r border-slate-300 overflow-hidden text-center">
                    <div className="absolute top-0 right-[-12px] bottom-0 w-6 flex flex-col justify-around py-4 z-50">
                        {Array.from({ length: 20 }).map((_, i) => (
                            <div key={i} className="w-6 h-3 bg-slate-800 rounded-full border-b-2 border-black/40 shadow-inner"></div>
                        ))}
                    </div>

                    <div className="w-full text-center mb-6 relative pt-4">
                        <h1 style={{ fontFamily: "'Pattaya', sans-serif" }} className="text-4xl md:text-5xl text-blue-900 drop-shadow-sm">
                            Hành trình <span className="text-blue-600">Rực rỡ</span>
                        </h1>
                        <p style={{ fontFamily: "'Dancing Script', cursive" }} className="text-xl md:text-2xl text-blue-500 font-bold mt-2">
                            Chào Trang Quỳnh, là mọi người đây!!
                        </p>
                        <Star className="absolute top-0 right-0 text-yellow-400 fill-yellow-400 w-8 h-8 rotate-12" />
                        <Heart className="absolute top-16 -left-2 text-pink-400 fill-pink-400 w-6 h-6 -rotate-12" />
                        <Sun className="absolute bottom-40 -left-6 text-orange-300 w-12 h-12 opacity-30 animate-spin-slow" />
                        <Gem className="absolute top-1/2 -right-4 text-cyan-300 w-8 h-8 opacity-30" />
                    </div>

                    <div className="relative mt-2">
                        <div className="absolute -top-4 -left-6 w-20 h-8 bg-blue-400/20 rotate-[-35deg] z-20"></div>
                        <div className="absolute -bottom-4 -right-6 w-20 h-8 bg-yellow-400/20 rotate-[-35deg] z-20"></div>
                        <div className="bg-white p-3 pb-10 shadow-xl border border-slate-200 rotate-1 w-64 md:w-72 flex flex-col items-center z-10">
                            <div className="w-full aspect-square overflow-hidden bg-slate-100 border border-slate-200 mb-4">
                                <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2" alt="Trang Quỳnh" className="w-full h-full object-cover" />
                            </div>
                            <p style={{ fontFamily: "'Kalam', cursive" }} className="text-xl font-bold text-slate-700">Trang Quỳnh ❤️</p>
                        </div>
                    </div>

                    <div className="mt-auto w-full flex justify-around opacity-30 px-4 mb-2">
                        <Camera /> <Music /> <Coffee /> <Smile /> <Flower2 />
                    </div>
                </div>

                {/* Trang Phải */}
                <div className="flex-1 bg-[#fdfbf7] p-6 relative flex flex-col overflow-hidden">
                    <Cloud className="absolute top-10 right-10 text-slate-200 w-16 h-16 opacity-40 animate-pulse" />
                    <Bird className="absolute top-24 left-8 text-blue-100 w-8 h-8 opacity-50" />

                    <div className="flex justify-between items-center mb-6 z-10">
                        <div className="flex gap-2">
                            <div className="bg-pink-100 px-3 py-1 rounded-full text-[10px] font-bold text-pink-600 border border-pink-200 shadow-sm">JOURNAL</div>
                            <div className="bg-blue-100 px-3 py-1 rounded-full text-[10px] font-bold text-blue-600 border border-blue-200 tracking-wider shadow-sm">MEMORIES</div>
                        </div>
                        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 transform transition-all active:scale-95 text-sm">
                            <Plus size={16} /> VIẾT LỜI CHÚC
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar z-20">
                        {loading ? (
                            <div className="h-full flex items-center justify-center italic text-slate-400">Đang lật trang...</div>
                        ) : (
                            <div className="columns-2 gap-4 space-y-4 pb-4">
                                {currentMessages.map((msg, idx) => (
                                    <div key={msg.id} onClick={() => setSelectedMsg(msg)} className="break-inside-avoid bg-white p-3 shadow-md hover:shadow-xl transition-all cursor-pointer border border-slate-100 relative group flex flex-col" style={{ transform: `rotate(${(idx % 2 === 0 ? 0.5 : -0.5)}deg)` }}>
                                        <div className={`absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-3 ${WASHI_COLORS[msg.colorIndex || 0]} opacity-70 group-hover:opacity-100`}></div>
                                        {msg.imageUrl && <div className="w-full mb-3 border border-slate-100 bg-slate-50 overflow-hidden"><img src={msg.imageUrl} className="w-full h-auto object-contain" /></div>}
                                        <p style={{ fontFamily: "'Kalam', cursive" }} className="text-xs text-slate-800 leading-snug mb-3">"{msg.content}"</p>
                                        <div className="flex flex-wrap gap-2 mb-3 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                                            {msg.videoUrl && <a href={ensureAbsoluteUrl(msg.videoUrl)} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100 shadow-sm"><Youtube size={14} /></a>}
                                            {msg.driveUrl && <a href={ensureAbsoluteUrl(msg.driveUrl)} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 shadow-sm"><HardDrive size={14} /></a>}
                                            {msg.facebookUrl && <a href={ensureAbsoluteUrl(msg.facebookUrl)} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 shadow-sm"><Facebook size={14} /></a>}
                                        </div>
                                        <div className="mt-auto text-[9px] flex justify-between items-center opacity-60 font-bold italic border-t border-slate-100 pt-2">
                                            <span className="truncate max-w-[70px] text-blue-800">{msg.sender}</span>
                                            <span>{msg.createdAt ? new Date(msg.createdAt.seconds * 1000).toLocaleDateString() : '...'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Unlimited Innovation Tag */}
                    <div className="absolute bottom-20 right-6 rotate-[-10deg] opacity-80 pointer-events-none z-40 drop-shadow-sm">
                        <div className="text-[10px] md:text-xs font-black text-blue-900 border-2 border-blue-900 px-3 py-1.5 rounded-lg flex items-center gap-2 bg-white/60 backdrop-blur-[2px]">
                            <Trophy size={14} className="text-yellow-600" /> UNLIMITED INNOVATION
                        </div>
                    </div>

                    {/* Phân trang */}
                    <div className="mt-4 pt-2 flex items-center justify-between border-t border-slate-200 z-50 shrink-0 bg-[#fdfbf7]/80 backdrop-blur-sm">
                        <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase italic">Trang {currentPage + 1} / {totalPages || 1}</span>
                        <div className="flex gap-3">
                            <button disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)} className="p-1.5 bg-white border border-slate-200 rounded-full shadow-sm"><ChevronLeft size={16} /></button>
                            <button disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(p => p + 1)} className="p-1.5 bg-white border border-slate-200 rounded-full shadow-sm"><ChevronRight size={16} /></button>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL CHI TIẾT */}
            {selectedMsg && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in duration-300 relative">
                        <button onClick={() => setSelectedMsg(null)} className="absolute top-4 right-4 z-50 p-2 bg-slate-100/80 hover:bg-red-500 hover:text-white rounded-full transition-all backdrop-blur-md"><X size={24} /></button>
                        {(selectedMsg.imageUrl || getYoutubeEmbedUrl(selectedMsg.videoUrl)) && (
                            <div className="w-full md:w-3/5 bg-slate-100 flex items-center justify-center p-4">
                                {getYoutubeEmbedUrl(selectedMsg.videoUrl) ? <iframe className="w-full aspect-video rounded-xl shadow-lg" src={getYoutubeEmbedUrl(selectedMsg.videoUrl)} frameBorder="0" allowFullScreen></iframe> : <img src={selectedMsg.imageUrl} className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-md" />}
                            </div>
                        )}
                        <div className="flex-1 p-8 flex flex-col bg-[#fdfbf7] overflow-y-auto">
                            <div className="mb-8">
                                <div className={`w-16 h-4 ${WASHI_COLORS[selectedMsg.colorIndex || 0]} mb-6 shadow-sm`}></div>
                                <p style={{ fontFamily: "'Kalam', cursive" }} className="text-2xl text-slate-800 leading-relaxed italic border-l-4 border-blue-100 pl-4">"{selectedMsg.content}"</p>
                            </div>
                            <div className="mt-auto space-y-6 pt-6 border-t border-slate-200">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 border-2 border-white shadow-sm flex items-center justify-center font-bold text-blue-600 text-xl">{selectedMsg.sender?.charAt(0).toUpperCase()}</div>
                                    <div><p className="font-black text-slate-900 text-lg tracking-tight">{selectedMsg.sender}</p><p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Inwave Family</p></div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {selectedMsg.driveUrl && <a href={ensureAbsoluteUrl(selectedMsg.driveUrl)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-cyan-50 text-cyan-700 px-4 py-2 rounded-xl text-xs font-bold border border-cyan-100"><HardDrive size={14} /> Drive</a>}
                                    {selectedMsg.facebookUrl && <a href={ensureAbsoluteUrl(selectedMsg.facebookUrl)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-xs font-bold border border-blue-100"><Facebook size={14} /> Facebook</a>}
                                    {selectedMsg.videoUrl && <a href={ensureAbsoluteUrl(selectedMsg.videoUrl)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-xl text-xs font-bold border border-red-100"><Youtube size={14} /> Video</a>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL VIẾT CHÚC */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-[#fefce8] w-full max-w-md p-8 shadow-2xl relative border-t-[20px] border-yellow-200 rounded-b-xl my-8">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-[-15px] right-2 text-slate-600 hover:text-red-500 transition-colors"><X size={24} /></button>
                        <h3 style={{ fontFamily: "'Kalam', cursive" }} className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2"><Plus className="text-blue-500" /> Thêm lời nhắn...</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input required value={newMsg.sender} onChange={(e) => setNewMsg({ ...newMsg, sender: e.target.value })} placeholder="(VD: Khoa xg)" className="w-full bg-white/70 border-b-2 border-slate-200 p-2.5 outline-none focus:border-blue-500 font-bold" />
                            <textarea required rows="3" value={newMsg.content} onChange={(e) => setNewMsg({ ...newMsg, content: e.target.value })} placeholder="viết lời nhắn của bạn" className="w-full bg-white/70 border-b-2 border-slate-200 p-2.5 outline-none focus:border-blue-500 font-medium italic resize-none"></textarea>
                            <div className="grid grid-cols-2 gap-3">
                                <input value={newMsg.imageUrl} onChange={(e) => setNewMsg({ ...newMsg, imageUrl: e.target.value })} placeholder="URL Ảnh" className="w-full text-[10px] bg-white/50 border-b p-2 outline-none" />
                                <input value={newMsg.videoUrl} onChange={(e) => setNewMsg({ ...newMsg, videoUrl: e.target.value })} placeholder="Link Youtube" className="w-full text-[10px] bg-white/50 border-b p-2 outline-none" />
                                <input value={newMsg.driveUrl} onChange={(e) => setNewMsg({ ...newMsg, driveUrl: e.target.value })} placeholder="Link Drive" className="w-full text-[10px] bg-white/50 border-b p-2 outline-none" />
                                <input value={newMsg.facebookUrl} onChange={(e) => setNewMsg({ ...newMsg, facebookUrl: e.target.value })} placeholder="Link FB" className="w-full text-[10px] bg-white/50 border-b p-2 outline-none" />
                            </div>
                            <div className="flex items-center gap-3 pt-2">
                                <button type="button" onClick={() => fileInputRef.current.click()} className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border shadow-sm text-blue-500 text-[10px] font-bold uppercase"><Upload size={14} /> Tải trực tiếp</button>
                                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <div className="flex gap-2">{WASHI_COLORS.map((c, i) => (<button key={i} type="button" onClick={() => setNewMsg({ ...newMsg, colorIndex: i })} className={`w-6 h-6 rounded-full ${c} ${newMsg.colorIndex === i ? 'ring-2 ring-slate-800' : ''}`}></button>))}</div>
                                <button disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-2.5 rounded-xl shadow-lg transition-all active:scale-95">GỬI ❤️</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 15s linear infinite; }
      `}</style>
        </div>
    );
};

export default App;