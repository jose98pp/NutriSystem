import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/ConfirmDialog';
import api from '../../config/api';
import { Video, PhoneOff, User, Clock } from 'lucide-react';

export default function VideollamadaRoom() {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const confirm = useConfirm();
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [finishing, setFinishing] = useState(false);
    const [room, setRoom] = useState(null);
    const jitsiRef = useRef(null);
    const apiRef = useRef(null);

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const { data } = await api.get(`/videollamada/${id}/token`);
                setRoom(data.data);
            } catch (error) {
                toast.error('Error al cargar videollamada');
                navigate(`/sesiones/${id}`);
            } finally {
                setLoading(false);
            }
        };
        fetchToken();
    }, [id, navigate, toast]);

    useEffect(() => {
        if (!room) return;
        const loadScript = () => new Promise((resolve, reject) => {
            if (window.JitsiMeetExternalAPI) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://meet.jit.si/external_api.js';
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('No se pudo cargar Jitsi API'));
            document.body.appendChild(script);
        });

        let disposed = false;
        loadScript().then(() => {
            if (disposed) return;
            const domain = 'meet.jit.si';
            const options = {
                roomName: room.room_name,
                parentNode: jitsiRef.current,
                userInfo: { displayName: room.display_name || 'Invitado' },
                configOverwrite: {
                    disableDeepLinking: true,
                    prejoinPageEnabled: true,
                },
                interfaceConfigOverwrite: {
                    MOBILE_APP_PROMO: false,
                },
            };
            apiRef.current = new window.JitsiMeetExternalAPI(domain, options);
            apiRef.current.addListener('videoConferenceJoined', () => {
                handleJoin();
            });
        }).catch(() => {
            // Mantener UI con placeholder si falla
        });

        return () => {
            disposed = true;
            try {
                apiRef.current && apiRef.current.dispose();
            } catch (_) {}
        };
    }, [room]);

    const handleJoin = async () => {
        if (!room) return;
        setJoining(true);
        try {
            await api.post(`/videollamada/${id}/participante-unido`, {
                nombre_participante: room.display_name,
            });
            toast.success('Te has unido a la sala');
        } catch (error) {
            toast.error('No se pudo unir a la sala');
        } finally {
            setJoining(false);
        }
    };

    const handleFinish = async () => {
        const ok = await confirm({
            title: 'Finalizar videollamada',
            message: '¿Deseas finalizar la videollamada?',
            confirmText: 'Finalizar',
            cancelText: 'Cancelar',
            type: 'danger',
        });
        if (!ok) return;
        setFinishing(true);
        try {
            await api.post(`/videollamada/${id}/finalizar`, {});
            toast.success('Videollamada finalizada');
            navigate(`/sesiones/${id}`);
        } catch (error) {
            toast.error('No se pudo finalizar');
        } finally {
            setFinishing(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="card text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando videollamada...</p>
                </div>
            </Layout>
        );
    }

    if (!room) return null;

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <Video className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Videollamada</h2>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">Sala {room.room_name}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleJoin}
                            disabled={joining}
                            className="btn-primary"
                        >
                            {joining ? 'Uniendo...' : 'Unirse'}
                        </button>
                        <button
                            onClick={handleFinish}
                            disabled={finishing}
                            className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center gap-2"
                        >
                            <PhoneOff className="w-4 h-4" />
                            Finalizar
                        </button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <div ref={jitsiRef} className="aspect-video bg-black rounded-lg overflow-hidden" />
                    </div>
                    <div className="space-y-4">
                        <div className="card">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">Participante</h4>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                                    {room.display_name?.charAt(0)?.toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                        <User className="w-4 h-4" /> {room.display_name}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                        <Clock className="w-4 h-4" /> {room.sesion?.duracion_minutos} minutos
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
