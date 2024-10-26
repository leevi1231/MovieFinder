import React, { useState } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

export default function HomeScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [movies, setMovies] = useState([]);

    const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

    const searchMovies = async () => {
        if (searchQuery.trim() === '') {
            Alert.alert('Please enter a movie name.');
            return;
        }

        try {
            const response = await axios.get(
                `https://www.omdbapi.com/?s=${searchQuery}&apikey=${API_KEY}`
            );

            if (response.data.Response === 'True') {
                setMovies(response.data.Search);
            } else {
                setMovies([]);
                Alert.alert(response.data.Error);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Something went wrong. Please try again.');
        }
    };

    const renderMovieItem = ({ item }) => (
        <View style={styles.movieItem}>
            <Text style={styles.movieTitle}>{item.Title}</Text>
            <Text>{item.Year}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.searchInput}
                placeholder="Search for a movie..."
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
            <Button title="Search" onPress={searchMovies} />
            <FlatList
                data={movies}
                renderItem={renderMovieItem}
                keyExtractor={(item) => item.imdbID}
                style={styles.list}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    searchInput: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 16,
        paddingHorizontal: 8,
    },
    list: {
        marginTop: 16,
    },
    movieItem: {
        padding: 16,
        borderBottomColor: 'gray',
        borderBottomWidth: 1,
    },
    movieTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});
