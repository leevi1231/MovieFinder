import React, { useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AuthenticationScreen from './components/AuthenticationScreen';
import HomeScreen from './components/HomeScreen';
import Profile from './components/Profile';

const Tab = createBottomTabNavigator();

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    const handleAuthenticated = (user) => {
        setIsAuthenticated(true);
        setCurrentUser(user);
    };

    if (!isAuthenticated) {
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <AuthenticationScreen onAuthenticated={handleAuthenticated} />
            </SafeAreaView>
        );
    }

    return (
        <NavigationContainer>
            <Tab.Navigator
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: styles.tabBar,
                }}
            >
                <Tab.Screen name="Home">
                    {() => <HomeScreen currentUser={currentUser} />}
                </Tab.Screen>
                <Tab.Screen name="Profile">
                    {() => <Profile currentUser={currentUser} />}
                </Tab.Screen>
            </Tab.Navigator>
        </NavigationContainer>
    );
}


const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: '#f8f8f8',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    }
});
