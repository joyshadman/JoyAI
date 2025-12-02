import React from 'react';
import Navbar from '../components/Navbar.jsx';
import Hero from '../components/Hero.jsx';

const Homepage = () => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <Navbar />
      <Hero />
    </div>

  );
};

export default Homepage;
