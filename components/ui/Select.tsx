import React from 'react'
import styles from './Select.module.css'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  placeholder?: string
  options?: SelectOption[]
  children?: React.ReactNode
}

export function Select({ 
  label, 
  error, 
  helperText, 
  placeholder, 
  options = [], 
  className = '', 
  children,
  ...props 
}: SelectProps) {
  const selectClasses = `${styles.select} ${error ? styles.error : ''} ${className}`
  
  return (
    <div className={styles.container}>
      {label && (
        <label className={styles.label} htmlFor={props.id}>
          {label}
          {props.required && <span className={styles.required}>*</span>}
        </label>
      )}
      <select className={selectClasses} {...props}>
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
        {children}
      </select>
      {error && <div className={styles.errorText}>{error}</div>}
      {helperText && !error && <div className={styles.helperText}>{helperText}</div>}
    </div>
  )
}