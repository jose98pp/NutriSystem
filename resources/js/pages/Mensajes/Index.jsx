import React, { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { 
    MessageCircle, Send, Search, Plus, Paperclip, Smile, 
    MoreVertical, Check, CheckCheck, X, Image as ImageIcon,
    File, Calendar, Clock, Edit2, Trash2, Save
} from 'lucide-react';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/ConfirmDialog';

const MensajesIndex = () => {
    const { user } = useAuth();
    const toast = useToast();
    const confirm = useConfirm();
    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [searchUsers, setSearchUsers] = useState([]);
    const [showSearch, setShowSearch] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [conversationFilter, setConversationFilter] = useState('todas'); // todas, no_leidas
    const [conversationSearch, setConversationSearch] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [editingMessage, setEditingMessage] = useState(null);
    const [editText, setEditText] = useState('');
    const [messageMenuOpen, setMessageMenuOpen] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null);
    const [searchInChat, setSearchInChat] = useState('');
    const [showChatSearch, setShowChatSearch] = useState(false);
    const [filePreview, setFilePreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [userScrolledUp, setUserScrolledUp] = useState(false);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const fileInputRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const audioRef = useRef(null);
    const previousMessageCountRef = useRef(0);
    
    // Emojis comunes
    const commonEmojis = ['😊', '😂', '❤️', '👍', '👏', '🎉', '🔥', '💪', '🙏', '😍', '😢', '😮', '🤔', '👌', '✨', '🎯', '💯', '🚀', '⭐', '🌟'];

    useEffect(() => {
        fetchConversations();
        const src = new URL('/sounds/notification.mp3', window.location.origin).toString();
        audioRef.current = new Audio(src);
        audioRef.current.preload = 'auto';
    }, []);

    // Actualizar usuarios online cuando cambien las conversaciones
    useEffect(() => {
        if (conversations.length === 0) return;
        
        // Simular usuarios online (en producción esto vendría de WebSocket)
        const simulateOnlineUsers = () => {
            // Por ahora, marcar usuarios con conversaciones recientes como online
            const recentUsers = conversations
                .filter(conv => {
                    const lastMsg = conv.ultimo_mensaje;
                    if (!lastMsg) return false;
                    const msgDate = new Date(lastMsg.created_at);
                    const now = new Date();
                    const diffMinutes = (now - msgDate) / (1000 * 60);
                    return diffMinutes < 30; // Online si tuvo actividad en últimos 30 min
                })
                .map(conv => conv.usuario.id);
            
            setOnlineUsers(new Set(recentUsers));
        };
        
        simulateOnlineUsers();
        const onlineInterval = setInterval(simulateOnlineUsers, 60000); // Actualizar cada minuto
        
        return () => clearInterval(onlineInterval);
    }, [conversations]);

    useEffect(() => {
        if (selectedUser) {
            fetchMessages(selectedUser.usuario.id);
            const interval = setInterval(() => {
                fetchMessages(selectedUser.usuario.id);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [selectedUser]);

    // Detectar nuevos mensajes y reproducir sonido
    useEffect(() => {
        if (messages.length > previousMessageCountRef.current && previousMessageCountRef.current > 0) {
            const lastMessage = messages[messages.length - 1];
            // Solo reproducir si el mensaje es de otra persona
            if (lastMessage.id_remitente !== user.id && soundEnabled) {
                playNotificationSound();
            }
        }
        previousMessageCountRef.current = messages.length;
    }, [messages]);

    useEffect(() => {
        // Solo hacer scroll automático si el usuario no ha scrolleado hacia arriba
        if (!userScrolledUp) {
            scrollToBottom();
        }
    }, [messages]);

    // Detectar cuando el usuario hace scroll
    const handleScroll = () => {
        if (!messagesContainerRef.current) return;
        
        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        
        setUserScrolledUp(!isNearBottom);
    };

    useEffect(() => {
        if (searchTerm.length > 2) {
            searchForUsers();
        } else {
            setSearchUsers([]);
        }
    }, [searchTerm]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchConversations = async () => {
        setLoading(true);
        try {
            const response = await api.get('/mensajes/conversaciones');
            setConversations(response.data);
        } catch (error) {
            console.error('Error al cargar conversaciones:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (otherUserId) => {
        try {
            const response = await api.get(`/mensajes/conversacion/${otherUserId}`);
            setMessages(response.data.mensajes);
        } catch (error) {
            console.error('Error al cargar mensajes:', error);
        }
    };

    const searchForUsers = async () => {
        try {
            const response = await api.get(`/mensajes/usuarios/buscar?search=${searchTerm}`);
            setSearchUsers(response.data);
        } catch (error) {
            console.error('Error al buscar usuarios:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if ((!newMessage.trim() && !selectedFile) || !selectedUser) return;

        setSending(true);
        try {
            const formData = new FormData();
            formData.append('id_destinatario', selectedUser.usuario.id);
            formData.append('mensaje', newMessage);
            
            if (selectedFile) {
                formData.append('archivo', selectedFile);
            }

            if (replyingTo) {
                formData.append('reply_to', replyingTo.id_mensaje);
            }

            await api.post('/mensajes', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            setNewMessage('');
            setSelectedFile(null);
            setFilePreview(null);
            setReplyingTo(null);
            setUserScrolledUp(false); // Forzar scroll al enviar
            toast.success('Mensaje enviado');
            await fetchMessages(selectedUser.usuario.id);
            await fetchConversations();
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
            toast.error('Error al enviar mensaje');
        } finally {
            setSending(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            processFile(file);
        }
    };

    const processFile = (file) => {
        if (file.size > 5 * 1024 * 1024) { // 5MB
            toast.error('El archivo no debe superar 5MB');
            return;
        }
        
        setSelectedFile(file);
        
        // Crear preview si es imagen
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFilePreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setFilePreview(null);
        }
        
        toast.success('Archivo seleccionado');
    };

    // Drag and drop handlers
    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        
        const files = e.dataTransfer.files;
        if (files && files[0]) {
            processFile(files[0]);
        }
    };

    const handleTyping = () => {
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
        }, 3000);
    };

    const formatMessageTime = (date) => {
        const messageDate = new Date(date);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (messageDate.toDateString() === today.toDateString()) {
            return messageDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        } else if (messageDate.toDateString() === yesterday.toDateString()) {
            return 'Ayer';
        } else {
            return messageDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
        }
    };

    const getDateSeparator = (date) => {
        const messageDate = new Date(date);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (messageDate.toDateString() === today.toDateString()) {
            return 'Hoy';
        } else if (messageDate.toDateString() === yesterday.toDateString()) {
            return 'Ayer';
        } else {
            return messageDate.toLocaleDateString('es-ES', { 
                day: '2-digit', 
                month: 'long', 
                year: 'numeric' 
            });
        }
    };

    const shouldShowDateSeparator = (currentMsg, previousMsg) => {
        if (!previousMsg) return true;
        
        const currentDate = new Date(currentMsg.created_at).toDateString();
        const previousDate = new Date(previousMsg.created_at).toDateString();
        
        return currentDate !== previousDate;
    };

    const playNotificationSound = () => {
        if (soundEnabled) {
            if (audioRef.current) {
                audioRef.current.play().catch(() => {
                    try {
                        const Ctx = window.AudioContext || window.webkitAudioContext;
                        const ctx = new Ctx();
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        osc.type = 'sine';
                        osc.frequency.value = 880;
                        osc.connect(gain);
                        gain.connect(ctx.destination);
                        gain.gain.setValueAtTime(0.001, ctx.currentTime);
                        gain.gain.exponentialRampToValueAtTime(0.1, ctx.currentTime + 0.01);
                        osc.start();
                        setTimeout(() => {
                            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
                            osc.stop(ctx.currentTime + 0.32);
                        }, 0);
                    } catch (_) {}
                });
            }
        }
    };

    const toggleSound = () => {
        setSoundEnabled(!soundEnabled);
        toast.success(soundEnabled ? 'Sonido desactivado' : 'Sonido activado');
    };

    const isUserOnline = (userId) => {
        return onlineUsers.has(userId);
    };

    const insertEmoji = (emoji) => {
        setNewMessage(prev => prev + emoji);
        setShowEmojiPicker(false);
    };

    const startEditMessage = (message) => {
        setEditingMessage(message.id_mensaje);
        setEditText(message.mensaje);
        setMessageMenuOpen(null);
    };

    const cancelEdit = () => {
        setEditingMessage(null);
        setEditText('');
    };

    const saveEdit = async (messageId) => {
        if (!editText.trim()) {
            toast.error('El mensaje no puede estar vacío');
            return;
        }

        try {
            await api.put(`/mensajes/${messageId}`, {
                mensaje: editText
            });
            toast.success('Mensaje editado');
            setEditingMessage(null);
            setEditText('');
            await fetchMessages(selectedUser.usuario.id);
        } catch (error) {
            console.error('Error al editar mensaje:', error);
            toast.error('Error al editar el mensaje');
        }
    };

    const deleteMessage = async (messageId) => {
        const confirmed = await confirm({
            title: 'Eliminar Mensaje',
            message: '¿Estás seguro de que deseas eliminar este mensaje?',
            confirmText: 'Sí, eliminar',
            cancelText: 'Cancelar',
            type: 'danger'
        });

        if (!confirmed) return;

        try {
            await api.delete(`/mensajes/${messageId}`);
            toast.success('Mensaje eliminado');
            setMessageMenuOpen(null);
            await fetchMessages(selectedUser.usuario.id);
        } catch (error) {
            console.error('Error al eliminar mensaje:', error);
            toast.error('Error al eliminar el mensaje');
        }
    };

    const startNewConversation = (usuario) => {
        setSelectedUser({
            usuario,
            mensajes_no_leidos: 0,
            ultimo_mensaje: null
        });
        setShowSearch(false);
        setSearchTerm('');
        setSearchUsers([]);
        toast.success(`Conversación iniciada con ${usuario.name}`);
    };

    const copyMessageText = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success('Mensaje copiado');
        }).catch(() => {
            toast.error('Error al copiar');
        });
    };

    const replyToMessage = (message) => {
        setReplyingTo(message);
        setMessageMenuOpen(null);
    };

    const cancelReply = () => {
        setReplyingTo(null);
    };

    const highlightSearchTerm = (text) => {
        if (!searchInChat) return text;
        
        const regex = new RegExp(`(${searchInChat})`, 'gi');
        return text.replace(regex, '<mark class="bg-yellow-300 dark:bg-yellow-600">$1</mark>');
    };

    const filteredMessages = messages.filter(msg => {
        if (!searchInChat) return true;
        return msg.mensaje.toLowerCase().includes(searchInChat.toLowerCase());
    });

    // Formatear texto con markdown básico
    const formatMessageText = (text) => {
        if (!text) return '';
        
        // Negrita **texto**
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Cursiva *texto*
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
        // Código `texto`
        text = text.replace(/`(.*?)`/g, '<code class="bg-gray-200 dark:bg-gray-700 px-1 rounded">$1</code>');
        
        return text;
    };

    // Scroll al final
    const scrollToBottomSmooth = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        setUserScrolledUp(false);
    };

    // Detectar Ctrl+Enter para enviar
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            handleSendMessage(e);
        }
    };

    const filteredConversations = conversations.filter(conv => {
        // Filtro por búsqueda
        const matchesSearch = !conversationSearch || 
            conv.usuario.name.toLowerCase().includes(conversationSearch.toLowerCase());
        
        // Filtro por estado
        const matchesFilter = conversationFilter === 'todas' || 
            (conversationFilter === 'no_leidas' && conv.mensajes_no_leidos > 0);
        
        return matchesSearch && matchesFilter;
    });

    const unreadCount = conversations.filter(c => c.mensajes_no_leidos > 0).length;

    return (
        <Layout>
            <div className="h-[calc(100vh-200px)] flex gap-4">
                {/* Panel Izquierdo - Lista de Conversaciones */}
                <div className="w-1/3 bg-white dark:bg-gray-800 rounded-lg shadow-md flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                <MessageCircle size={24} />
                                Mensajes
                            </h2>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={toggleSound}
                                    className={`p-2 rounded-lg transition-colors ${
                                        soundEnabled 
                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50' 
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                    title={soundEnabled ? 'Silenciar notificaciones' : 'Activar notificaciones'}
                                >
                                    {soundEnabled ? '🔔' : '🔕'}
                                </button>
                                <button
                                    onClick={() => setShowSearch(!showSearch)}
                                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                    title="Nueva conversación"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Búsqueda en conversaciones */}
                        <div className="relative mb-3">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={conversationSearch}
                                onChange={(e) => setConversationSearch(e.target.value)}
                                placeholder="Buscar conversaciones..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                            />
                        </div>

                        {/* Filtros */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setConversationFilter('todas')}
                                className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                    conversationFilter === 'todas'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                Todas
                            </button>
                            <button
                                onClick={() => setConversationFilter('no_leidas')}
                                className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
                                    conversationFilter === 'no_leidas'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                No leídas
                                {unreadCount > 0 && (
                                    <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Buscador de usuarios para nueva conversación */}
                        {showSearch && (
                            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Nueva conversación</span>
                                    <button
                                        onClick={() => {
                                            setShowSearch(false);
                                            setSearchTerm('');
                                            setSearchUsers([]);
                                        }}
                                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Buscar usuario..."
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                                />
                                {searchUsers.length > 0 && (
                                    <div className="mt-2 max-h-40 overflow-y-auto border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                                        {searchUsers.map((usuario) => (
                                            <button
                                                key={usuario.id}
                                                onClick={() => startNewConversation(usuario)}
                                                className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-600 border-b dark:border-gray-600 last:border-0 transition-colors"
                                            >
                                                <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{usuario.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{usuario.email}</p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Lista de Conversaciones */}
                    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Cargando...</p>
                            </div>
                        ) : filteredConversations.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                <MessageCircle className="mx-auto mb-3 text-gray-400" size={48} />
                                <p className="text-sm">
                                    {conversationSearch || conversationFilter === 'no_leidas' 
                                        ? 'No se encontraron conversaciones' 
                                        : 'No tienes conversaciones'}
                                </p>
                            </div>
                        ) : (
                            filteredConversations.map((conv) => (
                                <button
                                    key={conv.usuario.id}
                                    onClick={() => setSelectedUser(conv)}
                                    className={`w-full text-left p-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                                        selectedUser?.usuario.id === conv.usuario.id 
                                            ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-600' 
                                            : ''
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                                                {conv.usuario.name.charAt(0).toUpperCase()}
                                            </div>
                                            {/* Estado online */}
                                            {isUserOnline(conv.usuario.id) && (
                                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">
                                                    {conv.usuario.name}
                                                </p>
                                                {conv.ultimo_mensaje && (
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                                                        {formatMessageTime(conv.ultimo_mensaje.created_at)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between">
                                                {conv.ultimo_mensaje && (
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate flex-1">
                                                        {conv.ultimo_mensaje.mensaje}
                                                    </p>
                                                )}
                                                {conv.mensajes_no_leidos > 0 && (
                                                    <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5 ml-2 flex-shrink-0 min-w-[20px] text-center">
                                                        {conv.mensajes_no_leidos}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Panel Derecho - Chat */}
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-md flex flex-col">
                    {selectedUser ? (
                        <>
                            {/* Header del Chat */}
                            <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                            {selectedUser.usuario.name.charAt(0).toUpperCase()}
                                        </div>
                                        {/* Estado online */}
                                        {isUserOnline(selectedUser.usuario.id) && (
                                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-gray-100">{selectedUser.usuario.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                                            {isUserOnline(selectedUser.usuario.id) ? (
                                                <span className="flex items-center gap-1">
                                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                    En línea
                                                </span>
                                            ) : (
                                                selectedUser.usuario.role
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => setShowChatSearch(!showChatSearch)}
                                        className={`p-2 rounded-lg transition-colors ${
                                            showChatSearch 
                                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                                                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                                        }`}
                                        title="Buscar en conversación"
                                    >
                                        <Search size={20} />
                                    </button>
                                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                        <MoreVertical size={20} className="text-gray-600 dark:text-gray-400" />
                                    </button>
                                </div>
                            </div>

                            {/* Mensajes */}
                            <div 
                                ref={messagesContainerRef}
                                onScroll={handleScroll}
                                className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900 relative scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500"
                                onDragEnter={handleDragEnter}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                {/* Overlay de drag & drop */}
                                {isDragging && (
                                    <div className="absolute inset-0 bg-blue-500/20 dark:bg-blue-600/30 backdrop-blur-sm z-50 flex items-center justify-center border-4 border-dashed border-blue-500 dark:border-blue-400 rounded-lg">
                                        <div className="text-center">
                                            <Paperclip size={48} className="mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                                            <p className="text-lg font-semibold text-blue-700 dark:text-blue-300">Suelta el archivo aquí</p>
                                            <p className="text-sm text-blue-600 dark:text-blue-400">Máximo 5MB</p>
                                        </div>
                                    </div>
                                )}

                                {/* Búsqueda en chat */}
                                {showChatSearch && (
                                    <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md mb-4 border border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center gap-2">
                                            <Search size={18} className="text-gray-400" />
                                            <input
                                                type="text"
                                                value={searchInChat}
                                                onChange={(e) => setSearchInChat(e.target.value)}
                                                placeholder="Buscar en esta conversación..."
                                                className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                                                autoFocus
                                            />
                                            <button
                                                onClick={() => {
                                                    setShowChatSearch(false);
                                                    setSearchInChat('');
                                                }}
                                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                            >
                                                <X size={18} className="text-gray-600 dark:text-gray-400" />
                                            </button>
                                        </div>
                                        {searchInChat && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                                {filteredMessages.length} resultado(s) encontrado(s)
                                            </p>
                                        )}
                                    </div>
                                )}

                                {filteredMessages.map((msg, index) => {
                                    const showDateSeparator = shouldShowDateSeparator(msg, filteredMessages[index - 1]);
                                    const isMine = msg.id_remitente === user.id;
                                    
                                    return (
                                        <div key={msg.id_mensaje}>
                                            {/* Separador de fecha */}
                                            {showDateSeparator && (
                                                <div className="flex justify-center my-4">
                                                    <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                                        <Calendar size={12} />
                                                        {getDateSeparator(msg.created_at)}
                                                    </span>
                                                </div>
                                            )}
                                            
                                            {/* Mensaje */}
                                            <div className={`flex group ${isMine ? 'justify-end' : 'justify-start'}`}>
                                                <div className="relative">
                                                    {editingMessage === msg.id_mensaje ? (
                                                        /* Modo edición */
                                                        <div className="max-w-[70%] bg-white dark:bg-gray-700 border-2 border-blue-500 rounded-lg p-3">
                                                            <textarea
                                                                value={editText}
                                                                onChange={(e) => setEditText(e.target.value)}
                                                                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm resize-none"
                                                                rows="3"
                                                                autoFocus
                                                            />
                                                            <div className="flex gap-2 mt-2">
                                                                <button
                                                                    onClick={() => saveEdit(msg.id_mensaje)}
                                                                    className="flex-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm flex items-center justify-center gap-1"
                                                                >
                                                                    <Save size={14} />
                                                                    Guardar
                                                                </button>
                                                                <button
                                                                    onClick={cancelEdit}
                                                                    className="flex-1 px-3 py-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-100 rounded text-sm"
                                                                >
                                                                    Cancelar
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        /* Modo normal */
                                                        <>
                                                            <div className={`max-w-[70%] rounded-lg p-3 ${
                                                                isMine
                                                                    ? 'bg-blue-600 text-white'
                                                                    : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-600'
                                                            }`}>
                                                                {/* Indicador de respuesta */}
                                                                {msg.reply_to && (
                                                                    <div className={`mb-2 pb-2 border-l-2 pl-2 text-xs opacity-75 ${
                                                                        isMine ? 'border-blue-300' : 'border-gray-400 dark:border-gray-500'
                                                                    }`}>
                                                                        <p className="font-semibold">Respondiendo a:</p>
                                                                        <p className="truncate">{msg.reply_to.mensaje || 'Mensaje'}</p>
                                                                    </div>
                                                                )}
                                                                
                                                                <p 
                                                                    className="text-sm whitespace-pre-wrap break-words"
                                                                    dangerouslySetInnerHTML={{ 
                                                                        __html: formatMessageText(searchInChat ? highlightSearchTerm(msg.mensaje) : msg.mensaje) 
                                                                    }}
                                                                />
                                                                <div className={`flex items-center justify-end gap-1 mt-1 ${
                                                                    isMine ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                                                                }`}>
                                                                    <Clock size={10} />
                                                                    <span className="text-xs">
                                                                        {new Date(msg.created_at).toLocaleTimeString('es-ES', {
                                                                            hour: '2-digit',
                                                                            minute: '2-digit'
                                                                        })}
                                                                    </span>
                                                                    {isMine && (
                                                                        <span className="ml-1">
                                                                            {msg.leido ? (
                                                                                <CheckCheck size={14} className="text-blue-200" />
                                                                            ) : (
                                                                                <Check size={14} />
                                                                            )}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            
                                                            {/* Menú de opciones */}
                                                            <div className={`absolute top-0 ${isMine ? 'right-0 -mr-8' : 'left-0 -ml-8'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                                                                <button
                                                                    onClick={() => setMessageMenuOpen(messageMenuOpen === msg.id_mensaje ? null : msg.id_mensaje)}
                                                                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                                                >
                                                                    <MoreVertical size={16} className="text-gray-600 dark:text-gray-400" />
                                                                </button>
                                                                
                                                                {messageMenuOpen === msg.id_mensaje && (
                                                                    <div className={`absolute ${isMine ? 'right-0' : 'left-0'} mt-1 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg shadow-lg py-1 z-10 min-w-[140px]`}>
                                                                        <button
                                                                            onClick={() => replyToMessage(msg)}
                                                                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                                                                        >
                                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                                                            </svg>
                                                                            Responder
                                                                        </button>
                                                                        <button
                                                                            onClick={() => copyMessageText(msg.mensaje)}
                                                                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                                                                        >
                                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                            </svg>
                                                                            Copiar
                                                                        </button>
                                                                        {isMine && (
                                                                            <>
                                                                                <div className="border-t dark:border-gray-600 my-1"></div>
                                                                                <button
                                                                                    onClick={() => startEditMessage(msg)}
                                                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                                                                                >
                                                                                    <Edit2 size={14} />
                                                                                    Editar
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => deleteMessage(msg.id_mensaje)}
                                                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2 text-red-600 dark:text-red-400"
                                                                                >
                                                                                    <Trash2 size={14} />
                                                                                    Eliminar
                                                                                </button>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                
                                {/* Indicador de escribiendo */}
                                {isTyping && (
                                    <div className="flex justify-start">
                                        <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2">
                                            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                <div ref={messagesEndRef} />

                                {/* Botón flotante "Ir al final" */}
                                {userScrolledUp && (
                                    <button
                                        onClick={scrollToBottomSmooth}
                                        className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all transform hover:scale-110 z-20 flex items-center gap-2"
                                        title="Ir al final"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                        </svg>
                                        {messages.length > previousMessageCountRef.current && (
                                            <span className="bg-white text-blue-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                                {messages.length - previousMessageCountRef.current}
                                            </span>
                                        )}
                                    </button>
                                )}
                            </div>

                            {/* Input de Mensaje */}
                            <form onSubmit={handleSendMessage} className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
                                {/* Indicador de respuesta */}
                                {replyingTo && (
                                    <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500 flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
                                                Respondiendo a {replyingTo.id_remitente === user.id ? 'ti mismo' : replyingTo.remitente?.name}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                                {replyingTo.mensaje}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={cancelReply}
                                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 ml-2"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}

                                {/* Vista previa de archivo */}
                                {selectedFile && (
                                    <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                {selectedFile.type.startsWith('image/') ? (
                                                    <ImageIcon size={20} className="text-blue-600 dark:text-blue-400" />
                                                ) : (
                                                    <File size={20} className="text-blue-600 dark:text-blue-400" />
                                                )}
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{selectedFile.name}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {(selectedFile.size / 1024).toFixed(2)} KB
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedFile(null);
                                                    setFilePreview(null);
                                                }}
                                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                        {/* Preview de imagen */}
                                        {filePreview && (
                                            <img 
                                                src={filePreview} 
                                                alt="Preview" 
                                                className="max-h-40 rounded-lg border border-gray-200 dark:border-gray-700"
                                            />
                                        )}
                                    </div>
                                )}
                                
                                <div className="flex items-center gap-2">
                                    {/* Botón adjuntar archivo */}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        accept="image/*,.pdf,.doc,.docx"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                        title="Adjuntar archivo"
                                    >
                                        <Paperclip size={20} />
                                    </button>
                                    
                                    {/* Botón emoji (placeholder) */}
                                    <button
                                        type="button"
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                        title="Emojis"
                                    >
                                        <Smile size={20} />
                                    </button>
                                    
                                    {/* Input de texto */}
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => {
                                            setNewMessage(e.target.value);
                                            handleTyping();
                                        }}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Escribe un mensaje... (Ctrl+Enter para enviar)"
                                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        disabled={sending}
                                    />
                                    
                                    {/* Botón enviar */}
                                    <button
                                        type="submit"
                                        disabled={sending || (!newMessage.trim() && !selectedFile)}
                                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 px-4"
                                    >
                                        {sending ? (
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        ) : (
                                            <>
                                                <Send size={18} />
                                                <span className="hidden sm:inline">Enviar</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                                
                                {/* Emoji picker */}
                                {showEmojiPicker && (
                                    <div className="absolute bottom-20 right-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-y-auto">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Emojis y Formato</h4>
                                            <button
                                                onClick={() => setShowEmojiPicker(false)}
                                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                        
                                        {/* Emojis */}
                                        <div className="mb-4">
                                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Emojis rápidos:</p>
                                            <div className="grid grid-cols-8 gap-2">
                                                {commonEmojis.map((emoji, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => insertEmoji(emoji)}
                                                        className="text-2xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded p-2 transition-colors"
                                                        title={emoji}
                                                    >
                                                        {emoji}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Guía de formato */}
                                        <div className="border-t dark:border-gray-700 pt-3">
                                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Formato de texto:</p>
                                            <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
                                                <div className="flex items-center justify-between">
                                                    <code className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">**texto**</code>
                                                    <span className="font-bold">Negrita</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <code className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">*texto*</code>
                                                    <span className="italic">Cursiva</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <code className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">`texto`</code>
                                                    <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded text-xs">Código</code>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Atajos */}
                                        <div className="border-t dark:border-gray-700 pt-3 mt-3">
                                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Atajos:</p>
                                            <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                                                <div className="flex items-center justify-between">
                                                    <span>Enviar mensaje</span>
                                                    <code className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">Ctrl + Enter</code>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                            <div className="text-center">
                                <MessageCircle className="mx-auto mb-4 text-gray-400" size={64} />
                                <p className="text-lg">Selecciona una conversación para empezar</p>
                                <p className="text-sm mt-2">O inicia una nueva conversación</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default MensajesIndex;
