import React from 'react';

export default function TypingIndicator({ typingUsers = [] }) {
    if (typingUsers.length === 0) return null;

    const getTypingText = () => {
        if (typingUsers.length === 1) {
            return `${typingUsers[0].name} está escribiendo...`;
        } else if (typingUsers.length === 2) {
            return `${typingUsers[0].name} y ${typingUsers[1].name} están escribiendo...`;
        } else {
            return `${typingUsers.length} personas están escribiendo...`;
        }
    };

    return (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 py-2 px-4">
            <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span>{getTypingText()}</span>
        </div>
    );
}
