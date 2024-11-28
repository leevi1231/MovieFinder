import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { useFocusEffect } from '@react-navigation/native';
import Profile from './Profile';
import { Ionicons } from '@expo/vector-icons';

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
                `SELECT title, imdbID, AVG(rating) as averageRating, COUNT(rating) as ratingCount, poster
                 FROM rated_movies 
                 GROUP BY imdbID 
                 HAVING ratingCount > 1 
                 ORDER BY averageRating DESC, ratingCount DESC 
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
        <TouchableOpacity onPress={() => handleUserClick(item)} style={styles.userItem}>
            <View style={styles.userDetails}>
                <Image
                    source={item.profile_picture ? { uri: item.profile_picture } : require('./../assets/default-avatar.png')}
                    style={styles.profilePicture}
                />
                <View style={styles.userInfo}>
                    <Text style={styles.username}>@{item.username}</Text>
                    <Text>{item.display_name}</Text>
                    {item.bio && <Text>{item.bio}</Text>}
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderMovieItem = ({ item }) => {
        const isExpanded = expandedMovies[item.imdbID];
        const rating = item.averageRating;
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5 ? 1 : 0;
        const emptyStars = 5 - fullStars - halfStar;

        return (
            <View style={styles.movieItem}>
                <View style={styles.movieDetails}>
                    <Image source={{ uri: item.poster }} style={styles.moviePoster} />
                    <View style={styles.movieText}>
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
                </View>
                <TouchableOpacity
                    style={styles.showMoreButton}
                    onPress={() => fetchMovieDetails(item.imdbID)}
                >
                    <Ionicons name={isExpanded ? 'arrow-up' : 'arrow-down'} size={24} color="gray" />
                </TouchableOpacity>
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

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        marginVertical: 10,
    },
    userItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    userDetails: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profilePicture: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    userInfo: {
        flexDirection: 'column',
    },
    username: {
        fontWeight: 'bold',
    },
    movieItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    movieDetails: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    moviePoster: {
        width: 60,
        height: 90,
        marginRight: 10,
    },
    movieText: {
        flexDirection: 'column',
    },
    movieTitle: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    stars: {
        flexDirection: 'row',
        marginVertical: 5,
    },
    ratingText: {
        fontSize: 14,
        color: '#555',
        marginVertical: 5,
    },
    likes: {
        fontSize: 14,
        color: '#555',
    },
    showMoreButton: {
        marginTop: 10,
        padding: 5,
    },
    movieDetailsExpanded: {
        paddingTop: 10,
        paddingLeft: 5,
        paddingBottom: 10,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
    },
});
