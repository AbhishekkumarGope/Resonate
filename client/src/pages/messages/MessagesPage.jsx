import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, Send, MapPin, Image, Phone, Video, Search,
  CheckCheck, MoreVertical, Circle, ShieldCheck
} from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';

export const MessagesPage = () => {
  const { user, userLocation } = useAuth();
  const { socket, onlineStatusMap } = useSocket();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch all user chats on load
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await api.get('/chats');
        if (res.data?.chats?.length > 0) {
          setChats(res.data.chats);
          setActiveChat(res.data.chats[0]);
        }
      } catch (err) {
        console.error('Failed to load chats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, []);

  // Fetch messages when activeChat changes and join socket room
  useEffect(() => {
    if (!activeChat?._id) return;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/chats/${activeChat._id}/messages`);
        if (res.data?.messages) {
          setMessages(res.data.messages);
        }
      } catch (err) {
        console.error('Failed to load messages', err);
      }
    };
    fetchMessages();

    if (socket) {
      socket.emit('join_room', activeChat._id);

      const messageListener = (msg) => {
        if (msg.chat === activeChat._id || msg.chat?._id === activeChat._id) {
          setMessages(prev => [...prev, msg]);
        }
      };

      const typingListener = (data) => {
        if (data.chatId === activeChat._id) {
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 3000);
        }
      };

      socket.on('receive_message', messageListener);
      socket.on('user_typing', typingListener);

      return () => {
        socket.emit('leave_room', activeChat._id);
        socket.off('receive_message', messageListener);
        socket.off('user_typing', typingListener);
      };
    }
  }, [activeChat?._id, socket]);

  // Scroll to bottom on message update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeChat) return;

    const content = inputMessage.trim();
    setInputMessage('');

    if (socket && socket.connected) {
      socket.emit('send_message', {
        chatId: activeChat._id,
        content,
        type: 'text'
      });
    } else {
      // REST fallback
      try {
        const res = await api.post(`/chats/${activeChat._id}/messages`, {
          content,
          type: 'text'
        });
        if (res.data?.message) {
          setMessages(prev => [...prev, res.data.message]);
        }
      } catch (err) {
        console.error('Failed to send message via REST', err);
      }
    }
  };

  const handleShareLocation = async () => {
    if (!activeChat) return;
    const locationData = {
      latitude: userLocation?.latitude || 23.3441,
      longitude: userLocation?.longitude || 85.3096
    };

    if (socket && socket.connected) {
      socket.emit('send_message', {
        chatId: activeChat._id,
        content: `📍 Live Location: ${userLocation?.city || 'Ranchi, Jharkhand'}`,
        type: 'location',
        location: locationData
      });
    } else {
      await api.post(`/chats/${activeChat._id}/messages`, {
        content: `📍 Live Location: ${userLocation?.city || 'Ranchi, Jharkhand'}`,
        type: 'location',
        location: locationData
      });
    }
  };

  const getOtherParticipant = (chat) => {
    if (!chat || !chat.participants) return { name: 'Resonator User' };
    const other = chat.participants.find(p => p._id !== user?._id);
    return other || chat.participants[0] || { name: 'Chat Member' };
  };

  const currentOtherUser = getOtherParticipant(activeChat);

  return (
    <AppLayout showRightSidebar={false} fullWidth={true}>
      <div className="bg-white rounded-3xl shadow-card border border-slate-200/80 h-[720px] flex overflow-hidden">
        {/* Left Chats List Sidebar */}
        <div className="w-80 border-r border-slate-200 flex flex-col shrink-0 bg-slate-50/50">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Messages</h2>
            <div className="relative mt-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full pl-9 pr-3 py-1.5 bg-white text-xs rounded-xl border border-slate-200 outline-none focus:border-brand-coral"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {chats.length > 0 ? (
              chats.map((chat) => {
                const other = getOtherParticipant(chat);
                const isActive = activeChat?._id === chat._id;
                const isOnline = onlineStatusMap[other._id] || other.isOnline;

                return (
                  <div
                    key={chat._id}
                    onClick={() => setActiveChat(chat)}
                    className={`p-3.5 flex items-center gap-3 cursor-pointer transition ${
                      isActive ? 'bg-white shadow-xs border-l-4 border-brand-coral' : 'hover:bg-slate-100/60'
                    }`}
                  >
                    <div className="relative">
                      <div className="w-11 h-11 rounded-2xl bg-brand-coral text-white font-bold text-xs flex items-center justify-center overflow-hidden">
                        {other.profileImage ? (
                          <img src={other.profileImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          other.name?.[0] || 'U'
                        )}
                      </div>
                      {isOnline && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{other.name}</h4>
                        <span className="text-[10px] text-slate-400">12:30 PM</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {chat.lastMessage?.content || 'Click to start chatting'}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <span>No active chats yet. Start a conversation from the directory!</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Active Conversation Canvas */}
        {activeChat ? (
          <div className="flex-1 flex flex-col bg-white">
            {/* Chat Header */}
            <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-coral text-white font-bold text-xs flex items-center justify-center overflow-hidden">
                  {currentOtherUser.profileImage ? (
                    <img src={currentOtherUser.profileImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    currentOtherUser.name?.[0] || 'U'
                  )}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                    {currentOtherUser.name}
                    {currentOtherUser.verification?.isVerified && (
                      <span className="text-brand-teal text-xs">✓</span>
                    )}
                  </h3>
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <Circle className="w-2 h-2 fill-current" />
                    Online in Ranchi
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleShareLocation}
                  className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-brand-coral hover:bg-rose-100 rounded-xl text-xs font-bold transition"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Share Location</span>
                </button>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-6 overflow-y-auto bg-[#F8FAFC] flex flex-col gap-3">
              {messages.map((msg, idx) => {
                const isMe = msg.sender?._id === user?._id || msg.sender === user?._id;

                return (
                  <div
                    key={msg._id || idx}
                    className={`flex flex-col max-w-sm ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
                  >
                    <div
                      className={`p-3.5 rounded-2xl text-xs font-medium leading-relaxed shadow-xs ${
                        isMe
                          ? 'bg-slate-900 text-white rounded-br-none'
                          : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none'
                      }`}
                    >
                      {msg.type === 'location' ? (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-brand-coral shrink-0" />
                          <span>{msg.content}</span>
                        </div>
                      ) : (
                        <span>{msg.content}</span>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1 px-1">
                      {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}

              {isTyping && (
                <div className="self-start text-[11px] font-semibold text-slate-400 italic">
                  {currentOtherUser.name} is typing...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Box */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 flex items-center gap-2">
              <button
                type="button"
                onClick={handleShareLocation}
                className="p-2 text-slate-400 hover:text-brand-coral hover:bg-slate-100 rounded-xl transition"
                title="Share GPS Location"
              >
                <MapPin className="w-5 h-5" />
              </button>

              <input
                type="text"
                value={inputMessage}
                onChange={(e) => {
                  setInputMessage(e.target.value);
                  if (socket && activeChat) {
                    socket.emit('typing', { chatId: activeChat._id });
                  }
                }}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-xs font-medium rounded-2xl border border-slate-200 focus:border-brand-coral outline-none"
              />

              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="p-2.5 bg-brand-coral hover:bg-brand-coralDark disabled:opacity-50 text-white rounded-2xl shadow-coral transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <MessageSquare className="w-12 h-12 text-slate-300 mb-2" />
            <h3 className="text-base font-bold text-slate-700">Select a chat to begin messaging</h3>
            <p className="text-xs text-slate-400 mt-1">Real-time chat with Socket.IO enabled</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
