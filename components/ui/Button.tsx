import React from 'react'
import styles from './Button.module.css'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  children, 
  ...props 
}: ButtonProps) {
  const baseClasses = `${styles.button} ${styles[variant]} ${styles[size]}`
  const classes = className ? `${baseClasses} ${className}` : baseClasses

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}