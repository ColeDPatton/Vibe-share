import React, { Component } from 'react';
import profilePicturePlaceholder from '../img/profilePicturePlaceholder.jpg';
import '../style/App.css';
import queryString from 'query-string';
import { getTrack, playAt, pause, search } from '../spotifyCalls';
import { withStyles, makeStyles, duration } from '@material-ui/core/styles';
import Slider from '@material-ui/core/Slider';

export default class NewPost extends Component {
    constructor(props) {
        super(props);
        this.state = {
            text: '',
            startTime: 23000,
            endTime: 64000,
            defaultTime: [23000, 64000],
            time: 23000,
            start: 0,
            playing: false,
            searching: false,
            filterString: '',
            searchResults: [],
            formPage: 1,
            selectedSong: {},
            song: ''
        };
        this.selectSong = this.selectSong.bind(this);
        this.handleSliderChange = this.handleSliderChange.bind(this);
        this.startTimer = this.startTimer.bind(this);
        this.stopTimer = this.stopTimer.bind(this);
        this.handlePlayClick = this.handlePlayClick.bind(this);
        this.handlePauseClick = this.handlePauseClick.bind(this);
    }

    updateResults = async (filterString) => {
        const results = await search(this.props.accessToken, filterString);
        this.setState({ searching: false, searchResults: results.tracks.items });
    }
    switchForm = () => {
        const nextPage = this.state.formPage === 1 ? 2 : 1;
        this.setState({
            defaultTime: [this.state.startTime, this.state.endTime],
            formPage: nextPage
        });
    }
    selectSong(song) {
        if (this.props.product !== 'premium' && !song.preview_url) {
            alert('Sorry, the song you selected does not have 30 second preview. ' +
                'Select a different song or upgrade your account');
        } else {
            this.setState({
                searching: false,
                searchResults: [],
                filterString: "",
                selectedSong: {
                    name: song.name,
                    artist: song.album.artists[0].name,
                    art: song.album.images[0].url,
                    id: song.id,
                    duration: song.duration_ms,
                    preview_url: song.preview_url
                }
            });
        }
    }
    pauseSong = async (accessToken) => {
        await pause(accessToken);
        this.stopTimer();
    }
    playSong = async (deviceId, accessToken, songId) => {
        await playAt(deviceId, accessToken, songId, this.state.startTime);
        this.stopTimer();
        this.startTimer();
    }
    handleSliderChange = (event, value) => {
        this.setState({
            startTime: (value[0] * 1000),
            endTime: (value[1] * 1000),
            time: this.state.playing ? this.state.time : (value[0] * 1000)
        });
    }
    startTimer() {
        this.setState({
            playing: true,
            time: this.state.startTime,
            start: Date.now() - this.state.time
        });
        if (!this.timer) {
            this.timer = setInterval(() => {
                this.setState({
                    time: Math.floor(Date.now() - this.state.start)
                });
                if (this.state.time > this.state.endTime) {
                    this.pauseSong(this.props.accessToken);
                }
            }, 1000);
        }
    }
    stopTimer() {
        this.setState({
            playing: false,
            time: this.state.startTime
        });
        clearInterval(this.timer);
        this.timer = '';
    }
    formatTime() {
        let time = Math.floor(this.state.time / 1000);
        let minutes = Math.floor(time / 60);
        let seconds = time - (minutes * 60);
        return minutes + (seconds <= 9 ? ":0" : ":") + seconds;
    }
    submitPost() {
        this.props.submitNewPost(
            this.state.text,
            this.state.selectedSong.id,
            this.state.selectedSong.name,
            this.state.selectedSong.artist,
            this.state.startTime,
            this.state.endTime
        );
    }
    handlePlayClick() {
        if (this.props.product === 'premium') {
            this.playSong(this.props.deviceId, this.props.accessToken, this.state.selectedSong.id);
        } else {
            if (this.state.song)
                this.state.song.pause();
            let song = new Audio(this.state.selectedSong.preview_url);
            this.setState({
                song: song
            });
            song.play();
        }
    }
    handlePauseClick() {
        if (this.props.product === 'premium') {
            this.pauseSong(this.props.accessToken);
        } else {
            this.state.song.pause();
        }
    }

    render() {
        if (this.state.filterString === "" && this.state.searching) {
            this.setState({ searching: false, searchResults: [] });
        } else if (this.state.searching) {
            this.updateResults(this.state.filterString);
        }

        if (this.props.userName === 'Not logged in') {
            return (
                <div className="newPost">
                    <div className="newPostTop">
                        <h1 className="username">{this.props.userName}</h1>
                        <div className="cancelX">
                            <div className="line1"></div>
                            <div className="line2"></div>
                        </div>
                    </div>
                    <h3 className='logInMessage'>Log in to create and share posts</h3>
                    <div className="newPostNotLoggedIn">
                        <button className='myButtonBlue' onClick={this.props.handleLogInButton}>Log In</button>
                    </div>
                </div>
            );
        } else if (this.state.formPage === 1) {
            return (
                <div className="newPost">
                    <div className="newPostTop">
                        <h1 className="username">{this.props.userName}</h1>
                        <div className="cancelX">
                            <div className="line1"></div>
                            <div className="line2"></div>
                        </div>
                    </div>
                    {
                        this.state.text ?
                            <textarea className="newPostText" type="text" defaultValue={this.state.text} onInput={txt => {
                                this.setState({ text: txt.target.value });
                            }}></textarea> :
                            <textarea className="newPostText" type="text" placeholder="Share your feelings with the world..." onInput={txt => {
                                this.setState({ text: txt.target.value });
                            }}></textarea>
                    }
                    <div className="newPostBottom">
                        <button className='myButtonBlue' onClick={() => {
                            this.switchForm();
                        }}>Add Song</button>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="newPost">
                    <div className="newPostTop">
                        <h1 className="username">{this.props.userName}</h1>
                        <div className="cancelX">
                            <div className="line1"></div>
                            <div className="line2"></div>
                        </div>
                    </div>
                    {(this.state.searchResults.length === 0 && !this.state.selectedSong.name &&
                        this.props.product !== 'premium') &&
                        <h3 style={{ color: '#a0320f' }}>As a free Spotify user you may not have access to certain songs</h3>}
                    <div className="searchBar">
                        <h4>Search for a song: </h4>
                        <Filter onTextChange={text => {
                            this.setState({ searching: true, filterString: text });
                        }} />
                    </div>
                    {
                        this.state.searchResults.length > 0 ?
                            <div className="searchedSongContainer">
                                {
                                    this.state.searchResults.map(currentSong =>
                                        <div className="searchResult" onClick={() => this.selectSong(currentSong)}>
                                            <img className="searchResultImg" src={currentSong.album.images[0].url} />
                                            <div>
                                                <h3 className="searchResultSong">{currentSong.name}</h3>
                                                <h5 className="searchResultArtist">{currentSong.album.artists[0].name}</h5>
                                            </div>
                                        </div>
                                    )
                                }
                            </div> :
                            this.state.selectedSong.name &&
                            <div className="selectedSong">
                                <img className="searchResultImg" src={this.state.selectedSong.art} />
                                <div>
                                    <h3 className="searchResultSong">{this.state.selectedSong.name}</h3>
                                    <h5 className="searchResultArtist">{this.state.selectedSong.artist}</h5>
                                </div>
                                {this.props.product && this.props.product === 'premium' ?
                                    <SongTimeSlider
                                        max={Math.ceil(this.state.selectedSong.duration / 1000)}
                                        defaultValue={[this.state.defaultTime[0] / 1000, this.state.defaultTime[1] / 1000]}
                                        valueLabelDisplay="auto"
                                        aria-labelledby="range-slider"
                                        valueLabelFormat={(value, index) => {
                                            let minutes = Math.floor(value / 60);
                                            let seconds = value - (minutes * 60);
                                            return minutes + (seconds <= 9 ? ":0" : ":") + seconds;
                                        }}
                                        onChange={this.handleSliderChange}
                                    /> :
                                    <SongTimeSlider
                                        disabled
                                        max={Math.ceil(this.state.selectedSong.duration / 1000)}
                                        defaultValue={[this.state.defaultTime[0] / 1000, this.state.defaultTime[1] / 1000]}
                                    />
                                }
                                <div className='songTimeControls'>
                                    <button className='myButtonBlue' onClick={this.handlePlayClick}>
                                        {this.props.product === 'premium' ? 'Play clip' : 'Play preview'}
                                    </button>
                                    <h5 className="songTime">{this.formatTime()}</h5>
                                    <button className='myButtonBlue' onClick={this.handlePauseClick}>Pause</button>
                                </div>
                            </div>
                    }
                    <div className="newPostBottom">
                        <button className='myButtonBlue' onClick={() => {
                            this.switchForm();
                        }}>Go back</button>
                        {(this.state.text && this.state.selectedSong.name) ?
                            <button className='myButtonBlue' onClick={() => {
                                this.submitPost();
                            }}>Post</button> :
                            <button title={this.state.text ? 'Select a song before posting' :
                                'Go back and add text before posting'}
                                className='myButtonBlueDeactive'>Post</button>
                        }
                    </div>
                </div>
            );
        }
    }
}

const SongTimeSlider = withStyles({
    root: {
        color: '#363d6b',
        height: 3,
        padding: '13px 0',
        width: '80%',
        'margin-top': '1.67em'
    },
    thumb: {
        height: 27,
        width: 27,
        backgroundColor: '#fff',
        border: '1px solid currentColor',
        marginTop: -12,
        marginLeft: -13,
        boxShadow: '#ebebeb 0 2px 2px',
        '&:focus, &:hover, &$active': {
            boxShadow: '#ccc 0 2px 3px 1px',
        },
        '& .bar': {
            // display: inline-block !important;
            height: 9,
            width: 1,
            backgroundColor: 'currentColor',
            marginLeft: 1,
            marginRight: 1,
        },
    },
    active: {},
    track: {
        height: 5,
        top: '40%'
    },
    rail: {
        color: '#d8d8d8',
        opacity: 1,
        height: 3,
    },
})(Slider);


export class Filter extends Component {
    render() {
        return (
            <div className="filter">
                <input type="text" onKeyUp={event => this.props.onTextChange(event.target.value)} />
            </div>
        );
    }
}