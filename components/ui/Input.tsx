import React from 'react'
import styles from './Input.module.css'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export function Input({ label, error, helperText, className = '', ...props }: InputProps) {
  const inputClasses = `${styles.input} ${error ? styles.error : ''} ${className}`
  
  return (
    <div className={styles.container}>
      {label && (
        <label className={styles.label} htmlFor={props.id}>
          {label}
          {props.required && <span className={styles.required}>*</span>}
        </label>
      )}
      <input className={inputClasses} {...props} />
      {error && <div className={styles.errorText}>{error}</div>}
      {helperText && !error && <div className={styles.helperText}>{helperText}</div>}
    </div>
  )
}