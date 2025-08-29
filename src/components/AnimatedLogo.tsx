import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface AnimatedLogoProps {
  className?: string;
}

export function AnimatedLogo({ className = '' }: AnimatedLogoProps) {
  const logoRef = useRef<HTMLImageElement>(null);
  
  useEffect(() => {
    if (!logoRef.current) return;
    
    // Animación inicial
    gsap.fromTo(
      logoRef.current,
      { opacity: 0, scale: 0.8, rotation: -10 },
      { opacity: 1, scale: 1, rotation: 0, duration: 1.2, ease: 'elastic.out(1, 0.5)' }
    );

    // Animación de hover al pasar el cursor
    const hoverAnimation = () => {
      gsap.to(logoRef.current, {
        rotation: 5,
        scale: 1.1,
        duration: 0.3,
        ease: 'power2.out'
      });
    };

    // Animación al quitar el cursor
    const leaveAnimation = () => {
      gsap.to(logoRef.current, {
        rotation: 0,
        scale: 1,
        duration: 0.5,
        ease: 'elastic.out(1, 0.5)'
      });
    };

    // Animación de pulso continua
    const pulseAnimation = gsap.timeline({ repeat: -1, yoyo: true });
    pulseAnimation.to(logoRef.current, {
      scale: 1.05,
      duration: 1.5,
      ease: 'sine.inOut'
    });

    // Agregar event listeners
    const logoElement = logoRef.current;
    logoElement.addEventListener('mouseenter', hoverAnimation);
    logoElement.addEventListener('mouseleave', leaveAnimation);

    // Limpieza al desmontar
    return () => {
      pulseAnimation.kill();
      logoElement.removeEventListener('mouseenter', hoverAnimation);
      logoElement.removeEventListener('mouseleave', leaveAnimation);
    };
  }, []);

  return (
    <img
      ref={logoRef}
      src="/trabajo.png"
      alt="Lugar de Refugio"
      className={`w-10 h-10 object-contain ${className}`}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.onerror = null;
        target.style.display = 'none';
      }}
    />
  );
}