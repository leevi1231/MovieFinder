import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, FlatList, TouchableOpacity, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { AntDesign, Ionicons } from '@expo/vector-icons';

import styles from '../styles/styles';

const db = SQLite.openDatabaseSync('users.db');

export default function Profile({ currentUser, onLogout, isOwnProfile }) {
    const [ratedMovies, setRatedMovies] = useState([]);
    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            const fetchProfileData = async () => {
                try {
                    const profileResult = await db.getAllAsync(
                        'SELECT display_name, bio, profile_picture FROM users WHERE id = ?;',
                        [currentUser.id]
                    );
                    if (profileResult.length > 0) {
                        const { display_name, bio, profile_picture } = profileResult[0];
                        setDisplayName(display_name || '');
                        setBio(bio || '');
                        setProfilePicture(profile_picture || null);
                    }

                    const ratedMoviesResult = await db.getAllAsync(
                        'SELECT title, year, poster, rating, review, imdbID, id FROM rated_movies WHERE user_id = ?;',
                        [currentUser.id]
                    );
                    setRatedMovies(ratedMoviesResult);
                } catch (error) {
                    console.error('Error fetching profile data:', error);
                }
            };

            fetchProfileData();
        }, [currentUser.id])
    );

    const handleSaveProfile = async () => {
        try {
            await db.runAsync(
                'UPDATE users SET display_name = ?, bio = ?, profile_picture = ? WHERE id = ?;',
                [displayName, bio, profilePicture, currentUser.id]
            );
            Alert.alert('Success', 'Profile updated successfully.');
            setIsEditing(false);
        } catch (error) {
            console.error('Error saving profile data:', error);
            Alert.alert('Error', 'Failed to update profile.');
        }
    };

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaType,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setProfilePicture(result.assets[0].uri);
        }
    };

    const handleRemoveRating = async (movieId) => {
        try {
            await db.runAsync('DELETE FROM rated_movies WHERE id = ? AND user_id = ?;', [movieId, currentUser.id]);
            setRatedMovies((prevMovies) => prevMovies.filter((movie) => movie.id !== movieId));
            Alert.alert('Success', 'Rating removed.');
        } catch (error) {
            console.error('Error removing rating:', error);
            Alert.alert('Error', 'Failed to remove rating.');
        }
    };

    const handleRemoveImage = () => {
        setProfilePicture(null);
    };

    const renderRatingStars = (rating) => {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5 ? 1 : 0;
        const emptyStars = 5 - fullStars - halfStar;

        return (
            <View style={styles.stars}>
                {Array(fullStars).fill().map((_, index) => (
                    <Ionicons key={`full-${index}`} name="star" size={18} color="#FFD700" />
                ))}
                {halfStar === 1 && <Ionicons name="star-half" size={18} color="#FFD700" />}
                {Array(emptyStars).fill().map((_, index) => (
                    <Ionicons key={`empty-${index}`} name="star-outline" size={18} color="#FFD700" />
                ))}
            </View>
        );
    };


    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
                <Text style={styles.logoutText}>{isOwnProfile ? 'Logout' : 'Go Back'}</Text>
            </TouchableOpacity>

            <View style={styles.profileContainer}>
                <TouchableOpacity onPress={handlePickImage} disabled={!isEditing}>
                    <Image
                        source={profilePicture ? { uri: profilePicture } : require('./../assets/default-avatar.png')}
                        style={styles.profilePicture}
                    />
                </TouchableOpacity>
                {!isEditing ? (
                    <Text style={styles.displayName}>{displayName || null}</Text>
                ) : (
                    <TextInput
                        style={styles.input}
                        placeholder="Display Name"
                        value={displayName}
                        onChangeText={setDisplayName}
                    />
                )}
                <Text style={styles.username}>@{currentUser.username}</Text>
                {!isEditing ? (
                    <Text style={styles.bio}>{bio || null}</Text>
                ) : (
                    <TextInput
                        style={[styles.input, styles.bioInput]}
                        placeholder="Bio"
                        value={bio}
                        onChangeText={setBio}
                        multiline
                    />
                )}
            </View>
            {isOwnProfile && (
                <Button title={isEditing ? "Save Profile" : "Edit Profile"} onPress={() => {
                    if (isEditing) {
                        handleSaveProfile();
                    } else {
                        setIsEditing(true);
                    }
                }} />
            )}

            <Text style={styles.sectionTitle}>Rated Movies:</Text>
            <FlatList
                data={ratedMovies}
                renderItem={({ item }) => (
                    <View style={styles.movieItem}>
                        <Image source={{ uri: item.poster }} style={styles.poster} />
                        <View style={styles.movieDetails}>
                            <Text style={styles.movieTitle}>{item.title}</Text>
                            <Text>{item.year}</Text>
                            {renderRatingStars(item.rating)}
                            {item.review && <Text style={styles.reviewText}>Review: {item.review}</Text>}
                        </View>
                        {isOwnProfile && (
                            <TouchableOpacity onPress={() => handleRemoveRating(item.id)} style={styles.removeButton}>
                                <AntDesign name="delete" size={22} color="gray" />
                            </TouchableOpacity>
                        )}
                    </View>
                )}
                keyExtractor={(item) => item.id.toString()}
            />
        </View>
    );
}
