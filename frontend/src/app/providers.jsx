import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';

/**
 * AppProviders - Wraps the application with all necessary context providers
 * 
 * @param {React.ReactNode} children - Child components to wrap
 */
function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}

export default AppProviders;
