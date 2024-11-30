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
                    year, 
                    poster, 
                    AVG(rating) AS averageRating, 
                    COUNT(rating) AS ratingCount
                FROM rated_movies
                WHERE rating IS NOT NULL
                GROUP BY imdbID`
            );
    
            const sortedMovies = result.sort((a, b) => {
                if (b.averageRating === a.averageRating) {
                    return b.ratingCount - a.ratingCount;
                }
                return b.averageRating - a.averageRating;
            });
    
            setTopRatedMovies(sortedMovies.slice(0, 5));
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
        <View style={styles.movieItem}>
            <View style={styles.userDetails}>
                <Image
                    source={item.profile_picture ? { uri: item.profile_picture } : require('./../assets/default-avatar.png')}
                    style={styles.profilePictureSmall}
                />
                <View style={styles.userInfo}>
                    <View style={{ flexDirection: 'row' }}>
                        {item.display_name && <Text style={styles.display_name}>{item.display_name} </Text>}
                        <Text style={styles.usernameSmall}>@{item.username}</Text>
                    </View>
                    {item.bio && <Text style={styles.defaultText}>{item.bio}</Text>}
                </View>
            </View>
            <TouchableOpacity onPress={() => handleUserClick(item)} style={styles.showMoreButton}>
                <Ionicons name="eye-outline" size={24} color='rgba(179, 160, 137, 1)' />
            </TouchableOpacity>
        </View>
    );

    const renderMovieItem = ({ item, index }) => {
        const isExpanded = expandedMovies[item.imdbID];
        const rating = item.averageRating;
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5 ? 1 : 0;
        const emptyStars = 5 - fullStars - halfStar;

        return (
            <View>
                <View style={styles.movieItem}>
                    <Image source={{ uri: item.poster }} style={styles.poster} />
                    <View style={styles.movieDetails}>
                        <Text style={styles.ratings}>#{index + 1}</Text>
                        <Text style={styles.movieTitle}>{item.title}</Text>
                        <Text style={styles.defaultText}>{item.year}</Text>

                        <View style={styles.stars}>
                            {Array(fullStars).fill().map((_, index) => (
                                <Ionicons key={`full-${index}`} name="star" size={18} color="#FeD700" />
                            ))}
                            {halfStar === 1 && <Ionicons name="star-half" size={18} color="#FeD700" />}
                            {Array(emptyStars).fill().map((_, index) => (
                                <Ionicons key={`empty-${index}`} name="star-outline" size={18} color="#FeD700" />
                            ))}
                        </View>
                    </View>
                    <View style={styles.ratingContainer}>
                        <Text style={styles.defaultText}>{rating.toFixed(2)} / 5.00</Text>
                        <Text style={styles.ratings}>Ratings: {item.ratingCount}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.showMoreButton}
                        onPress={() => fetchMovieDetails(item.imdbID)}
                    >
                        <AntDesign name={isExpanded ? 'up' : 'down'} size={22} color='rgba(179, 160, 137, 1)' />
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
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {selectedUser ? (
                <Profile currentUser={selectedUser} isOwnProfile={false} onLogout={() => setSelectedUser(null)} />
            ) : (
                <>
                    <View style={styles.usersContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Search Users"
                            placeholderTextColor='rgba(179, 160, 137, 0.5)'
                            value={searchTerm}
                            onChangeText={setSearchTerm}
                            keyboardAppearance="dark"
                        />
                        <Text style={styles.sectionTitle}>New Users:</Text>
                        <FlatList
                            data={filteredUsers}
                            renderItem={renderUserItem}
                            showsVerticalScrollIndicator={false}
                            keyExtractor={(item) => item.id.toString()}
                        />
                    </View>
                    <View style={styles.movieContainer}>
                        <Text style={styles.sectionTitle}>Highest Rated Movies:</Text>
                        <FlatList
                            data={topRatedMovies}
                            renderItem={renderMovieItem}
                            showsVerticalScrollIndicator={false}
                            keyExtractor={(item, index) => index.toString()}
                        />
                    </View>
                </>
            )}
        </View>
    );
}