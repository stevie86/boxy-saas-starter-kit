import React from 'react'
import styles from './Badge.module.css'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'info' | 'warning' | 'danger'
  className?: string
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const baseClasses = `${styles.badge} ${styles[variant]}`
  const classes = className ? `${baseClasses} ${className}` : baseClasses
  
  return (
    <span className={classes}>
      {children}
    </span>
  )
}