import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface HeroLogoProps {
  className?: string;
}

export function HeroLogo({ className = '' }: HeroLogoProps) {
  const logoRef = useRef<HTMLImageElement>(null);
  
  useEffect(() => {
    if (!logoRef.current) return;
    
    // Animación de carga
    const loadingAnimation = gsap.timeline({ repeat: -1 });
    
    // Animación inicial de opacidad
    loadingAnimation.fromTo(
      logoRef.current,
      { opacity: 0.3, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.8, ease: 'power2.inOut' }
    );
    
    // Animación de rotación continua
    loadingAnimation.to(
      logoRef.current,
      { rotation: 360, duration: 2, ease: 'none', repeat: -1 }
    );
    
    // Animación de pulso
    const pulseAnimation = gsap.timeline({ repeat: -1 });
    pulseAnimation.to(logoRef.current, {
      scale: 1.1,
      duration: 0.5,
      ease: 'power1.inOut'
    }).to(logoRef.current, {
      scale: 0.9,
      duration: 0.5,
      ease: 'power1.inOut'
    });
    
    // Limpieza al desmontar
    return () => {
      loadingAnimation.kill();
      pulseAnimation.kill();
    };
  }, []);
  
  return null;
}