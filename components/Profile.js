import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Image, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';

const db = SQLite.openDatabaseSync('users.db');

export default function Profile({ currentUser, onLogout, isOwnProfile }) {
    const [likedMovies, setLikedMovies] = useState([]);
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

                    const movieResults = await db.getAllAsync(
                        'SELECT title, year, poster, id FROM liked_movies WHERE user_id = ?;',
                        [currentUser.id]
                    );
                    setLikedMovies(movieResults);
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

    const handleRemoveMovie = async (movieId) => {
        try {
            await db.runAsync('DELETE FROM liked_movies WHERE id = ? AND user_id = ?;', [movieId, currentUser.id]);
            setLikedMovies((prevMovies) => prevMovies.filter((movie) => movie.id !== movieId));
            Alert.alert('Success', 'Movie removed from liked list.');
        } catch (error) {
            console.error('Error removing movie:', error);
            Alert.alert('Error', 'Failed to remove movie.');
        }
    };

    const handleRemoveImage = () => {
        setProfilePicture(null);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
                <Text style={styles.logoutText}>{isOwnProfile ? 'Logout' : 'Go Back'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handlePickImage} disabled={!isEditing}>
                <Image
                    source={profilePicture ? { uri: profilePicture } : require('./../assets/default-avatar.png')}
                    style={styles.profilePicture}
                />
            </TouchableOpacity>
            {!isEditing ? (
                <Text style={styles.displayName}>{displayName || 'Display Name'}</Text>
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
                <Text style={styles.bio}>{bio || 'Bio'}</Text>
            ) : (
                <TextInput
                    style={[styles.input, styles.bioInput]}
                    placeholder="Bio"
                    value={bio}
                    onChangeText={setBio}
                    multiline
                />
            )}
            
            {isOwnProfile && (
                <Button title={isEditing ? "Save Profile" : "Edit Profile"} onPress={() => {
                    if (isEditing) {
                        handleSaveProfile();
                    } else {
                        setIsEditing(true);
                    }
                }} />
            )}
            
            <Text style={styles.sectionTitle}>Liked Movies:</Text>
            <FlatList
                data={likedMovies}
                renderItem={({ item }) => (
                    <View style={styles.movieItem}>
                        <Image source={{ uri: item.poster }} style={styles.poster} />
                        <View style={styles.movieDetails}>
                            <Text style={styles.movieTitle}>{item.title}</Text>
                            <Text>{item.year}</Text>
                        </View>
                        {isOwnProfile && (
                            <TouchableOpacity onPress={() => handleRemoveMovie(item.id)} style={styles.removeButton}>
                                <Text style={styles.removeButtonText}>Remove</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
                keyExtractor={(item, index) => index.toString()}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    logoutButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        padding: 10,
        backgroundColor: '#007BFF',
        borderRadius: 5,
    },
    logoutText: {
        color: '#fff',
    },
    profilePicture: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    displayName: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    username: {
        fontSize: 18,
        color: '#888',
    },
    bio: {
        fontSize: 16,
        color: '#666',
        marginVertical: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        width: '100%',
        marginBottom: 10,
        borderRadius: 5,
    },
    sectionTitle: {
        fontSize: 18,
    },
    movieItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        padding: 10,
        width: '100%',
    },
    movieTitle: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    poster: {
        width: 70,
        height: 105,
        marginRight: 10,
    },
    removeButton: {
        backgroundColor: '#FF5733',
        padding: 5,
        borderRadius: 5,
    },
    removeButtonText: {
        color: '#fff',
    },
});
