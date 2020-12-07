import React, { Component } from 'react';
import profilePicturePlaceholder from '../img/profilePicturePlaceholder.jpg';
import '../style/App.css';
import queryString from 'query-string';
import Post from '../components/Post';
import NewPost from '../components/NewPost';
import Header from '../components/Header';
import { Filter } from '../components/NewPost'
import { FollowerLink } from '../pages/UserProfile'
import { loadPosts, submitPost, loadLikes, loadUser, newUser, loadAllUsers, updatePostsPictures, updateUserProfilePicture } from '../backendCalls';
import { getLoggedInSpotifyUser, getSpotifyUser } from '../spotifyCalls';

class HomePage extends Component {
  constructor() {
    super();
    this.state = {
      serverData: {},
      deviceId: '',
      accessToken: '',
      newPost: false,
      muted: true,
      searching: false,
      searchResults: []
    };
    this.clickNewPost = this.clickNewPost.bind(this);
    this.clickOuterNewPost = this.clickOuterNewPost.bind(this);
    this.submitNewPost = this.submitNewPost.bind(this);
    this.handleMuteButton = this.handleMuteButton.bind(this);
    this.updateSearchResults = this.updateSearchResults.bind(this);
  }

  handlePlayerStatus = async (device_id) => {
    this.setState({
      deviceId: device_id,
    });
  };

  initializePlayer = () => {
    const name = this.state.serverData.user.name + ' vibes';

    this.player = new window.Spotify.Player({
      getOAuthToken: cb => {
        cb(this.state.accessToken);
      },
      name
    });

    this.player.addListener('initialization_error', ({ message }) => { console.error(message); });
    this.player.addListener('authentication_error', ({ message }) => { console.error(message); });
    this.player.addListener('account_error', ({ message }) => { console.error(message); });
    this.player.addListener('playback_error', ({ message }) => { console.error(message); });

    // Playback status updates
    this.player.addListener('player_state_changed', state => { console.log(state); });

    // Ready
    this.player.addListener('ready', ({ device_id }) => {
      this.handlePlayerStatus(device_id);
      console.log('Ready with Device ID', device_id);
    });

    // Not Ready
    this.player.addListener('not_ready', ({ device_id }) => {
      console.log('Device ID has gone offline', device_id);
    });

    this.player.connect();
  };

  componentDidMount() {
    let parsed = queryString.parse(window.location.search);
    if (parsed.access_token) {
      let accessToken = parsed.access_token;

      getLoggedInSpotifyUser(accessToken).then(user => {
        let imgUrl = user.images && user.images.length > 0 ?
          user.images[0].url : '';

        loadUser(user.id).then(loggedInUser => {
          if (!Object.keys(loggedInUser).length) {
            newUser(user.id, user.display_name);
          }
          if(imgUrl !== loggedInUser.profilePic) {
            updateUserProfilePicture(user.id, imgUrl);
          }
        });
        loadPosts().then(posts => {
          let postsWithLikeCount = [];
          loadLikes().then(likes => {
            posts.forEach(post => {
              getSpotifyUser(accessToken, post.userId).then(spotifyUser => {
                let imgUrl = spotifyUser.images && spotifyUser.images.length > 0 ?
                  spotifyUser.images[0].url : '';
                if (post.profilePic !== imgUrl) {
                  updatePostsPictures(spotifyUser.id, imgUrl);
                  post = {
                    ...post,
                    profilePic: imgUrl,
                  }
                }
              });
              let likeCount = 0;
              likes.forEach(like => {
                if (post._id === like.postId) {
                  likeCount++;
                }
              });
              post = {
                ...post,
                likeCount: likeCount
              }
              postsWithLikeCount.push(post);
            });
            this.setState({
              accessToken: accessToken,
              serverData: {
                posts: postsWithLikeCount,
                user: {
                  name: user.display_name,
                  product: user.product,
                  id: user.id,
                  imgUrl: imgUrl
                }
              }
            });
          }).then(window.onSpotifyWebPlaybackSDKReady = this.initializePlayer);
        });
      });
    } else {
      loadPosts().then(posts => {
        let postsWithLikeCount = [];
        loadLikes().then(likes => {
          posts.forEach(post => {
            let likeCount = 0;
            likes.forEach(like => {
              if (post._id === like.postId) {
                likeCount++;
              }
            })
            post = {
              ...post,
              likeCount: likeCount
            }
            postsWithLikeCount.push(post);
          });
          this.setState({
            serverData: {
              posts: postsWithLikeCount,
            }
          });
        });
      });
    }
  }

  async submitNewPost(text, songId, songName, songArtist, songArt, startTime, stopTime) {
    const profilePic = this.state.serverData.user.imgUrl;
    const username = this.state.serverData.user.name;
    const userId = this.state.serverData.user.id;
    const newPost = await submitPost(
      profilePic,
      username,
      userId,
      text,
      songId,
      songName,
      songArtist,
      songArt,
      startTime,
      stopTime
    );
    const updatedPosts = this.state.serverData.posts;
    updatedPosts.unshift(newPost);
    this.setState({
      serverData: {
        posts: updatedPosts,
        user: this.state.serverData.user
      },
      newPost: false
    });
  }

  clickOuterNewPost() {
    const showPost = this.state.newPost;
    this.setState({
      newPost: !showPost
    });
  }
  handleMuteButton() {
    this.setState({ muted: !this.state.muted });
  }
  clickNewPost() {
    const showPost = this.state.newPost;
    this.setState({
      newPost: !showPost
    });
  }
  async updateSearchResults(filterString) {
    let allUsers = await loadAllUsers();
    const filteredUsers = allUsers.filter(x => {
      if (x.username)
        return x.username.toLowerCase().includes(filterString.toLowerCase());
      return false;
    });
    this.setState({ searching: false, searchResults: filteredUsers });
  }

  render() {
    let allPosts = this.state.serverData.posts ? this.state.serverData.posts : [];
    let name = this.state.serverData.user ? this.state.serverData.user.name : 'Not logged in';
    let userId = this.state.serverData.user ? this.state.serverData.user.id : '';
    if (this.state.filterString === "" && this.state.searching) {
      this.setState({ searching: false, searchResults: [] });
    } else if (this.state.searching) {
      this.updateSearchResults(this.state.filterString);
    }

    return (
      <div className="App">
        <Header
          username={name}
          userId={userId}
          newPost={this.state.newPost}
          clickNewPost={this.clickNewPost}
          handleMuteButton={this.handleMuteButton}
          muted={this.state.muted}
        />
        {this.state.newPost &&
          <div>
            <div className="outerNewPost" onMouseDown={this.clickOuterNewPost} />
            <NewPost
              deviceId={this.state.deviceId}
              accessToken={this.state.accessToken}
              onMouseDown={() => { }}
              userName={name}
              submitNewPost={this.submitNewPost}
              handleLogInButton={this.handleLogInButton}
              product={this.state.serverData.user.product}
            />
          </div>
        }
        <div className="searchContainer">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h4 style={{ margin: '0 1em 0 0' }}>Search: </h4>
            <Filter onTextChange={text => {
              this.setState({ searching: true, filterString: text });
            }} />
          </div>
          {this.state.searchResults.length > 0 &&
            <div className={'userSearchResults'}>
              {this.state.searchResults.map(searchedUser =>
                <FollowerLink follow={searchedUser} />
              )}
              {this.state.searchResults.map(searchedUser =>
                <FollowerLink follow={searchedUser} />
              )}
            </div>
          }
        </div>
        {
          (!this.state.accessToken) &&
          <h3 style={{ 'margin': '1em 0 0 16px' }}>
            {allPosts.length === 0 ? "Waiting for backend to wake up. Refresh the page after 30 seconds if nothing loads" :
              "Log in with your Spotify account to share posts and listen to peoples vibes!"}</h3>
        }
        <div className={'blurScreen ' + (this.state.newPost ? 'showBlurScreen' : 'hideBlurScreen')}
          onClick={this.clickOuterNewPost} />
        {
          this.state.accessToken
            ?
            <div className="posts">
              {allPosts.map(currentPost =>
                <Post
                  post={currentPost}
                  deviceId={this.state.deviceId}
                  accessToken={this.state.accessToken}
                  muted={this.state.muted}
                  username={name}
                  product={this.state.serverData.user.product}
                />)}
            </div>
            :
            <div className={"notSignedIn posts" + (this.state.newPost ? " blurPosts" : "")}>
              {allPosts.map(currentPost =>
                <Post
                  post={currentPost}
                  deviceId={null}
                  accessToken={null}
                  muted={this.state.muted}
                />)}
            </div>
        }
      </div>
    );
  }
}

export default HomePage;
