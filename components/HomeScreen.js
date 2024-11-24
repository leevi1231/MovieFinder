import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, FlatList, Text, Alert, Image, TouchableOpacity, StyleSheet } from 'react-native';
import * as SQLite from 'expo-sqlite';

export default function HomeScreen({ currentUser }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState('');
    const [releaseYear, setReleaseYear] = useState('');
    const [movies, setMovies] = useState([]);
    const [showOptions, setShowOptions] = useState(false);
    const [db, setDb] = useState(null);

    const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

    useEffect(() => {
        const initializeDatabase = async () => {
            const database = await SQLite.openDatabaseAsync('users.db');
            setDb(database);
            await database.execAsync(`
                CREATE TABLE IF NOT EXISTS liked_movies (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    imdbID TEXT UNIQUE,
                    title TEXT,
                    year TEXT,
                    poster TEXT,
                    user_id INTEGER
                );
            `);
        };
        initializeDatabase();
    }, []);

    const searchMovies = async () => {
        if (searchQuery.trim() === '') {
            Alert.alert('Please enter a movie or series name.');
            return;
        }

        try {
            const response = await fetch(`https://www.omdbapi.com/?s=${searchQuery}&type=${searchType}&y=${releaseYear}&apikey=${API_KEY}`);
            const data = await response.json();

            if (data.Response === 'True') {
                setMovies(data.Search);
            } else {
                setMovies([]);
                Alert.alert(data.Error);
            }
        } catch (error) {
            Alert.alert('Something went wrong. Please try again.');
        }
    };

    const handleLikeMovie = async (movie) => {
        if (!currentUser || !currentUser.id) {
            Alert.alert('Error', 'User is not logged in.');
            return;
        }

        try {
            const result = await db.runAsync(
                `INSERT OR IGNORE INTO liked_movies (imdbID, title, year, poster, user_id) VALUES (?, ?, ?, ?, ?)`,
                [movie.imdbID, movie.Title, movie.Year, movie.Poster, currentUser.id]
            );

            if (result.changes > 0) {
                Alert.alert('Success', 'Movie added to your liked list!');
            } else {
                Alert.alert('Info', 'You have already liked this movie.');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to like movie.');
        }
    };

    const renderMovieItem = ({ item }) => (
        <View style={styles.movieItem}>
            <Image source={{ uri: item.Poster }} style={styles.poster} />
            <View style={styles.textContainer}>
                <Text style={styles.movieTitle}>{item.Title}</Text>
                <Text>{item.Year}</Text>
            </View>
            <TouchableOpacity style={styles.likeButton} onPress={() => handleLikeMovie(item)}>
                <Text style={styles.likeButtonText}>Like</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.searchInput}
                placeholder="Search for a movie or series..."
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
            <TouchableOpacity style={styles.moreOptionsButton} onPress={() => setShowOptions(prev => !prev)}>
                <Text>{showOptions ? 'Hide Options' : 'More Options'}</Text>
            </TouchableOpacity>
            {showOptions && (
                <View style={styles.optionsContainer}>
                    <TextInput
                        style={styles.yearInput}
                        placeholder="Release Year"
                        value={releaseYear}
                        onChangeText={setReleaseYear}
                        keyboardType="numeric"
                    />
                    <View style={styles.typeToggleContainer}>
                        <TouchableOpacity
                            style={[styles.typeToggleButton, searchType === 'movie' && styles.selectedType]}
                            onPress={() => setSearchType('movie')}
                        >
                            <Text>Movie</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.typeToggleButton, searchType === 'series' && styles.selectedType]}
                            onPress={() => setSearchType('series')}
                        >
                            <Text>Series</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
            <Button title="Search" onPress={searchMovies} />
            <FlatList
                data={movies}
                renderItem={renderMovieItem}
                keyExtractor={item => item.imdbID}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginTop: 50, flex: 1, padding: 10 },
    searchInput: { borderBottomWidth: 1, marginBottom: 10, padding: 10 },
    moreOptionsButton: { marginTop: 10 },
    optionsContainer: { marginTop: 10 },
    yearInput: { borderBottomWidth: 1, marginBottom: 10, padding: 10 },
    typeToggleContainer: { flexDirection: 'row', marginBottom: 10 },
    typeToggleButton: { flex: 1, padding: 10, backgroundColor: '#f1f1f1', alignItems: 'center' },
    selectedType: { backgroundColor: '#007BFF' },
    movieItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    poster: { width: 50, height: 75, marginRight: 10 },
    textContainer: { flex: 1 },
    movieTitle: { fontSize: 16 },
    likeButton: { padding: 10, backgroundColor: '#007BFF', borderRadius: 5 },
    likeButtonText: { color: '#fff' }
});
