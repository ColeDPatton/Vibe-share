const url = window.location.href.includes('localhost') ?
    'http://localhost:8000' : 'https://vibin-backend.herokuapp.com'

export async function loadPosts() {
    return fetch(url + '/api/posts', {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        method: 'GET',
    }).then(d => d.json());
}

export async function submitPost(profilePic, username, userId, text, songId, songName, songArtist, songArt, startTime, stopTime) {
    var data = new URLSearchParams();
    data.append('profilePic', profilePic);
    data.append('username', username);
    data.append('userId', userId);
    data.append('text', text);
    data.append('songId', songId);
    data.append('songName', songName);
    data.append('songArtist', songArtist);
    data.append('songArt', songArt);
    data.append('startTime', startTime);
    data.append('stopTime', stopTime);
    return fetch(url + '/api/newPost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: data
    }).then(d => d.json());
}

export async function updatePostsPictures(userId, profilePic) {
    var updatedData = new URLSearchParams();
    updatedData.append('userId', userId);
    updatedData.append('profilePic', profilePic);

    return fetch(url + '/api/updatePost', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: updatedData
    }).then(d => d.json());
}

export async function loadLikes() {
    return fetch(url + '/api/likes', {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        method: 'GET',
    }).then(d => d.json());
}

export async function likePost(username, postId) {
    var data = new URLSearchParams();
    data.append('username', username);
    data.append('postId', postId);
    return fetch(url + '/api/likePost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: data
    }).then(d => d.json());
}

export async function deleteLike(username, postId) {
    var data = new URLSearchParams();
    data.append('username', username);
    data.append('postId', postId);
    return fetch(url + '/api/removeLike', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: data
    }).then(d => d.json());
}

export async function loadAllUsers() {
    return fetch(url + '/api/allUsers/', {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        method: 'GET',
    }).then(d => d.json());
}

export async function loadUser(userId) {
    return fetch(url + '/api/user/?userId=' + userId, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        method: 'GET',
    }).then(d => d.json());
}

export async function newUser(userId, username) {
    var data = new URLSearchParams();
    data.append('userId', userId);
    data.append('username', username);
    data.append('followers', []);
    data.append('following', []);
    return fetch(url + '/api/newUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: data
    }).then(d => d.json());
}

export async function followUser(personFollowingName, personFollowingId,
    personBeingFollowedName, personBeingFollowedId) {

    var newFollowingData = new URLSearchParams();
    newFollowingData.append('userId', personFollowingId);
    newFollowingData.append('newFollowingName', personBeingFollowedName);
    newFollowingData.append('newFollowingId', personBeingFollowedId);

    var newFollowerData = new URLSearchParams();
    newFollowerData.append('userId', personBeingFollowedId);
    newFollowerData.append('newFollowerName', personFollowingName);
    newFollowerData.append('newFollowerId', personFollowingId);

    fetch(url + '/api/newFollow', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: newFollowingData
    }).then(d => d.json());
    fetch(url + '/api/newFollower', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: newFollowerData
    }).then(d => d.json());
}

export async function unFollowUser(personUnfollowingName, personUnfollowingId,
    personBeingUnfollowedName, personBeingUnfollowedId) {

    var unfollowingData = new URLSearchParams();
    unfollowingData.append('userId', personUnfollowingId);
    unfollowingData.append('stopFollowingName', personBeingUnfollowedName);
    unfollowingData.append('stopFollowingId', personBeingUnfollowedId);

    var loseFollowerData = new URLSearchParams();
    loseFollowerData.append('userId', personBeingUnfollowedId);
    loseFollowerData.append('loseFollowerName', personUnfollowingName);
    loseFollowerData.append('loseFollowerId', personUnfollowingId);

    fetch(url + '/api/unfollow', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: unfollowingData
    }).then(d => d.json());
    fetch(url + '/api/loseFollower', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: loseFollowerData
    }).then(d => d.json());
}

export async function saveProfilePicY(userId, newProfilePicY) {
    let newProfilePicYData = new URLSearchParams();
    newProfilePicYData.append('userId', userId);
    newProfilePicYData.append('profilePicY', newProfilePicY);

    return fetch(url + '/api/saveProfilePicY', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: newProfilePicYData
    }).then(d => d.json());
}