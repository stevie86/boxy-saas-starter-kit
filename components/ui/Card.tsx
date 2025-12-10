import React from 'react'
import styles from './Card.module.css'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  const classes = className ? `${styles.card} ${className}` : styles.card
  
  return (
    <div className={classes}>
      {children}
    </div>
  )
}