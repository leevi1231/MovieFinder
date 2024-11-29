import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { useFocusEffect } from '@react-navigation/native';
import Profile from './Profile';
import { AntDesign, Ionicons } from '@expo/vector-icons';

import styles from '../styles/styles';

const db = SQLite.openDatabaseSync('users.db');

export default function Explore() {
    const [users, setUsers] = useState([]);
    const [topRatedMovies, setTopRatedMovies] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [expandedMovies, setExpandedMovies] = useState({});

    const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

    useFocusEffect(
        React.useCallback(() => {
            fetchUsers();
            fetchTopRatedMovies();
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
            const result = await db.getAllAsync('SELECT id, username, display_name, bio, profile_picture FROM users ORDER BY id DESC LIMIT 10;');
            setUsers(result);
            setFilteredUsers(result);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchTopRatedMovies = async () => {
        try {
            const result = await db.getAllAsync(
                `SELECT 
                    imdbID, 
                    title, 
                    poster, 
                    AVG(rating) AS averageRating, 
                    COUNT(rating) AS ratingCount
                FROM rated_movies
                WHERE rating IS NOT NULL
                GROUP BY imdbID
                ORDER BY averageRating DESC
                LIMIT 5;`
            );
            setTopRatedMovies(result);
        } catch (error) {
            console.error('Error fetching top rated movies:', error);
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

    const handleUserClick = (user) => {
        setSelectedUser(user);
    };

    const renderUserItem = ({ item }) => (
        <View style={styles.userItem}>
            <View style={styles.userDetails}>
                <Image
                    source={item.profile_picture ? { uri: item.profile_picture } : require('./../assets/default-avatar.png')}
                    style={styles.profilePicture}
                />
                <View style={styles.userInfo}>
                    <Text style={styles.display_name}>{item.display_name}</Text>
                    <Text style={styles.username}>@{item.username}</Text>
                    {item.bio && <Text>{item.bio}</Text>}
                </View>
            </View>
            <TouchableOpacity onPress={() => handleUserClick(item)} style={styles.eyeIcon}>
                <Ionicons name="eye-outline" size={24} color="gray" />
            </TouchableOpacity>
        </View>
    );

    const renderMovieItem = ({ item }) => {
        const isExpanded = expandedMovies[item.imdbID];
        const rating = item.averageRating;
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5 ? 1 : 0;
        const emptyStars = 5 - fullStars - halfStar;

        return (
            <View>
                <View style={styles.movieItem}>
                        <Image source={{ uri: item.poster }} style={styles.moviePoster} />
                        <View style={styles.movieDetails}>
                            <Text style={styles.movieTitle}>{item.title}</Text>
                            <View style={styles.stars}>
                                {Array(fullStars).fill().map((_, index) => (
                                    <Ionicons key={`full-${index}`} name="star" size={18} color="#FFD700" />
                                ))}
                                {halfStar === 1 && <Ionicons name="star-half" size={18} color="#FFD700" />}
                                {Array(emptyStars).fill().map((_, index) => (
                                    <Ionicons key={`empty-${index}`} name="star-outline" size={18} color="#FFD700" />
                                ))}
                            </View>
                            <Text style={styles.ratingText}>Avg Rating: {rating.toFixed(2)}</Text>
                            <Text style={styles.likes}>Ratings: {item.ratingCount}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.showMoreButton}
                            onPress={() => fetchMovieDetails(item.imdbID)}
                        >
                            <AntDesign name={isExpanded ? 'up' : 'down'} size={22} color="gray" />
                        </TouchableOpacity>
                </View>
                {isExpanded && (
                    <View style={styles.movieDetailsExpanded}>
                        <Text>{isExpanded.Plot}</Text>
                        <Text>Genre: {isExpanded.Genre}</Text>
                    </View>
                )}
            </View>
        );
    };

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
                    <Text style={styles.sectionTitle}>Top Rated Movies:</Text>
                    <FlatList
                        data={topRatedMovies}
                        renderItem={renderMovieItem}
                        keyExtractor={(item, index) => index.toString()}
                    />
                </>
            )}
        </View>
    );
}