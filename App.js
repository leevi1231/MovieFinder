import React, { useState } from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AuthenticationScreen from './components/AuthenticationScreen';
import Search from './components/Search';
import Profile from './components/Profile';
import Explore from './components/Explore';

import styles from './styles/styles';

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
            <SafeAreaView style={styles.container}>
                <AuthenticationScreen onAuthenticated={handleAuthenticated} />
            </SafeAreaView>
        );
    }

    return (
        <>
            <StatusBar
                barStyle="light-content"
                translucent
            />

            <NavigationContainer>
                <Tab.Navigator
                    initialRouteName="Explore"
                    screenOptions={({ route }) => ({
                        headerShown: false,
                        tabBarStyle: styles.tabBar,
                        tabBarIcon: ({ color, size }) => {
                            let iconName;

                            if (route.name === 'Explore') {
                                iconName = 'compass-outline';
                            } else if (route.name === 'Search') {
                                iconName = 'search-outline';
                            } else if (route.name === 'Profile') {
                                iconName = 'person-outline';
                            }

                            return <Ionicons name={iconName} size={size} color={color} />;
                        },
                        tabBarActiveTintColor: 'rgba(179, 160, 137, 1)',
                        tabBarInactiveTintColor: 'rgba(179, 160, 137, 0.35)',
                    })}
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
        </>
    );
}