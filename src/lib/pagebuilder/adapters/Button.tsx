/**
 * Adapter for @magento/venia-ui/lib/components/Button/button
 * Simple button component compatible with PageBuilder
 */

"use client";
import React, { useRef, ButtonHTMLAttributes } from 'react';
import { useStyle } from './classify';
import defaultClasses from './button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  priority?: 'high' | 'normal' | 'low';
  negative?: boolean;
  onPress?: () => void;
  classes?: Record<string, string>;
}

const getRootClassName = (priority: string = 'normal', negative?: boolean): string =>
  `root_${priority}Priority${negative ? 'Negative' : ''}`;

/**
 * Button component compatible with PageBuilder
 */
const Button: React.FC<ButtonProps> = (props) => {
  const {
    children,
    classes: propClasses,
    priority = 'normal',
    negative = false,
    disabled,
    onPress,
    onClick,
    ...restProps
  } = props;

  const buttonRef = useRef<HTMLButtonElement>(null);
  const classes = useStyle(defaultClasses, propClasses);
  const rootClassName = classes[getRootClassName(priority, negative)];

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onPress) {
      onPress();
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      ref={buttonRef}
      className={rootClassName}
      disabled={disabled}
      onClick={handleClick}
      {...restProps}
    >
      {children}
    </button>
  );
};

export default Button;

