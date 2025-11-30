import React from 'react'
import Shuffle from './Shuffle';
import TextType from './TextType';
import Magnet from './Magnet'


const Hero = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900"> {/* Added dark background for contrast */}
            <div className="container mx-auto px-4">
                <div className="mx-auto text-center flex flex-col items-center justify-center">
                    <Shuffle
                        text="Welcome to JoyAi"
                        shuffleDirection="right"
                        duration={0.35}
                        animationMode="evenodd"
                        shuffleTimes={1}
                        ease="power3.out"
                        stagger={0.03}
                        threshold={0.1}
                        triggerOnce={true}
                        triggerOnHover={true}
                        respectReducedMotion={true}
                        colorTo="#ffffff"
                        style={{ color: '#ffffff' }}
                        className="text-white"
                    />
                    <TextType
                        text={["Create Stunning Images", "Turn Ideas Into Art", "Type. Generate. Wow.!"]}
                        typingSpeed={75}
                        pauseDuration={1500}
                        showCursor={true}
                        cursorCharacter="|"
                        className="text-white text-4xl md:text-6xl lg:text-7xl font-bold leading-tight"
                        style={{
                            color: '#c53ab5',
                            fontSize: 'clamp(1.2rem, 4vw, 4rem)',
                            lineHeight: '1.2'
                        }}
                    />

                    <Magnet
                        padding={30}
                        magnetStrength={1}
                        scaleOnHover={1.05}
                    >
                        <div className="bg-[#c53ab5] cursor-pointer mt-10 hover:text-white text-sm font-semibold px-4 py-3 rounded-lg shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200">
                            Get Started
                        </div>
                    </Magnet>
                </div>
            </div>
        </div>
    )
}

export default Hero