import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import styles from '../styles/styles';

export default function AuthenticationScreen({ onAuthenticated }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [db, setDb] = useState(null);

    useEffect(() => {
        const initializeDatabase = async () => {
            try {
                const database = await SQLite.openDatabaseAsync('users.db');
                setDb(database);

                await database.execAsync(`
                    CREATE TABLE IF NOT EXISTS users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        username TEXT UNIQUE,
                        password TEXT,
                        display_name TEXT,
                        bio TEXT,
                        profile_picture TEXT
                    );
                    CREATE TABLE IF NOT EXISTS rated_movies (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_id INTEGER,
                        imdbID TEXT,
                        title TEXT,
                        year TEXT,
                        poster TEXT,
                        rating REAL CHECK(rating >= 1.0 AND rating <= 5.0 AND (rating * 2) = ROUND(rating * 2)),
                        review TEXT,
                        FOREIGN KEY (user_id) REFERENCES users (id),
                        UNIQUE(user_id, imdbID)
                    );
                `);

            } catch (error) {
                console.error('Error initializing database:', error);
            }
        };

        initializeDatabase();
    }, []);

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('Error', 'Please fill in all fields!');
            return;
        }

        try {
            const result = await db.getAllAsync(
                `SELECT * FROM users WHERE username = ? AND password = ?;`,
                [username, password]
            );

            if (result.length > 0) {
                onAuthenticated(result[0]);
            } else {
                Alert.alert('Error', 'Invalid username or password!');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to log in.');
        }
    };

    const handleRegister = async () => {
        if (!username || !password) {
            Alert.alert('Error', 'Please fill in all fields!');
            return;
        }

        try {
            const result = await db.runAsync(
                `INSERT INTO users (username, password) VALUES (?, ?);`,
                [username, password]
            );
            Alert.alert('Success', 'Registration complete. You can now log in.');
            setIsRegistering(false);
        } catch (error) {
            if (error.message.includes('UNIQUE constraint failed')) {
                Alert.alert('Error', 'Username already exists.');
            } else {
                Alert.alert('Error', 'Failed to register.');
            }
        }
    };

    return (
        <View style={styles.container}>
            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                <Text style={styles.title}>MovieFinder</Text>
                <MaterialCommunityIcons name="movie-star" size={32} color='#d27d5c' />
            </View>
            <View style={styles.inputContainer}>
                <TextInput
                    placeholder="Username"
                    style={styles.loginInput}
                    value={username}
                    onChangeText={setUsername}
                    keyboardAppearance="dark"
                />
                <TextInput
                    placeholder="Password"
                    style={styles.loginInput}
                    value={password}
                    onChangeText={setPassword}
                    keyboardAppearance="dark"
                    secureTextEntry
                />

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '80%', marginTop: 20 }}>
                    {isRegistering ? (
                        <TouchableOpacity onPress={handleRegister} style={styles.button}>
                            <Text style={styles.buttonText}>Register</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity onPress={handleLogin} style={styles.button}>
                            <Text style={styles.buttonText}>Log In</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)} style={styles.button}>
                        <Text style={styles.buttonText}>
                            {isRegistering ? 'Switch to Log In' : 'Switch to Register'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

        </View>
    );
}

