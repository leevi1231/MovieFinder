import React, { useState } from 'react';
import { View, TextInput, Button, FlatList, Text, Alert, Image, TouchableOpacity, Modal } from 'react-native';
import * as SQLite from 'expo-sqlite';
import AntDesign from '@expo/vector-icons/AntDesign';
import Slider from '@react-native-community/slider';

import styles from '../styles/styles';

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
                            <Text style={styles.moviePlot}>{isExpanded.Plot}</Text>
                            <Text style={styles.movieGenre}>Genre: {isExpanded.Genre}</Text>
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
                    <AntDesign name="plus" size={24} color="gray" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.showMoreButton}
                    onPress={() => fetchMovieDetails(item.imdbID)}
                >
                    <AntDesign
                        name={isExpanded ? 'up' : 'down'}
                        size={22}
                        color="gray"
                    />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
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
