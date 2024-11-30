import React, { useState } from 'react';
import { View, TextInput, Button, FlatList, Text, Alert, Image, TouchableOpacity, Modal } from 'react-native';
import * as SQLite from 'expo-sqlite';
import AntDesign from '@expo/vector-icons/AntDesign';
import Slider from '@react-native-community/slider';

import styles from '../styles/styles';
import { Ionicons } from '@expo/vector-icons';

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
            <>
                <View style={styles.movieItem}>
                    <Image source={{ uri: item.Poster }} style={styles.poster} />
                    <View style={styles.movieDetails}>
                        <Text style={styles.movieTitle}>{item.Title}</Text>
                        <Text style={styles.defaultText}>{item.Year}</Text>

                    </View>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => {
                            setSelectedMovie(item);
                            setRatingModalVisible(true);
                        }}
                    >
                        <AntDesign name="plus" size={24} color='rgba(179, 160, 137, 1)' />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.showMoreButton}
                        onPress={() => fetchMovieDetails(item.imdbID)}
                    >
                        <AntDesign
                            name={isExpanded ? 'up' : 'down'}
                            size={22}
                            color='rgba(179, 160, 137, 1)'
                        />
                    </TouchableOpacity>
                </View>
                {isExpanded && (
                    <View style={styles.movieDetailsExpanded}>
                        <Text style={styles.defaultText}>{isExpanded.Plot}</Text>
                        <Text style={styles.ratings}>
                            <Text style={{ fontWeight: 'bold', color: '#d27d5c' }}>Genre: </Text>
                            {isExpanded.Genre}
                        </Text>
                    </View>
                )}
            </>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Type in a movie or series"
                    placeholderTextColor='rgba(179, 160, 137, 0.5)'
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    keyboardAppearance="dark"
                />
                <TouchableOpacity
                    style={styles.searchButton}
                    onPress={searchMovies}
                >
                    <AntDesign style={{ marginRight: 3 }} name="search1" size={22} color='rgba(179, 160, 137, 1)' />
                    <Text style={styles.buttonText}>Search</Text>
                </TouchableOpacity>
            </View>

            {showOptions && (
                <View style={styles.optionsContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Release Year (optional)"
                        placeholderTextColor='rgba(179, 160, 137, 0.5)'
                        value={releaseYear}
                        onChangeText={setReleaseYear}
                        keyboardType="numeric"
                        keyboardAppearance="dark"
                    />
                    <TouchableOpacity
                        style={[
                            styles.typeToggleButton,
                            searchType === 'movie' && styles.selectedType,
                        ]}
                        onPress={() => setSearchType(searchType === 'movie' ? '' : 'movie')}
                    >
                        <Text style={[styles.togglebuttonText, searchType === 'movie' && styles.selectedText]}>Movie</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.typeToggleButton,
                            searchType === 'series' && styles.selectedType,
                        ]}
                        onPress={() => setSearchType(searchType === 'series' ? '' : 'series')}
                    >
                        <Text style={[styles.togglebuttonText, searchType === 'series' && styles.selectedText]}>Series</Text>
                    </TouchableOpacity>

                </View>
            )}

            <TouchableOpacity
                style={styles.moreOptionsButton}
                onPress={() => setShowOptions((prev) => !prev)}
            >
                <View style={{ flexDirection: 'row' }}>
                    <AntDesign
                        name={showOptions ? 'up' : 'down'}
                        size={18}
                        color='rgba(179, 160, 137, 1)'
                    />
                    <Text style={[{ fontSize: 14 }, styles.defaultText]}>{showOptions ? ' Hide Options' : ' More Options'}</Text>
                </View>
            </TouchableOpacity>

            <FlatList
                data={movies}
                showsVerticalScrollIndicator={false}
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
                        <Text style={styles.modalTitle}>
                            Rate <Text style={{ fontWeight: 'bold' }}>'{selectedMovie ? selectedMovie.Title : 'Rate Movie'} ({selectedMovie ? selectedMovie.Year : ''})'</Text>:
                        </Text>
                        <Slider
                            style={styles.ratingSlider}
                            minimumValue={0}
                            maximumValue={5}
                            step={0.5}
                            value={selectedRating}
                            onValueChange={(value) => setSelectedRating(value)}
                            minimumTrackTintColor='rgba(179, 160, 137, 0.9)'
                            maximumTrackTintColor='rgba(179, 160, 137, 0.2)'
                            thumbTintColor='rgba(179, 160, 137, 1)'
                        />
                        <Text style={styles.selectedRatingText}>{selectedRating} ★</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Write a short review (optional)"
                            placeholderTextColor='rgba(179, 160, 137, 0.5)'
                            value={review}
                            onChangeText={setReview}
                            keyboardAppearance="dark"
                            multiline
                        />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, marginBottom: 15 }}>
                            <TouchableOpacity style={styles.button} onPress={() => setRatingModalVisible(false)}>
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.button} onPress={addMovieToRatings}>
                                <Text style={styles.buttonText}>Submit Rating</Text>
                            </TouchableOpacity>

                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
