import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: '#101010',
    },
    defaultText: {
        color: '#E0C097',
    },
    container: {
        flex: 1,
        paddingTop: 45,
        paddingLeft: 10,
        paddingRight: 10,
        backgroundColor: '#101010',
    },
    paddinglessContainer: {
        flex: 1,
        backgroundColor: '#101010',
    },
    inputContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: 'rgba(179, 160, 137, 0.35)',
        borderRadius: 5,
        padding: 10,
        flex: 1,
        minHeight: 40,
        maxHeight: 40,
        color: '#E0C097',
        backgroundColor: 'rgba(179, 160, 137, 0.02)',
    },    
    loginInput: {
        borderWidth: 1,
        borderColor: 'rgba(179, 160, 137, 0.35)',
        color: '#E0C097',
        borderRadius: 5,
        padding: 10,
        marginBottom: 5,
        width: '80%',
    },
    profileInput: {
        borderWidth: 1,
        borderColor: 'rgba(179, 160, 137, 0.35)',
        backgroundColor: 'rgba(179, 160, 137, 0.02)',
        color: '#E0C097',
        borderRadius: 5,
        padding: 10,
        minHeight: 35,
        maxHeight: 35,
        minWidth: '30%',
        textAlign: 'center',
        margin: 5,
    },
    searchButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 5,
    },
    searchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    reviewInput: {
        borderWidth: 1,
        borderColor: '#555',
        borderRadius: 5,
        marginBottom: 10,
        padding: 10,
        color: '#E0C097'
    },
    moreOptionsButton: {
        marginBottom: 5,
    },
    optionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginBottom: 5,
    },
    typeToggleButton: {
        width: '23%',
        padding: 10,
        backgroundColor: 'rgba(179, 160, 137, 0.1)',
        marginLeft: 5,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedType: {
        backgroundColor: 'rgba(179, 160, 137, 0.5)',
    },
    togglebuttonText: {
        color: 'rgba(179, 160, 137, 0.5)',
    },
    selectedText: {
        color: 'rgba(255, 255, 255, 0.7)',
    },    
    movieItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    poster: {
        width: 55,
        height: 85,
        marginRight: 8,
    },
    movieTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#d27d5c',
    },
    additionalDetails: {
        fontSize: 12,
        color: '#999',
    },
    movieRating: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#ad927c',
    },
    addButton: {
        paddingLeft: 20,
        paddingRight: 5,
    },
    showMoreButton: {
        marginLeft: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        paddingTop: '50%'
    },
    modalContent: {
        backgroundColor: '#1c1c1c',
        padding: 10,
        width: '85%',
        borderRadius: 10,
    },
    modalTitle: {
        fontSize: 16,
        marginBottom: 10,
        color: '#d27d5c',
    },
    ratingSlider: {
        width: '100%',
        alignSelf: 'center',
        height: 40,
    },
    selectedRatingText: {
        textAlign: 'center',
        marginBottom: 15,
        fontSize: 16,
        color: '#FeD700',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        marginBottom: '20%',
        color: '#d27d5c',
    },
    button: {
        borderRadius: 5,
        marginBottom: 5,
        alignItems: 'center',
        alignSelf: 'flex-start',
    },
    buttonText: {
        color: 'rgba(179, 160, 137, 1)',
        fontSize: 16,
        textDecorationLine: 'underline',
        textDecorationColor: 'rgba(179, 160, 137, 0.6)',
        fontWeight: '600'
    },    
    profilePicture: {
        width: 100,
        height: 100,
        borderRadius: 50,
        margin: 5,
    },
    profileContainer: {
        alignItems: 'center',
    },
    displayName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#d27d5c',
    },
    username: {
        fontSize: 18,
        marginBottom: 3,
        color: 'rgba(179, 160, 137, 0.7)'
    },
    bio: {
        fontSize: 18,
        color: 'rgba(179, 160, 137, 1)'
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 500,
        marginTop: 8,
        marginBottom: 10,
        color: 'rgba(179, 160, 137, 1)',
    },
    removeButton: {
        padding: 5,
        borderRadius: 5,
    },
    reviewText: {
        fontStyle: 'italic',
        color: '#999',
    },
    stars: {
        flexDirection: 'row',
        fontSize: 18,
    },
    userDetails: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profilePictureSmall: {
        width: 55,
        height: 55,
        borderRadius: 27.5,
        marginRight: 10,
    },
    userInfo: {
        flexDirection: 'column',
    },
    display_name: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#d27d5c',
    },
    usernameSmall: {
        fontWeight: 'regular',
        fontSize: 16,
        color: 'rgba(179, 160, 137, 0.7)'
    },
    movieDetails: {
        flex: 1,
    },
    movieText: {
        flexDirection: 'column',
    },
    movieTitleSmall: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#d27d5c',
    },
    starsSmall: {
        flexDirection: 'row',
        marginVertical: 5,
    },
    ratings: {
        fontSize: 14,
        color: '#ad927c',
        marginTop: 3,
    },
    movieDetailsExpanded: {
        paddingBottom: 10,
        color: '#E0C097',
    },
    movieContainer: {
        flex: 1,
    },
    usersContainer: {
        height: '39.68%'
    },
    ratingContainer: {
        marginLeft: 5,
    }
});

export default styles;
