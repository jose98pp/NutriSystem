import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function OAuthSuccess() {
    const navigate = useNavigate();
    const location = useLocation();
    const { updateUser } = useAuth();
    const processedRef = useRef(false);

    const safeSetItem = (key, value) => {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (_) {
            try {
                sessionStorage.setItem(key, value);
                return true;
            } catch (_) {
                return false;
            }
        }
    };

    const safeGetItem = (key) => {
        try {
            return localStorage.getItem(key);
        } catch (_) {
            try {
                return sessionStorage.getItem(key);
            } catch (_) {
                return null;
            }
        }
    };

    const decodePayload = (p) => {
        const normalized = p.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(normalized));
    };

    useEffect(() => {
        if (processedRef.current) return;
        const params = new URLSearchParams(location.search);
        const payload = params.get('payload');
        if (payload) {
            try {
                const decoded = decodePayload(payload);
                const token = decoded.token;
                const user = decoded.user;
                if (token && user) {
                    safeSetItem('token', token);
                    safeSetItem('user', JSON.stringify(user));
                    updateUser(user);
                    const onboardingDone = safeGetItem('onboardingComplete') === 'true';
                    processedRef.current = true;
                    if (user.role === 'paciente' && !onboardingDone) {
                        safeSetItem('onboardingComplete', 'false');
                        navigate('/onboarding', { replace: true });
                    } else {
                        navigate('/', { replace: true });
                    }
                } else {
                    processedRef.current = true;
                    navigate('/login', { replace: true });
                }
            } catch (e) {
                processedRef.current = true;
                navigate('/login', { replace: true });
            }
        } else {
            processedRef.current = true;
            navigate('/login', { replace: true });
        }
    }, [location.search, navigate, updateUser]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
}