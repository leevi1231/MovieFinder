import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: '#f8f8f8',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },
    container: {
        marginTop: 50,
        flex: 1,
        padding: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
    },
    yearInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
    },
    reviewInput: {
        borderBottomWidth: 1,
        marginBottom: 10,
        padding: 10,
    },
    moreOptionsButton: {
        marginTop: 10,
    },
    optionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    typeToggleButton: {
        padding: 10,
        backgroundColor: '#f1f1f1',
        marginLeft: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedType: {
        backgroundColor: '#007BFF',
    },
    movieItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
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
    additionalDetails: {
        fontSize: 12,
        color: '#777',
    },
    movieRating: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#555',
    },
    moviePlot: {
        fontSize: 12,
        color: '#777',
    },
    movieGenre: {
        fontSize: 12,
        color: '#777',
    },
    movieLanguage: {
        fontSize: 12,
        color: '#777',
    },
    addButton: {
        padding: 10,
    },
    showMoreButton: {
        padding: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        width: 300,
        borderRadius: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    ratingSlider: {
        width: 250,
        height: 40,
        marginBottom: 10,
    },
    selectedRatingText: {
        textAlign: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
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
    sectionTitle: {
        fontSize: 18,
    },
    removeButton: {
        padding: 5,
        borderRadius: 5,
    },
    reviewText: {
        fontStyle: 'italic',
        color: '#666',
    },
    stars: {
        flexDirection: 'row',
        fontSize: 18,
    },
    userItem: {
        flexDirection: 'row',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    userDetails: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profilePictureSmall: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    userInfo: {
        flexDirection: 'column',
    },
    display_name: {
        fontWeight: 'bold',
    },
    usernameSmall: {
        fontWeight: 'regular',
        opacity: 0.6,
    },
    eyeIcon: {
        padding: 5,
    },
    movieDetails: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    movieDetailsProfile: {
        flexDirection: 'column',
    },
    moviePoster: {
        width: 60,
        height: 90,
        marginRight: 10,
    },
    movieText: {
        flexDirection: 'column',
    },
    movieTitleSmall: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    starsSmall: {
        flexDirection: 'row',
        marginVertical: 5,
    },
    ratingTextSmall: {
        fontSize: 14,
        color: '#555',
    },
    likes: {
        fontSize: 14,
        color: '#555',
    },
    showMoreButtonSmall: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 5,
    },
    movieDetailsExpanded: {
        paddingBottom: 10,
    },
});

export default styles;
