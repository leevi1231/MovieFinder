import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, FlatList, Text, Alert, Image, TouchableOpacity, StyleSheet } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { Ionicons } from '@expo/vector-icons';

const db = SQLite.openDatabaseSync('users.db');

export default function Search({ currentUser }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState('');
    const [releaseYear, setReleaseYear] = useState('');
    const [movies, setMovies] = useState([]);
    const [expandedMovies, setExpandedMovies] = useState({});
    const [likedMovies, setLikedMovies] = useState({});
    const [showOptions, setShowOptions] = useState(false);
    const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

    useEffect(() => {
        if (currentUser && currentUser.id) {
            fetchLikedMovies();
        }
    }, [currentUser]);

    const fetchLikedMovies = async () => {
        try {
            const result = await db.runAsync(
                `SELECT imdbID FROM liked_movies WHERE user_id = ?`,
                [currentUser.id]
            );
            const likedMoviesMap = {};
            result.rows.forEach((row) => {
                likedMoviesMap[row.imdbID] = true;
            });
            setLikedMovies(likedMoviesMap);
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch liked movies.');
        }
    };

    const searchMovies = async () => {
        if (searchQuery.trim() === '') {
            Alert.alert('Please enter a movie or series name.');
            return;
        }
        try {
            const response = await fetch(
                `https://www.omdbapi.com/?s=${searchQuery}&type=${searchType}&y=${releaseYear}&apikey=${API_KEY}`
            );
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

    const toggleLikeMovie = async (movie) => {
        if (!currentUser || !currentUser.id) {
            Alert.alert('Error', 'User is not logged in.');
            return;
        }
        try {
            if (likedMovies[movie.imdbID]) {
                await db.runAsync(
                    `DELETE FROM liked_movies WHERE user_id = ? AND imdbID = ?`,
                    [currentUser.id, movie.imdbID]
                );
                setLikedMovies((prev) => {
                    const updated = { ...prev };
                    delete updated[movie.imdbID];
                    return updated;
                });
            } else {
                await db.runAsync(
                    `INSERT OR IGNORE INTO liked_movies (user_id, imdbID, title, year, poster) VALUES (?, ?, ?, ?, ?)`,
                    [currentUser.id, movie.imdbID, movie.Title, movie.Year, movie.Poster]
                );
                setLikedMovies((prev) => ({ ...prev, [movie.imdbID]: true }));
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to update liked movies.');
        }
    };

    const fetchMovieDetails = async (imdbID) => {
        try {
            const response = await fetch(`https://www.omdbapi.com/?i=${imdbID}&apikey=${API_KEY}`);
            const data = await response.json();
            if (data.Response === 'True') {
                setExpandedMovies((prev) => ({
                    ...prev,
                    [imdbID]: prev[imdbID] ? undefined : { Plot: data.Plot, Rating: data.imdbRating, Genre: data.Genre, Language: data.Language },
                }));
            }
        } catch (error) {
            Alert.alert('Something went wrong. Please try again.');
        }
    };

    const renderMovieItem = ({ item }) => {
        const isExpanded = expandedMovies[item.imdbID];
        const isLiked = likedMovies[item.imdbID];

        return (
            <View style={styles.movieItem}>
                <Image source={{ uri: item.Poster }} style={styles.poster} />
                <View style={styles.textContainer}>
                    <Text style={styles.movieTitle}>{item.Title}</Text>
                    <Text>{item.Year}</Text>
                    {isExpanded && (
                        <View style={styles.additionalDetails}>
                            <Text style={styles.movieRating}>Rating: {isExpanded.Rating}</Text>
                            <Text style={styles.moviePlot}>{isExpanded.Plot}</Text>
                            <Text style={styles.movieGenre}>Genre: {isExpanded.Genre}</Text>
                            <Text style={styles.movieLanguage}>Language: {isExpanded.Language}</Text>
                        </View>
                    )}
                </View>
                <TouchableOpacity
                    style={styles.likeButton}
                    onPress={() => toggleLikeMovie(item)}
                >
                    <Ionicons
                        name={isLiked ? 'heart' : 'heart-outline'}
                        size={24}
                        color='gray'
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.showMoreButton}
                    onPress={() => fetchMovieDetails(item.imdbID)}
                >
                    <Ionicons
                        name={isExpanded ? 'arrow-up' : 'arrow-down'}
                        size={24}
                        color="gray"
                    />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.searchInput}
                placeholder="Search for a movie or series..."
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
            <TouchableOpacity
                style={styles.moreOptionsButton}
                onPress={() => setShowOptions((prev) => !prev)}
            >
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
                            style={[
                                styles.typeToggleButton,
                                searchType === 'movie' && styles.selectedType,
                            ]}
                            onPress={() => setSearchType('movie')}
                        >
                            <Text>Movie</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.typeToggleButton,
                                searchType === 'series' && styles.selectedType,
                            ]}
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
                keyExtractor={(item) => item.imdbID}
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
    movieTitle: { fontSize: 16, fontWeight: 'bold' },
    additionalDetails: { marginTop: 5 },
    movieRating: { fontSize: 14, fontWeight: 'bold', color: '#555' },
    moviePlot: { fontSize: 12, color: '#555', marginTop: 2 },
    movieGenre: { fontSize: 12, color: '#555', marginTop: 2 },
    movieLanguage: { fontSize: 12, color: '#555', marginTop: 2 },
    likeButton: { padding: 10, backgroundColor: '#fff', borderRadius: 5 },
    showMoreButton: { padding: 10, backgroundColor: '#f1f1f1', borderRadius: 5, marginLeft: 5 },
});
