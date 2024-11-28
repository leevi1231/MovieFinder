import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, FlatList, Text, Alert, Image, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

const db = SQLite.openDatabaseSync('users.db');

export default function Search({ currentUser }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState('');
    const [releaseYear, setReleaseYear] = useState('');
    const [movies, setMovies] = useState([]);
    const [expandedMovies, setExpandedMovies] = useState({});
    const [showOptions, setShowOptions] = useState(false);
    const [ratingModalVisible, setRatingModalVisible] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [selectedRating, setSelectedRating] = useState(5);
    const [review, setReview] = useState('');

    const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

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

    const addMovieToRatings = async () => {
        if (!currentUser || !currentUser.id) {
            Alert.alert('Error', 'User is not logged in.');
            return;
        }
        if (selectedRating === null) {
            Alert.alert('Error', 'Please select a rating.');
            return;
        }

        try {
            const result = await db.runAsync(
                `INSERT OR IGNORE INTO rated_movies (user_id, imdbID, title, year, poster, rating, review) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [currentUser.id, selectedMovie.imdbID, selectedMovie.Title, selectedMovie.Year, selectedMovie.Poster, selectedRating, review]
            );

            if (result.changes > 0) {
                Alert.alert('Success', 'Movie added to your rated movies!');
            } else {
                Alert.alert('Info', 'You have already rated this movie.');
            }
            setRatingModalVisible(false);
            setSelectedMovie(null);
            setSelectedRating(5);
            setReview('');
        } catch (error) {
            Alert.alert('Error', 'Failed to add movie to ratings.');
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
                    style={styles.addButton}
                    onPress={() => {
                        setSelectedMovie(item);
                        setRatingModalVisible(true);
                    }}
                >
                    <Ionicons name="add" size={24} color="gray" />
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

            <Modal
                animationType="none"
                transparent={true}
                visible={ratingModalVisible}
                onRequestClose={() => setRatingModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Rate Movie</Text>
                        <Slider
                            style={styles.ratingSlider}
                            minimumValue={0}
                            maximumValue={5}
                            step={0.5}
                            value={selectedRating}
                            onValueChange={(value) => setSelectedRating(value)}
                            minimumTrackTintColor="#007BFF"
                            maximumTrackTintColor="#d3d3d3"
                            thumbTintColor="#007BFF"
                        />
                        <Text style={styles.selectedRatingText}>{selectedRating} ★</Text>
                        <TextInput
                            style={styles.reviewInput}
                            placeholder="Write a short review (optional)"
                            value={review}
                            onChangeText={setReview}
                            multiline
                        />
                        <Button title="Submit Rating" onPress={addMovieToRatings} />
                        <Button title="Cancel" onPress={() => setRatingModalVisible(false)} />
                    </View>
                </View>
            </Modal>
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
    moviePlot: { fontSize: 12, color: '#777' },
    movieGenre: { fontSize: 12, color: '#777' },
    movieLanguage: { fontSize: 12, color: '#777' },
    addButton: { padding: 10 },
    showMoreButton: { padding: 10 },
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { backgroundColor: 'white', padding: 20, width: 300, borderRadius: 10 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    ratingSlider: { width: 250, height: 40, marginBottom: 10 },
    selectedRatingText: { textAlign: 'center', marginBottom: 10 },
    reviewInput: { borderBottomWidth: 1, marginBottom: 10, padding: 10, height: 80, textAlignVertical: 'top' },
});
