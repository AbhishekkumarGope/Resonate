import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass, Image, Video, Calendar, Smile, Heart, MessageCircle,
  Share2, MoreHorizontal, Users, Sparkles, MapPin, ShieldCheck,
  Plus, CheckCircle, ArrowRight
} from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { TrustScoreBadge } from '../../components/common/TrustScoreBadge';
import { InteractiveMap } from '../../components/map/InteractiveMap';
import api from '../../services/api';

export const Dashboard = () => {
  const { user } = useAuth();
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [companions, setCompanions] = useState([]);
  const [postText, setPostText] = useState('');
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: 'Lori Ferguson',
      role: 'Travel Photographer',
      time: '2 hrs ago',
      avatar: '',
      trustScore: 94,
      isVerified: true,
      content: "I'm thrilled to announce our upcoming sunset photography walk around Ranchi Lake this Sunday! We'll be covering golden hour lighting and reflection captures. Who's joining? 📸🌅",
      image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800&auto=format&fit=crop&q=80',
      likes: 34,
      comments: 8,
      isLiked: false,
    },
    {
      id: 2,
      author: 'Vikram Singh',
      role: 'Certified Trekking Guide',
      time: '4 hrs ago',
      avatar: '',
      trustScore: 88,
      isVerified: true,
      content: "Completed our morning trail run up to Tagore Hill. Weather is crisp and perfect for outdoor adventures this week. Available for companion bookings this weekend! 🏃‍♂️⛰️",
      image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&auto=format&fit=crop&q=80',
      likes: 42,
      comments: 12,
      isLiked: true,
    }
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, eventsRes, companionsRes] = await Promise.all([
          api.get('/users/nearby?maxDistance=50000').catch(() => ({ data: { users: [] } })),
          api.get('/events/nearby').catch(() => ({ data: { events: [] } })),
          api.get('/companions/nearby').catch(() => ({ data: { companions: [] } }))
        ]);

        if (usersRes.data?.users?.length) setNearbyUsers(usersRes.data.users);
        if (eventsRes.data?.events?.length) setEvents(eventsRes.data.events);
        if (companionsRes.data?.companions?.length) setCompanions(companionsRes.data.companions);
      } catch (e) {
        console.error('Error fetching dashboard feed', e);
      }
    };
    fetchData();
  }, []);

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!postText.trim()) return;

    const newPost = {
      id: Date.now(),
      author: user?.name || 'You',
      role: 'Member',
      time: 'Just now',
      avatar: user?.profileImage || '',
      trustScore: user?.trustScore || 85,
      isVerified: user?.verification?.isVerified || false,
      content: postText,
      likes: 0,
      comments: 0,
      isLiked: false,
    };

    setPosts([newPost, ...posts]);
    setPostText('');
  };

  const handleLike = (id) => {
    setPosts(posts.map(p => {
      if (p.id === id) {
        return {
          ...p,
          likes: p.isLiked ? p.likes - 1 : p.likes + 1,
          isLiked: !p.isLiked
        };
      }
      return p;
    }));
  };

  // Demo stories
  const stories = [
    { name: 'You', isMe: true, image: user?.profileImage },
    { name: 'Priya', title: 'Yoga Session', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80' },
    { name: 'Rahul', title: 'Photo Walk', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
    { name: 'Sneha', title: 'Street Food', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
    { name: 'Amit', title: 'Jam Night', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
  ];

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        {/* Stories Horizontal Tray (Inspired directly by Reference Image 2) */}
        <div className="bg-white rounded-3xl p-4 shadow-card border border-slate-200/80 overflow-hidden">
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            {/* Create Story card */}
            <div className="w-24 h-36 shrink-0 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center p-2 text-center cursor-pointer hover:border-brand-coral hover:bg-rose-50/40 transition group">
              <div className="w-9 h-9 rounded-full bg-brand-coral text-white flex items-center justify-center shadow-coral group-hover:scale-110 transition mb-2">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-extrabold text-slate-800">Post Story</span>
            </div>

            {/* Stories */}
            {stories.slice(1).map((st, i) => (
              <div
                key={i}
                className="w-24 h-36 shrink-0 rounded-2xl overflow-hidden relative shadow-sm cursor-pointer group hover:scale-102 transition transform"
              >
                <img src={st.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-2 left-2 w-7 h-7 rounded-full ring-2 ring-brand-coral overflow-hidden bg-slate-200">
                  <img src={st.image} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="absolute bottom-2 left-2 right-2 text-left">
                  <span className="block text-[11px] font-bold text-white leading-tight truncate">{st.name}</span>
                  <span className="block text-[9px] text-slate-300 truncate">{st.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Share your thoughts / Activity Post Creator Box */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-card border border-slate-200/80">
          <form onSubmit={handleCreatePost}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-coral text-white font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  user?.name?.[0]?.toUpperCase() || 'U'
                )}
              </div>
              <input
                type="text"
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder="Share your thoughts, plan an activity or meet up..."
                className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs font-medium py-3 px-4 rounded-2xl border border-slate-200 focus:border-brand-coral outline-none transition"
              />
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-1 sm:gap-2 text-xs font-semibold text-slate-600">
                <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition">
                  <Image className="w-4 h-4 text-emerald-500" />
                  <span className="hidden sm:inline">Photo</span>
                </button>
                <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-sky-50 hover:text-sky-600 transition">
                  <Video className="w-4 h-4 text-sky-500" />
                  <span className="hidden sm:inline">Video</span>
                </button>
                <Link to="/events/create" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-amber-50 hover:text-amber-600 transition">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  <span className="hidden sm:inline">Event</span>
                </Link>
                <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-purple-50 hover:text-purple-600 transition">
                  <Smile className="w-4 h-4 text-purple-500" />
                  <span className="hidden sm:inline">Activity</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={!postText.trim()}
                className="px-4 py-2 bg-brand-coral hover:bg-brand-coralDark disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-coral transition"
              >
                Post Update
              </button>
            </div>
          </form>
        </div>

        {/* Live Geolocation Radar Banner Card */}
        <div className="bg-gradient-to-r from-slate-900 via-brand-dark to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
          <div className="relative z-10 max-w-md">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-coral/20 border border-brand-coral/40 text-brand-coral text-xs font-extrabold mb-2">
              <Compass className="w-3.5 h-3.5 animate-spin-slow" />
              <span>LIVE GEOLOCATION RADAR</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Find People & Activities Nearby in Ranchi
            </h2>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              Scan your 25km radius to discover verified companions, local group meetups, and gear available for rent.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <Link
                to="/discovery"
                className="px-5 py-2.5 bg-brand-coral hover:bg-brand-coralDark text-white text-xs font-extrabold rounded-2xl shadow-coral transition flex items-center gap-2"
              >
                <span>Launch Interactive Radar</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/companions"
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-2xl border border-white/20 transition"
              >
                Browse Companions
              </Link>
            </div>
          </div>

          {/* Radar circle graphic representation */}
          <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-brand-coral/30 radar-ring" />
            <div className="w-36 h-36 rounded-full bg-brand-coral/20 border border-brand-coral/60 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-brand-coral/40 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-brand-coral flex items-center justify-center text-white font-extrabold shadow-coral text-xs animate-pulse">
                  GPS
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Activity Feed Posts */}
        <div className="flex flex-col gap-5">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-3xl p-5 shadow-card border border-slate-200/80">
              {/* Post Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-teal to-sky-400 text-white font-bold text-sm flex items-center justify-center shadow-sm overflow-hidden">
                    {post.avatar ? <img src={post.avatar} alt="" className="w-full h-full object-cover" /> : post.author[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-extrabold text-xs text-slate-900">{post.author}</h4>
                      {post.isVerified && (
                        <span className="text-brand-teal text-xs" title="ID Verified">✓</span>
                      )}
                      <span className="text-[10px] text-slate-400">• {post.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">{post.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <TrustScoreBadge score={post.trustScore} size="sm" />
                  <button className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Post Content */}
              <p className="text-xs text-slate-800 font-medium mt-3.5 leading-relaxed">
                {post.content}
              </p>

              {/* Post Image */}
              {post.image && (
                <div className="mt-3.5 rounded-2xl overflow-hidden max-h-96 border border-slate-100">
                  <img src={post.image} alt="" className="w-full h-full object-cover hover:scale-102 transition duration-300" />
                </div>
              )}

              {/* Post Actions */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-600">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
                    post.isLiked ? 'text-rose-600 bg-rose-50' : 'hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current text-rose-600' : ''}`} />
                  <span>{post.likes} Likes</span>
                </button>

                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition">
                  <MessageCircle className="w-4 h-4" />
                  <span>{post.comments} Comments</span>
                </button>

                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition">
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};
