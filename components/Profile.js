import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { useFocusEffect } from '@react-navigation/native';

const db = SQLite.openDatabaseSync('users.db');

export default function Profile({ currentUser }) {
    const [likedMovies, setLikedMovies] = useState([]);

    useFocusEffect(
        React.useCallback(() => {
            const fetchLikedMovies = async () => {
                try {
                    const results = await db.getAllAsync(
                        'SELECT title, year, poster FROM liked_movies WHERE user_id = ?;',
                        [currentUser.id]
                    );
                    setLikedMovies(results);
                } catch (error) {
                    console.error('Error fetching liked movies:', error);
                }
            };

            fetchLikedMovies();
        }, [currentUser.id])
    );

    const renderMovieItem = ({ item }) => (
        <View style={styles.movieItem}>
            <Image source={{ uri: item.poster }} style={styles.poster} />
            <Text style={styles.movieTitle}>{item.title}</Text>
            <Text>{item.year}</Text>
        </View>
    );

    const fetchAllData = async () => {
        try {
            const result = await db.getAllAsync('SELECT * FROM liked_movies;');
            console.log('All liked movies:', result);
        } catch (error) {
            console.error('Error fetching all data:', error);
        }
    };
    
    fetchAllData();

    return (
        <View style={styles.container}>
            <Text style={styles.username}>Welcome, {currentUser.username}!</Text>
            <Text style={styles.sectionTitle}>Liked Movies:</Text>
            <FlatList
                data={likedMovies}
                renderItem={renderMovieItem}
                keyExtractor={(item, index) => index.toString()}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    username: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        marginBottom: 10,
    },
    movieItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    poster: {
        width: 50,
        height: 75,
        marginRight: 10,
    },
    movieTitle: {
        fontSize: 16,
    },
});
