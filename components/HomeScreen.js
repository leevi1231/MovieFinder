import React, { useState } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet, Alert, Image, TouchableOpacity } from 'react-native';

export default function HomeScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState('');
    const [releaseYear, setReleaseYear] = useState('');
    const [movies, setMovies] = useState([]);
    const [showOptions, setShowOptions] = useState(false);

    const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

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
            console.error(error);
            Alert.alert('Something went wrong. Please try again.');
        }
    };

    const renderMovieItem = ({ item }) => (
        <View style={styles.movieItem}>
            <Image source={{ uri: item.Poster }} style={styles.poster} />
            <View style={styles.textContainer}>
                <Text style={styles.movieTitle}>{item.Title}</Text>
                <Text>{item.Year}</Text>
            </View>
        </View>
    );

    const toggleSearchType = (type) => {
        setSearchType((prev) => (prev === type ? '' : type));
    };

    const toggleOptions = () => {
        setShowOptions((prev) => !prev);
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.searchInput}
                placeholder="Search for a movie or series..."
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
            <TouchableOpacity style={styles.moreOptionsButton} onPress={toggleOptions}>
                <Text style={styles.moreOptionsText}>{showOptions ? 'Hide Options' : 'More Options'}</Text>
            </TouchableOpacity>
            {showOptions && (
                <View style={styles.optionsContainer}>
                    <TextInput
                        style={styles.yearInput}
                        placeholder="Release Year (optional)"
                        value={releaseYear}
                        onChangeText={setReleaseYear}
                        keyboardType="numeric"
                    />
                    <View style={styles.typeToggleContainer}>
                        <TouchableOpacity
                            style={[styles.typeToggleButton, searchType === 'movie' && styles.selectedType]}
                            onPress={() => toggleSearchType('movie')}
                        >
                            <Text style={styles.typeToggleText}>Movie</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.typeToggleButton, searchType === 'series' && styles.selectedType]}
                            onPress={() => toggleSearchType('series')}
                        >
                            <Text style={styles.typeToggleText}>Series</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
            <Button title="Search" onPress={searchMovies} />
            <FlatList
                data={movies}
                renderItem={renderMovieItem}
                keyExtractor={(item) => item.imdbID}
                style={styles.list}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 50,
        flex: 1,
        padding: 10,
        backgroundColor: '#fff',
    },
    searchInput: {
        height: 40,
        borderColor: '#000',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 8,
    },
    moreOptionsButton: {
        padding: 10,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        marginBottom: 10,
        borderRadius: 5,
    },
    moreOptionsText: {
        fontSize: 16,
        color: '#000',
    },
    optionsContainer: {
        marginBottom: 10,
    },
    yearInput: {
        height: 40,
        borderColor: '#000',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 8,
    },
    typeToggleContainer: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    typeToggleButton: {
        flex: 1,
        padding: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#000',
    },
    selectedType: {
        backgroundColor: '#ccc',
    },
    typeToggleText: {
        fontSize: 16,
    },
    list: {
        marginTop: 10,
    },
    movieItem: {
        flexDirection: 'row',
        padding: 10,
        borderBottomColor: '#000',
        borderBottomWidth: 1,
        alignItems: 'center',
    },
    poster: {
        width: 50,
        height: 75,
        marginRight: 10,
    },
    textContainer: {
        flex: 1,
    },
    movieTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
