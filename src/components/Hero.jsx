import React from 'react'
import Shuffle from './Shuffle';
import TextType from './TextType';
import Magnet from './Magnet';
import PixelBlast from './PixelBlast';
import { Link } from 'react-router-dom';


const Hero = () => {
    return (
        <div className="relative min-h-screen w-full overflow-hidden">
            <div
                className="absolute inset-0"
                style={{
                    background: `
            radial-gradient(circle at 30% 20%, rgba(20,20,30,0.3), transparent 50%),
            radial-gradient(circle at 70% 80%, rgba(30,20,50,0.25), transparent 50%),
            linear-gradient(135deg, #050008, #0a0012, #07000d)
          `,
                    zIndex: 0
                }}
            ></div>

            <PixelBlast
                variant="circle"
                pixelSize={6}
                color="#FF5CFF"
                patternScale={3}
                patternDensity={1.5}
                pixelSizeJitter={0.6}
                enableRipples
                rippleSpeed={0.5}
                rippleThickness={0.15}
                rippleIntensityScale={2}
                liquid
                liquidStrength={0.15}
                liquidRadius={1.5}
                liquidWobbleSpeed={6}
                speed={0.8}
                edgeFade={0.2}
                transparent={false}
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 5,
                    pointerEvents: 'none',
                }}
            />

            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 
          w-[600px] h-[600px] rounded-full 
          bg-[#FF5CFF]/30 blur-[150px] pointer-events-none"></div>

                <div className="container mx-auto px-4 text-center flex flex-col items-center">
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
                        className="text-white text-3xl md:text-5xl font-semibold tracking-wide"
                    />

                    <TextType
                        text={[
                            "Create Stunning Images",
                            "Turn Ideas Into Art",
                            "Type. Generate. Wow.!"
                        ]}
                        typingSpeed={75}
                        pauseDuration={1500}
                        showCursor={true}
                        cursorCharacter="|"
                        className="text-white font-extrabold mt-4"
                        style={{
                            color: '#FF5CFF',
                            fontSize: 'clamp(1.5rem, 5vw, 4.5rem)',
                            lineHeight: '1.1',
                            textShadow: '0 0 25px rgba(255,92,255,0.7)',
                        }}
                    />

                    <p className="text-gray-300 mt-6 max-w-xl text-lg leading-relaxed">
                        Your AI companion for generating breathtaking visuals from simple text prompts.
                    </p>
                    <Link to="/prompt">
                        <Magnet padding={30} magnetStrength={1} scaleOnHover={1.05}>
                            <div
                                className="
                bg-[#FF5CFF]
                cursor-pointer 
                mt-10 
                px-6 
                py-3.5 
                rounded-xl 
                text-white 
                text-base 
                font-semibold 
                tracking-wide
                shadow-[0px_0px_50px_rgba(255,92,255,0.6)]
                hover:shadow-[0px_0px_80px_RGBA(255,92,255,0.8)]
                hover:scale-105
                transition-all duration-300
              "
                            >
                                Get Started
                            </div>
                        </Magnet>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Hero;
