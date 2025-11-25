import React from 'react';

export default function PresenceIndicator({ presence, showLabel = false, size = 'sm' }) {
    if (!presence) return null;

    const sizeClasses = {
        xs: 'w-2 h-2',
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
    };

    const statusColors = {
        online: 'bg-green-500',
        away: 'bg-yellow-500',
        offline: 'bg-gray-400',
    };

    const statusLabels = {
        online: 'En línea',
        away: 'Ausente',
        offline: presence.last_seen || 'Desconectado',
    };

    return (
        <div className="flex items-center gap-2">
            <div className="relative">
                <div
                    className={`${sizeClasses[size]} ${statusColors[presence.status]} rounded-full border-2 border-white dark:border-gray-800`}
                    title={statusLabels[presence.status]}
                />
                {presence.status === 'online' && (
                    <div
                        className={`absolute inset-0 ${statusColors[presence.status]} rounded-full animate-ping opacity-75`}
                    />
                )}
            </div>
            {showLabel && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    {statusLabels[presence.status]}
                </span>
            )}
        </div>
    );
}
