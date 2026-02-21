import React from 'react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/Footer';
import Header from '../components/Header';

const MainLayout = ({ children, title, breadcrumbs, quickStats }) => {
  return (
    <div className="min-h-screen bg-background dark:bg-background-dark flex">
      <Sidebar />
      <div className="flex-1 ml-0 lg:ml-64 flex flex-col">
        <Navbar />
        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            <Header 
              title={title} 
              breadcrumbs={breadcrumbs}
              quickStats={quickStats}
            />
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
