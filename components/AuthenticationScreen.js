import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('users.db');

export default function AuthenticationScreen({ onAuthenticated }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);

    const initializeDatabase = async () => {
        try {
            await db.execAsync(`
            DROP TABLE IF EXISTS users;
            CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        );
      `);
            console.log('Database initialized.');
        } catch (error) {
            console.error('Error initializing database:', error);
        }
    };

    useEffect(() => {
        initializeDatabase();
    }, []);

    const handleRegister = async () => {
        if (!username || !password) {
            Alert.alert('Error', 'Please fill in all fields!');
            return;
        }

        try {
            await db.runAsync('INSERT INTO users (username, password) VALUES (?, ?);', [username, password]);
            Alert.alert('Success', 'Account created! You can now log in.');
            setIsRegistering(false);
        } catch (error) {
            if (error.message.includes('UNIQUE constraint failed')) {
                Alert.alert('Error', 'Username is already taken.');
            } else {
                Alert.alert('Error', 'Failed to register.');
                console.error(error);
            }
        }
    };

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('Error', 'Please fill in all fields!');
            return;
        }

        try {
            const results = await db.getAllAsync(
                'SELECT * FROM users WHERE username = ? AND password = ?;',
                [username, password]
            );
            if (results.length > 0) {
                onAuthenticated();
            } else {
                Alert.alert('Error', 'Invalid username or password!');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to log in.');
            console.error(error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{isRegistering ? 'Register' : 'Sign In'}</Text>

            <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
            />

            {isRegistering ? (
                <Button title="Register" onPress={handleRegister} />
            ) : (
                <Button title="Sign In" onPress={handleLogin} />
            )}

            <Button
                title={isRegistering ? 'Go to Sign In' : 'Create an Account'}
                onPress={() => setIsRegistering(!isRegistering)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 15,
        paddingHorizontal: 10,
    },
});
