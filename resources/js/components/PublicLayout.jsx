import React from 'react';
import PublicHeader from './PublicHeader';
import Footer from './Footer';
import ChatBot from './ChatBot';

const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-hero">
      <PublicHeader />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <ChatBot />
    </div>
  );
};

export default PublicLayout;
