import PixelBlast from '../components/PixelBlast';
import React from 'react'
import Navbar from '../components/Navbar.jsx'
import Hero from '../components/Hero.jsx'


const Homepage = () => {
  return (
    <div>
      <div style={{ width: '100%', height: '700px', position: 'relative' }}>
        <PixelBlast
          variant="circle"
          pixelSize={6}
          color="#B19EEF"
          patternScale={3}
          patternDensity={1.2}
          pixelSizeJitter={0.5}
          enableRipples
          rippleSpeed={0.4}
          rippleThickness={0.12}
          rippleIntensityScale={1.5}
          liquid
          liquidStrength={0.12}
          liquidRadius={1.2}
          liquidWobbleSpeed={5}
          speed={0.6}
          edgeFade={0.25}
          transparent
          style={{ position: 'absolute', top: -100, left: 0 }}
        />
        <Navbar />
        <Hero />
      </div>
    </div>
  )
}

export default Homepage