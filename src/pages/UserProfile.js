import React, { Component } from 'react';
import queryString from 'query-string';
import '../style/App.css';
import { loadPosts, loadLikes, loadUser, followUser, unFollowUser, newUser, submitPost } from '../backendCalls'
import { getLoggedInSpotifyUser, getSpotifyUser } from '../spotifyCalls';
import Post from '../components/Post';
import profilePicturePlaceholder from '../img/profilePicturePlaceholder.jpg';
import ProfilePageHeader from '../components/ProfilePageHeader';
import NewPost from '../components/NewPost';

class UserProfile extends Component {
    constructor() {
        super();
        this.state = {
            deviceId: '',
            accessToken: '',
            profilePageUsername: '',
            serverData: {},
            muted: true,
            followers: [],
            following: [],
            loggedInUserFollowingProfileUser: false,
            profilePicY: '',
            newPost: false
        };
        this.clickFollowButton = this.clickFollowButton.bind(this);
        this.followUser = this.followUser.bind(this);
        this.unfollowUser = this.unfollowUser.bind(this);
        this.redirectToHomePage = this.redirectToHomePage.bind(this);
        this.handleMuteButton = this.handleMuteButton.bind(this);
        this.clickNewPost = this.clickNewPost.bind(this);
        this.clickOuterNewPost = this.clickOuterNewPost.bind(this);
        this.submitNewPost = this.submitNewPost.bind(this);
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
        let profilePageUsernameFromUrl = parsed.username;
        let profilePageIDFromUrl = parsed.userId;
        let postsForProfile = [];
        if (parsed.access_token) {
            let accessToken = parsed.access_token;
            getSpotifyUser(accessToken, profilePageIDFromUrl).then(user => {
                let imgUrl = user.images && user.images.length > 0 ?
                    user.images[0].url : '';
                this.setState({
                    imgUrl: imgUrl
                });
            });

            getLoggedInSpotifyUser(accessToken).then(user => {
                let postProfilePic = user.images && user.images.length > 0 ?
                user.images[0].url : '';

                loadUser(user.id).then(loggedInUser => {
                    if (!Object.keys(loggedInUser).length) {
                        newUser(user.id, user.display_name);
                    }
                });
                loadUser(profilePageIDFromUrl).then(profilePageUser => {
                    let loggedInUserFollowingProfileUser = profilePageUser.followers &&
                        profilePageUser.followers.filter(f =>
                            f.username === user.display_name && f.userId === user.id).length > 0;
                    this.setState({
                        followers: profilePageUser.followers,
                        following: profilePageUser.following,
                        loggedInUserFollowingProfileUser: loggedInUserFollowingProfileUser,
                        profilePicY: profilePageUser.profilePicY
                    });
                });

                loadPosts().then(posts => {
                    loadLikes().then(likes => {
                        posts.forEach(post => {
                            let likedByProfilePageUser = false;
                            let likeCount = 0
                            if (post.username === profilePageUsernameFromUrl) {
                                likes.forEach(like => {
                                    if (post._id === like.postId) {
                                        likeCount++;
                                    }
                                });
                                post = {
                                    ...post,
                                    likedByProfilePageUser: likedByProfilePageUser,
                                    likeCount: likeCount
                                }
                                postsForProfile.push(post);
                            } else {
                                likes.forEach(like => {
                                    if (post._id === like.postId) {
                                        likeCount++;
                                        if (like.username === profilePageUsernameFromUrl) {
                                            post = {
                                                ...post,
                                                likedByProfilePageUser: true,
                                                likeCount: likeCount
                                            }
                                            postsForProfile.push(post);
                                        }
                                    }
                                });
                            }
                        });

                        this.setState({
                            accessToken: accessToken,
                            serverData: {
                                posts: postsForProfile,
                                user: {
                                    name: user.display_name,
                                    product: user.product,
                                    id: user.id,
                                    profilePic: postProfilePic
                                }
                            },
                            profilePageUsername: profilePageUsernameFromUrl,
                            profilePageId: profilePageIDFromUrl,
                        });
                    }).then(window.onSpotifyWebPlaybackSDKReady = this.initializePlayer);
                });
            });
        } else {
            loadUser(profilePageIDFromUrl).then(user => {
                this.setState({
                    followers: user.followers,
                    following: user.following,
                    profilePicY: user.profilePicY
                })
            })

            loadPosts().then(posts => {
                loadLikes().then(likes => {
                    posts.forEach(post => {
                        let likeCount = 0
                        if (post.username === profilePageUsernameFromUrl) {
                            likes.forEach(like => {
                                if (post._id === like.postId) {
                                    likeCount++;
                                }
                            });
                            post = {
                                ...post,
                                likedByProfilePageUser: false,
                                likeCount: likeCount
                            }
                            postsForProfile.push(post);
                        } else {
                            likes.forEach(like => {
                                if (post._id === like.postId) {
                                    likeCount++;
                                    if (like.username === profilePageUsernameFromUrl) {
                                        post = {
                                            ...post,
                                            likedByProfilePageUser: true,
                                            likeCount: likeCount
                                        }
                                        postsForProfile.push(post);
                                    }
                                }
                            });
                        }
                    });
                    this.setState({
                        serverData: {
                            posts: postsForProfile,
                        },
                        profilePageUsername: profilePageUsernameFromUrl,
                        profilePageId: profilePageIDFromUrl
                    });
                });
            });
        }
    }
    unfollowUser() {
        unFollowUser(this.state.serverData.user.name, this.state.serverData.user.id,
            this.state.profilePageUsername, this.state.profilePageId);
        const updatedFollowerList = this.state.followers;
        const deleteIndex = updatedFollowerList.findIndex(x => x === this.state.serverData.user.id);
        updatedFollowerList.splice(deleteIndex, 1);
        this.setState({
            followers: updatedFollowerList,
            loggedInUserFollowingProfileUser: false
        });
    }
    followUser() {
        followUser(this.state.serverData.user.name, this.state.serverData.user.id,
            this.state.profilePageUsername, this.state.profilePageId);
        const updatedFollowerList = this.state.followers;
        updatedFollowerList.push({
            userId: this.state.serverData.user.id,
            username: this.state.serverData.user.name
        });
        this.setState({
            followers: updatedFollowerList,
            loggedInUserFollowingProfileUser: true
        });
    }
    clickFollowButton() {
        this.state.loggedInUserFollowingProfileUser ? this.unfollowUser() : this.followUser();
    }
    redirectToHomePage() {
        window.location.href = window.location.origin + (this.state.accessToken ? ('?access_token=' + this.state.accessToken) : '');
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
    clickOuterNewPost() {
        const showPost = this.state.newPost;
        this.setState({
            newPost: !showPost
        });
    }

  async submitNewPost(text, songId, songName, songArtist, songArt, startTime, stopTime) {
    const profilePic = this.state.serverData.user.profilePic;
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

    render() {
        let allPosts = this.state.serverData.posts ? this.state.serverData.posts : [];
        let followers = this.state.followers ? this.state.followers : [];
        let following = this.state.following ? this.state.following : [];
        let name = this.state.serverData.user ? this.state.serverData.user.name : 'Not logged in';
        // let name = this.state.serverData.user ? ( this.state.serverData.user.name + " " + this.state.imgUrl ): this.state.imgUrl;
        let userId = this.state.serverData.user ? this.state.serverData.user.id : '';
        return (
            <div className='App'>
                <ProfilePageHeader
                    username={name}
                    userId={userId}
                    handleMuteButton={this.handleMuteButton}
                    muted={this.state.muted}
                    profilePic={this.state.imgUrl}
                    profilePicY={this.state.profilePicY}
                    profilePageId={this.state.profilePageId}
                    loggedInUserFollowingProfileUser={this.state.loggedInUserFollowingProfileUser}
                    clickFollowButton={this.clickFollowButton}
                    clickNewPost={this.clickNewPost}
                />
                {this.state.newPost &&
                    <div>
                        <div className="outerNewPost" onMouseDown={this.clickOuterNewPost}></div>
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
                <div className='profilePageImgContainer'>
                    <img className='profilePageImg' src={this.state.imgUrl ? this.state.imgUrl : profilePicturePlaceholder} />
                </div>
                <h2 className='profilePageUsername'>{this.state.profilePageUsername}</h2>
                <div className='profilePageContent'>
                    <div className='profilePageUser'>
                        <div className='followContainer'>
                            <h2 style={{ marginTop: 0 }}>Followers: {followers.length}</h2>
                            <div className='scrollFollowers'>
                                {followers.map(follower =>
                                    <FollowerLink follow={follower} />
                                )}
                            </div>
                        </div>
                        <div className='followContainer'>
                            <h2 style={{ marginTop: 0 }}>Following: {following.length}</h2>
                            <div className='scrollFollowing'>
                                {following.map(following =>
                                    <FollowerLink follow={following} />
                                )}
                            </div>
                        </div>
                    </div>
                    <div className='profilePagePosts'>
                        {allPosts.map(currentPost =>
                            <div className='postContainer'>
                                {currentPost.likedByProfilePageUser && <p className="userProfileLikes">{this.state.profilePageUsername} liked:</p>}
                                <Post
                                    post={currentPost}
                                    deviceId={this.state.deviceId}
                                    accessToken={this.state.accessToken}
                                    muted={this.state.muted}
                                    username={name}
                                    product={this.state.serverData.user ? this.state.serverData.user.product : ''}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div >
        )
    }
}

export default UserProfile;

export class FollowerLink extends Component {
    constructor(props) {
        super(props);
        this.state = {
            imgUrl: '',
            name: '',
        };
        this.redirectToUserProfile = this.redirectToUserProfile.bind(this);
    }
    componentWillReceiveProps() {
        if (this.state.name !== this.props.follow.username) {
            let parsed = queryString.parse(window.location.search);
            let accessToken = ''
            if (parsed.access_token) {
                accessToken = parsed.access_token;
                getSpotifyUser(accessToken, this.props.follow.userId).then(user => {
                    let imgUrl = user.images ?
                        user.images[0].url : '';
                    this.setState({
                        imgUrl: imgUrl,
                    });
                });
            }
        }
    }
    componentDidMount() {
        let parsed = queryString.parse(window.location.search);
        let accessToken = ''
        if (parsed.access_token) {
            accessToken = parsed.access_token;
            getSpotifyUser(accessToken, this.props.follow.userId).then(user => {
                let imgUrl = user.images ?
                    user.images[0].url : '';
                this.setState({
                    imgUrl: imgUrl,
                    name: this.props.follow.username
                });
            });
        }
    }
    redirectToUserProfile() {
        let parsed = queryString.parse(window.location.search);
        let accessToken = ''
        if (parsed.access_token)
            accessToken = parsed.access_token;

        window.location.href = window.location.origin +
            '/user/?username=' + this.props.follow.username +
            '&userId=' + this.props.follow.userId +
            (accessToken ? ('&access_token=' + accessToken) : '');
    }
    render() {
        let name = this.props.follow.username;
        return (
            <div className="followerLink" onClick={this.redirectToUserProfile}>
                <img src={this.state.imgUrl ? this.state.imgUrl : profilePicturePlaceholder}></img>
                <h3>{name}</h3>
            </div>
        );
    }
}