import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import * as SQLite from 'expo-sqlite';

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
                DROP TABLE users;
                DROP TABLE liked_movies;
                CREATE TABLE users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE,
                    password TEXT
                );
                CREATE TABLE liked_movies (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    imdbID TEXT UNIQUE,
                    title TEXT,
                    year TEXT,
                    poster TEXT,
                    FOREIGN KEY (user_id) REFERENCES users (id)
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

    if (!db) {
        return <Text>Loading...</Text>;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{isRegistering ? 'Register' : 'Log In'}</Text>
            <TextInput
                placeholder="Username"
                style={styles.input}
                value={username}
                onChangeText={setUsername}
            />
            <TextInput
                placeholder="Password"
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            {isRegistering ? (
                <Button title="Register" onPress={handleRegister} />
            ) : (
                <Button title="Log In" onPress={handleLogin} />
            )}
            <Button
                title={isRegistering ? 'Switch to Log In' : 'Switch to Register'}
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
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
    },
});
