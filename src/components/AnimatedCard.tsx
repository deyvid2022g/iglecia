import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function AnimatedCard({ children, delay = 0, className = '' }: AnimatedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!cardRef.current) return;
    
    // Animación de entrada
    gsap.fromTo(
      cardRef.current,
      { 
        opacity: 0, 
        y: 30,
        scale: 0.95
      },
      { 
        opacity: 1, 
        y: 0,
        scale: 1,
        duration: 0.8,
        delay: delay,
        ease: 'power2.out'
      }
    );
    
    // Configurar animación de hover
    const hoverAnimation = (isHovering: boolean) => {
      gsap.to(cardRef.current, {
        y: isHovering ? -5 : 0,
        boxShadow: isHovering 
          ? '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        scale: isHovering ? 1.02 : 1,
        duration: 0.3,
        ease: 'power2.out'
      });
    };
    
    const card = cardRef.current;
    card.addEventListener('mouseenter', () => hoverAnimation(true));
    card.addEventListener('mouseleave', () => hoverAnimation(false));
    
    return () => {
      card.removeEventListener('mouseenter', () => hoverAnimation(true));
      card.removeEventListener('mouseleave', () => hoverAnimation(false));
    };
  }, [delay]);
  
  return (
    <div
      ref={cardRef}
      className={`transition-shadow duration-300 ${className}`}
    >
      {children}
    </div>
  );
}