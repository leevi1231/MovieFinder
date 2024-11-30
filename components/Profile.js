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

    const handleRemoveImage = () => {
        Alert.alert(
            'Confirm',
            'Are you sure you want to remove your profile picture?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    onPress: () => setProfilePicture(null),
                    style: 'destructive',
                },
            ]
        );
    };

    const handleRemoveRating = async (movieId) => {
        Alert.alert(
            'Confirm',
            'Are you sure you want to delete this review?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    onPress: async () => {
                        try {
                            await db.runAsync('DELETE FROM rated_movies WHERE id = ? AND user_id = ?;', [movieId, currentUser.id]);
                            setRatedMovies((prevMovies) => prevMovies.filter((movie) => movie.id !== movieId));
                            Alert.alert('Success', 'Review deleted.');
                        } catch (error) {
                            console.error('Error removing rating:', error);
                            Alert.alert('Error', 'Failed to delete review.');
                        }
                    },
                    style: 'destructive',
                },
            ]
        );
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
        <View style={isOwnProfile ? styles.container : styles.paddinglessContainer}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity onPress={onLogout} style={styles.button}>
                    <Text style={styles.buttonText}>{isOwnProfile ? 'Logout' : 'Go Back'}</Text>
                </TouchableOpacity>

                {isOwnProfile && (
                    <TouchableOpacity style={styles.button} onPress={() => {
                        if (isEditing) {
                            handleSaveProfile();
                        } else {
                            setIsEditing(true);
                        }
                    }}>
                        <Text style={styles.buttonText}>{isEditing ? "Save Profile" : "Edit Profile"}</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.profileContainer}>
                <TouchableOpacity onPress={handlePickImage} disabled={!isEditing}>
                    <Image
                        source={profilePicture ? { uri: profilePicture } : require('./../assets/default-avatar.png')}
                        style={styles.profilePicture}
                    />
                </TouchableOpacity>
                {
                    !isEditing ? (
                        displayName && <Text style={styles.displayName}>{displayName}</Text>
                    ) : (
                        <>
                            {profilePicture && (
                                <TouchableOpacity onPress={handleRemoveImage} style={[styles.button, {alignSelf: 'center'}]}>
                                    <Text style={styles.buttonText}>Remove Avatar</Text>
                                </TouchableOpacity>
                            )}
                            <TextInput
                                style={styles.profileInput}
                                placeholder="Display Name"
                                value={displayName}
                                onChangeText={setDisplayName}
                            />
                        </>
                    )
                }
                <Text style={styles.username}>@{currentUser.username}</Text>
                {
                    !isEditing ? (
                        bio && <Text style={styles.bio}>{bio}</Text>
                    ) : (
                        <TextInput
                            style={styles.profileInput}
                            placeholder="Bio"
                            value={bio}
                            onChangeText={setBio}
                        />
                    )
                }
            </View>

            <View style={styles.movieContainer}>
                <Text style={styles.sectionTitle}>
                    {isOwnProfile ? 'Your ratings:' : `${currentUser.username}'s ratings:`}
                </Text>

                <FlatList
                    data={ratedMovies}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <>
                            <View style={styles.movieItem}>
                                <Image source={{ uri: item.poster }} style={styles.poster} />
                                <View style={styles.movieDetails}>
                                    <Text style={styles.movieTitle}>{item.title}</Text>
                                    <Text style={styles.defaultText}>{item.year}</Text>
                                    {renderRatingStars(item.rating)}
                                    <Text style={styles.ratings}>{item.rating.toFixed(2)}</Text>
                                </View>
                                {isOwnProfile && (
                                    <TouchableOpacity onPress={() => handleRemoveRating(item.id)} style={styles.showMoreButton}>
                                        <AntDesign name="delete" size={22} color='rgba(179, 160, 137, 1)' />
                                    </TouchableOpacity>
                                )}
                            </View>
                            {item.review && <Text style={styles.movieDetailsExpanded}>
                                <Text style={{ fontWeight: 'bold', color: '#d27d5c' }}>Review: </Text>
                                {item.review}</Text>}
                        </>
                    )}
                    keyExtractor={(item) => item.id.toString()}
                />
            </View>
        </View>
    );
}
