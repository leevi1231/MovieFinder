import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Image, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';

const db = SQLite.openDatabaseSync('users.db');

export default function Profile({ currentUser }) {
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
                        'SELECT title, year, poster FROM liked_movies WHERE user_id = ?;',
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
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setProfilePicture(result.assets[0].uri);
        }
    };

    const handleRemoveImage = () => {
        setProfilePicture(null);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={handlePickImage}>
                <Image
                    source={profilePicture ? { uri: profilePicture } : require('./../assets/default-avatar.png')}
                    style={styles.profilePicture}
                />
            </TouchableOpacity>
            <Text style={styles.displayName}>{displayName || 'Display Name'}</Text>
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
            {isEditing && (
                <TextInput
                    style={styles.input}
                    placeholder="Display Name"
                    value={displayName}
                    onChangeText={setDisplayName}
                />
            )}
            <Button
                title={isEditing ? 'Save Profile' : 'Edit Profile'}
                onPress={isEditing ? handleSaveProfile : () => setIsEditing(true)}
            />
            <Text style={styles.sectionTitle}>Liked Movies:</Text>
            <FlatList
                data={likedMovies}
                renderItem={({ item }) => (
                    <View style={styles.movieItem}>
                        <Image source={{ uri: item.poster }} style={styles.poster} />
                        <Text style={styles.movieTitle}>{item.title}</Text>
                        <Text>{item.year}</Text>
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
    },
    profilePicture: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignSelf: 'center',
        marginBottom: 10,
    },
    displayName: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 5,
    },
    username: {
        fontSize: 16,
        color: 'gray',
        textAlign: 'center',
        marginBottom: 10,
    },
    bio: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
        color: '#555',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
    },
    bioInput: {
        height: 80,
    },
    sectionTitle: {
        fontSize: 18,
        marginVertical: 10,
    },
    movieItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    poster: {
        width: 50,
        height: 75,
        marginRight: 10,
    },
    movieTitle: {
        fontSize: 16,
    },
});
