import React, { Component } from 'react';
import profilePicturePlaceholder from '../img/profilePicturePlaceholder.jpg';
import '../style/App.css';
import queryString from 'query-string';
import { getTrack, playAt, pause, getUser } from '../spotifyCalls';
import { useHistory, Link } from 'react-router-dom';
import { loadLikes, likePost, deleteLike } from '../backendCalls';

class PostInfo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            imgUrl: '',
            name: ''
        };
        this.redirectToUserProfile = this.redirectToUserProfile.bind(this);
    }
    componentDidMount() {
        this.reloadUserImg();
    }
    reloadUserImg = async () => {
        this.setState({
            imgUrl: this.props.profilePic,
            name: this.props.name,
            text: this.props.text
        });
    }
    redirectToUserProfile() {
        let parsed = queryString.parse(window.location.search);
        let accessToken = ''
        if (parsed.access_token)
            accessToken = parsed.access_token;

        window.location.href = window.location.origin +
            '/user/?username=' + this.props.name +
            '&userId=' + this.props.id +
            (accessToken ? ('&access_token=' + accessToken) : '');
    }
    render() {
        let name = this.props.name;
        let text = this.props.text;
        if (name !== this.state.name || text !== this.state.text)
            this.reloadUserImg();

        return (
            <div className="postInfo">
                <img className="profilePic" src={this.state.imgUrl ? this.state.imgUrl : profilePicturePlaceholder}
                    onClick={this.redirectToUserProfile}></img>
                <div>
                    <h3 className="username" onClick={this.redirectToUserProfile}>{name}</h3>
                    <p className="postText">{text}</p>
                </div>
            </div>
        );
    }
}

class PostMusic extends Component {
    constructor(props) {
        super(props);
        this.state = {
            picLoaded: false,
            albumUrl: '',
            songName: ''
        };
        this.routeToSpotify = this.routeToSpotify.bind(this);
    }
    routeToSpotify = () => {
        const history = useHistory();
        history.push('https://open.spotify.com/track/' + this.props.songId);
    }
    loadTrack = async () => {
        const albumCover = this.props.songArt;
        this.setState({
            picLoaded: true,
            albumUrl: albumCover,
            songName: this.props.songName
        });
    }
    loadImg = async () => {
        const albumCover = this.props.songArt;
        this.setState({
            picLoaded: true,
            albumUrl: albumCover,
            songName: this.props.songName
        });
    }
    render() {
        let songName = this.props.songName;
        let songArtist = this.props.songArtist;
        if ((this.props.loggedIn && (this.state.songName != this.props.songName)) || (this.props.loggedIn && !this.state.picLoaded)) {
            this.loadTrack();
        } else if ((this.state.songName !== this.props.songName) || !this.state.picLoaded) {
            this.loadImg();
        }
        return (
            <div className="postMusic">
                <img className="albumImg"
                    onClick={event => window.location.href = 'https://open.spotify.com/track/' + this.props.songId}
                    src={this.state.picLoaded ? this.state.albumUrl : profilePicturePlaceholder}>
                </img>
                <div className="songCredit">
                    <h4 className="songName">{songName}</h4>
                    <p className="artists">{songArtist}</p>
                </div>
            </div>
        );
    }
}

export default class Post extends Component {
    constructor(props) {
        super(props);
        this.handleMouseHover = this.handleMouseHover.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.clickedLikePost = this.clickedLikePost.bind(this);
        this.state = {
            playing: false,
            time: 0,
            start: 0,
            accessToken: '',
            likeCount: 0,
            liked: false,
            muted: false,
            product: '',
            name: '',
            text: ''
        };
    }
    componentDidMount() {
        let liked = false;
        loadLikes().then(likes => {
            likes.forEach(like => {
                if (like.postId === this.props.post._id && like.username === this.props.username) {
                    liked = true;
                }
            });
        }).then(() => {
            if (this.props.accessToken) {
                getTrack(this.props.accessToken, this.props.post.songId).then(trackData => {
                    this.setState({
                        accessToken: this.props.accessToken,
                        likeCount: this.props.post.likeCount,
                        liked: liked,
                        muted: this.props.muted,
                        songPreviewUrl: trackData.preview_url,
                        product: this.props.product,
                        name: this.props.post.username,
                        text: this.props.post.text
                    });
                });
            } else {
                this.setState({
                    accessToken: this.props.accessToken,
                    likeCount: this.props.post.likeCount,
                    liked: liked,
                    muted: this.props.muted,
                    songPreviewUrl: '',
                    name: this.props.post.username,
                    text: this.props.post.text
                });
            }
        });
    }
    componentDidUpdate(prevProps) {
        if (this.props.accessToken != prevProps.accessToken)
            this.setState({ accessToken: this.props.accessToken });
        if (this.props.muted != prevProps.muted)
            this.setState({ muted: this.props.muted });
        if (this.props.post.username !== this.state.name || this.props.post.text !== this.state.text) {
            let liked = false;
            loadLikes().then(likes => {
                likes.forEach(like => {
                    if (like.postId === this.props.post._id && like.username === this.props.username) {
                        liked = true;
                    }
                });
            }).then(() => {
                getTrack(this.props.accessToken, this.props.post.songId).then(trackData => {
                    this.setState({
                        likeCount: this.props.post.likeCount ? this.props.post.likeCount : 0,
                        liked: liked,
                        name: this.props.post.username,
                        text: this.props.post.text
                    });
                });
            });
        }
    }
    pauseSong = async (startTime) => {
        pause(this.props.accessToken)
        this.stopTimer(startTime);
    }
    playSong = async (songId, startTime, endTime) => {
        playAt(this.props.deviceId, this.props.accessToken, songId, startTime);
        clearInterval(this.timer);
        this.timer = '';
        this.startTimer(startTime, endTime);
    }
    startTimer = async (startTime, endTime) => {
        this.setState({
            time: startTime,
            start: Date.now() - startTime
        });
        if (!this.timer) {
            this.timer = setInterval(() => {
                this.setState({
                    time: Math.floor(Date.now() - this.state.start),
                });
                if (this.state.time > endTime) {
                    this.pauseSong(startTime);
                }
            }, 1000);
        }
    }
    stopTimer = async (startTime) => {
        this.setState({
            time: startTime,
        });
        clearInterval(this.timer);
        this.timer = '';
    }
    handleMouseHover() {
        if (!this.props.muted && this.state.product) {
            if (this.state.product === 'premium') {
                this.playSong(this.props.post.songId, this.props.post.startTime, this.props.post.stopTime);
            } else if (this.state.songPreviewUrl) {
                if (this.state.song)
                    this.state.song.pause();
                let song = new Audio(this.state.songPreviewUrl);
                this.setState({
                    song: song
                });
                song.play();
            }
        }
    }
    handleMouseLeave() {
        if (!this.props.muted && this.state.product) {
            if (this.state.product === 'premium') {
                setTimeout((() => {
                    this.pauseSong(this.props.post.startTime);
                }), 100);
            } else if (this.state.song) {
                this.state.song.pause();
            }
        }
    }
    clickedLikePost() {
        if (!this.state.liked) {
            likePost(this.props.username, this.props.post._id);
            this.setState({ likeCount: (this.state.likeCount + 1), liked: true });
        } else {
            deleteLike(this.props.username, this.props.post._id);
            this.setState({ likeCount: (this.state.likeCount - 1), liked: false });
        }
    }
    render() {
        let post = this.props.post;
        if (this.state.accessToken) {
            return (
                <div className="post" onTouchStart={this.handleMouseHover} onTouchEnd={this.handleMouseLeave}
                    onMouseEnter={this.handleMouseHover} onMouseLeave={this.handleMouseLeave}>
                    <div className="postInner">
                        <PostInfo profilePic={post.profilePic} access_tokenn={this.state.accessToken} name={post.username} text={post.text} id={post.userId} />
                        <PostMusic songArt={post.songArt} songName={post.songName} songArtist={post.songArtist} songId={post.songId} loggedIn={true} accessToken={this.props.accessToken} />
                    </div>
                    <div className='likeButtonContainer'>
                        <button className={(this.state.liked ? 'likedButton' : 'myButtonOrange')}
                            onClick={this.clickedLikePost}>
                            {this.state.liked ? 'Unlike' : 'Like'}
                        </button>
                        <p>{this.state.likeCount}</p>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="post">
                    <div className='postInner'>
                        <PostInfo profilePic={post.profilePic} name={post.username} text={post.text} id={post.userId} />
                        <PostMusic songArt={post.songArt} songName={post.songName} songArtist={post.songArtist} songId={post.songId} loggedIn={false} />
                    </div>
                    <div className='likeButtonContainer'>
                        <button className='likeButton myButtonOrange'>Like</button>
                        <p>{this.state.likeCount}</p>
                    </div>
                </div>
            );
        }
    }
}