// Dark mode utility classes for consistent theming
export const darkModeClasses = {
  // Status colors with dark mode variants
  status: {
    success: "text-green-500 dark:text-green-400",
    error: "text-red-500 dark:text-red-400", 
    warning: "text-yellow-500 dark:text-yellow-400",
    info: "text-blue-500 dark:text-blue-400",
  },
  
  // Background colors
  background: {
    primary: "bg-white dark:bg-gray-800",
    secondary: "bg-gray-50 dark:bg-gray-900",
    card: "bg-white dark:bg-gray-700",
    overlay: "bg-white/10 dark:bg-black/20",
  },
  
  // Text colors
  text: {
    primary: "text-gray-900 dark:text-gray-100",
    secondary: "text-gray-600 dark:text-gray-300", 
    muted: "text-gray-500 dark:text-gray-400",
    accent: "text-teal-600 dark:text-teal-400",
  },
  
  // Border colors
  border: {
    default: "border-gray-300 dark:border-gray-600",
    focus: "border-teal-500 dark:border-teal-400",
  },
  
  // Input styles
  input: {
    default: "border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:border-teal-500 dark:focus:border-teal-400 focus:ring-teal-200 dark:focus:ring-teal-800",
  },
  
  // Button styles
  button: {
    primary: "bg-teal-500 dark:bg-teal-600 text-white hover:bg-teal-600 dark:hover:bg-teal-700",
    secondary: "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700",
  }
};

// Utility function to combine dark mode classes
export const dm = (...classes: string[]) => classes.join(" ");

// Status icon color helper
export const getStatusIconColor = (status: 'success' | 'error' | 'warning' | 'info') => {
  return darkModeClasses.status[status];
};

// Common component class combinations
export const commonClasses = {
  errorText: darkModeClasses.status.error,
  successText: darkModeClasses.status.success,
  mutedText: darkModeClasses.text.muted,
  primaryText: darkModeClasses.text.primary,
  secondaryText: darkModeClasses.text.secondary,
  card: `${darkModeClasses.background.card} ${darkModeClasses.border.default}`,
  input: darkModeClasses.input.default,
  primaryButton: darkModeClasses.button.primary,
  secondaryButton: darkModeClasses.button.secondary,
};
