import $ from 'jquery';

export async function getLoggedInUser(token) {
  return fetch('https://api.spotify.com/v1/me', {
    headers: {'Authorization': 'Bearer ' + token}
  }).then(response => response.json());
}

export async function getUser(token, userId) {
  return fetch('https://api.spotify.com/v1/users/' + userId, {
    headers: {'Authorization': 'Bearer ' + token}
  }).then(response => response.json());
}

export async function playAt(device_id, token, songId, startTime) {
  $.ajax({
    url: "https://api.spotify.com/v1/me/player/play?device_id=" + device_id,
    type: "PUT",
    data: '{"uris": ["' + 'spotify:track:' + songId + '"], "position_ms": ' + startTime + '}',
    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + token); },
    success: function (data) {
      console.log(data);
    }
  });
}

export async function getDevices(token) {
  return fetch('https://api.spotify.com/v1/me/player/devices', {
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
    method: 'GET',
  }).then(d => d.json());
}

export async function pause(token) {
  return fetch('https://api.spotify.com/v1/me/player/pause', {
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
    method: 'PUT',
  });
}

export async function getTrack(token, trackId) {
  const url = 'https://api.spotify.com/v1/tracks/' + trackId;
  return fetch(url, {
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
    method: 'GET',
  }).then(d => d.json());
}

export async function search(token, searchString) {
  let query = "q=" + searchString + "&type=track&limit=15";
  return fetch('https://api.spotify.com/v1/search?' + query, {
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
    method: 'GET',
  }).then(d => d.json());
}

export async function getCurrentPlaybackInfo(token) {
  const url = 'https://api.spotify.com/v1/me/player';
  return fetch(url, {
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
    method: 'GET',
  });
}