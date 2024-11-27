import React, { useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AuthenticationScreen from './components/AuthenticationScreen';
import Search from './components/Search';
import Profile from './components/Profile';
import Explore from './components/Explore';

const Tab = createBottomTabNavigator();

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    const handleAuthenticated = (user) => {
        setIsAuthenticated(true);
        setCurrentUser(user);
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setCurrentUser(null);
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
                initialRouteName="Explore"
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: styles.tabBar,
                }}
            >
                <Tab.Screen name="Explore" component={Explore} />
                <Tab.Screen name="Search">
                    {() => <Search currentUser={currentUser} />}
                </Tab.Screen>
                <Tab.Screen name="Profile">
                    {() => <Profile currentUser={currentUser} isOwnProfile={true} onLogout={handleLogout} />}
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
