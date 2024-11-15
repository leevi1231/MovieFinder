import React, { useState } from 'react';
import { SafeAreaView } from 'react-native';
import AuthenticationScreen from './components/AuthenticationScreen';
import HomeScreen from './components/HomeScreen';

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    return (
        <SafeAreaView style={{ flex: 1 }}>
            {isAuthenticated ? (
                <HomeScreen />
            ) : (
                <AuthenticationScreen onAuthenticated={() => setIsAuthenticated(true)} />
            )}
        </SafeAreaView>
    );
}
