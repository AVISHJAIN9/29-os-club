import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ className = '', ...props }) => (
  <div
    className={`bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm ${className}`}
    {...props}
  />
);

export const CardHeader: React.FC<CardProps> = ({ className = '', ...props }) => (
  <div className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 ${className}`} {...props} />
);

export const CardTitle: React.FC<CardProps> = ({ className = '', ...props }) => (
  <h2 className={`text-lg font-semibold text-gray-900 dark:text-white ${className}`} {...props} />
);

export const CardContent: React.FC<CardProps> = ({ className = '', ...props }) => (
  <div className={`px-6 py-4 ${className}`} {...props} />
);

export const CardDescription: React.FC<CardProps> = ({ className = '', ...props }) => (
  <p className={`text-sm text-gray-600 dark:text-gray-400 ${className}`} {...props} />
);

export const CardFooter: React.FC<CardProps> = ({ className = '', ...props }) => (
  <div
    className={`px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2 ${className}`}
    {...props}
  />
);
