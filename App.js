// App.js
import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from "./src/contexts/AuthContext.tsx";

export default function App() {
  return (
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
  );
}
