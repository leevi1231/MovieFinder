import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { useFocusEffect } from '@react-navigation/native';
import Profile from './Profile';

const db = SQLite.openDatabaseSync('users.db');

export default function Explore() {
    const [users, setUsers] = useState([]);
    const [mostLikedMovies, setMostLikedMovies] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);

    useFocusEffect(
        React.useCallback(() => {
            fetchUsers();
            fetchMostLikedMovies();
        }, [])
    );

    useEffect(() => {
        if (searchTerm) {
            const filtered = users.filter(user => user.username.toLowerCase().includes(searchTerm.toLowerCase()));
            setFilteredUsers(filtered);
        } else {
            setFilteredUsers(users);
        }
    }, [searchTerm, users]);

    const fetchUsers = async () => {
        try {
            const result = await db.getAllAsync('SELECT id, username, display_name FROM users ORDER BY id DESC LIMIT 10;');
            setUsers(result);
            setFilteredUsers(result);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchMostLikedMovies = async () => {
        try {
            const result = await db.getAllAsync(
                `SELECT title, imdbID, COUNT(*) as likes 
                 FROM liked_movies 
                 GROUP BY imdbID 
                 ORDER BY likes DESC 
                 LIMIT 5;`
            );
            setMostLikedMovies(result);
        } catch (error) {
            console.error('Error fetching most liked movies:', error);
        }
    };

    const handleUserClick = (user) => {
        setSelectedUser(user);
    };

    const renderUserItem = ({ item }) => (
        <TouchableOpacity onPress={() => handleUserClick(item)} style={styles.userItem}>
            <Text style={styles.username}>@{item.username}</Text>
            <Text>{item.display_name}</Text>
        </TouchableOpacity>
    );

    const renderMovieItem = ({ item }) => (
        <View style={styles.movieItem}>
            <Text>{item.title}</Text>
            <Text>{item.likes} likes</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {selectedUser ? (
                <Profile currentUser={selectedUser} isOwnProfile={false} onLogout={() => setSelectedUser(null)} />
            ) : (
                <>
                    <TextInput
                        style={styles.input}
                        placeholder="Search Users"
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                    />
                    <Text style={styles.sectionTitle}>New Users:</Text>
                    <FlatList
                        data={filteredUsers}
                        renderItem={renderUserItem}
                        keyExtractor={(item) => item.id.toString()}
                    />
                    <Text style={styles.sectionTitle}>Most Liked Movies:</Text>
                    <FlatList
                        data={mostLikedMovies}
                        renderItem={renderMovieItem}
                        keyExtractor={(item, index) => index.toString()}
                    />
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        marginVertical: 10,
    },
    userItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    username: {
        fontWeight: 'bold',
    },
    movieItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
});
