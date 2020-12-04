import React, { Component } from 'react';
import '../style/App.css';
import queryString from 'query-string';
import Slider from '@material-ui/core/Slider';
import { withStyles } from '@material-ui/core/styles';
import { saveProfilePicY } from '../backendCalls';
import logo from '../img/VibeShareLogo.svg';

class ProfilePageHeader extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showMobileMenu: false,
            startingProfilePicY: '20%',
            currentProfilePicY: '20%',
            adjustingCoverImage: false
        };
        this.redirectToHomePage = this.redirectToHomePage.bind(this);
        this.handleLogInButton = this.handleLogInButton.bind(this);
        this.toggleMobileMenu = this.toggleMobileMenu.bind(this);
        this.redirectToProfilePage = this.redirectToProfilePage.bind(this);
        this.handleSliderChange = this.handleSliderChange.bind(this);
        this.adjustCoverImage = this.adjustCoverImage.bind(this);
        this.saveCoverImageAdjustments = this.saveCoverImageAdjustments.bind(this);
    }

    componentWillReceiveProps() {
        if (this.props.profilePicY !== this.state.startingProfilePicY)
            this.setState({ startingProfilePicY: (this.props.profilePicY) });
    }
    redirectToHomePage() {
        let parsed = queryString.parse(window.location.search);
        let accessToken;
        if (parsed.access_token)
            accessToken = parsed.access_token;

        window.location.href = window.location.origin + (accessToken ? ('?access_token=' + accessToken) : '');
    }
    handleLogInButton() {
        if (!queryString.parse(window.location.search).access_token) {
            window.location.href = (window.location.href.includes('localhost')) ?
                'http://localhost:8000/login' : 'https://vibin-backend.herokuapp.com/login'
        }
    }
    toggleMobileMenu() {
        this.setState({
            showMobileMenu: !this.state.showMobileMenu
        });
    }
    redirectToProfilePage() {
        let parsed = queryString.parse(window.location.search);
        let accessToken = ''
        if (parsed.access_token)
            accessToken = parsed.access_token;

        window.location.href = window.location.origin +
            '/user/?username=' + this.props.username +
            '&userId=' + this.props.userId +
            (accessToken ? ('&access_token=' + accessToken) : '');
    }
    handleSliderChange = (event, value) => {
        this.setState({
            currentProfilePicY: (value + '%')
        });
    }
    adjustCoverImage() {
        this.setState({
            adjustingCoverImage: !this.state.adjustingCoverImage,
            currentProfilePicY: this.state.startingProfilePicY
        });
    }
    saveCoverImageAdjustments() {
        saveProfilePicY(this.props.profilePageId, this.state.currentProfilePicY);
        this.setState({
            adjustingCoverImage: !this.state.adjustingCoverImage,
            startingProfilePicY: this.state.currentProfilePicY
        });
    }
    trimOffPercent(numberWithPercentSign) {
        return ((numberWithPercentSign.slice(0, -1)) * 1);
    }
    render() {
        return (
            <div className='profilePageHeader'
                style={{
                    backgroundImage: 'url(' + this.props.profilePic + ')',
                    backgroundPosition: ('center ' + (this.state.adjustingCoverImage ?
                        this.state.currentProfilePicY : this.state.startingProfilePicY))
                }}>
                <div style={{ color: 'white'}}>
                    <img className="logo" src={logo} onClick={this.redirectToHomePage}></img>
                    <h3 className='usernameTitle'>{this.props.profilePic}</h3>
                </div>
                {this.props.username === 'Not logged in' ?
                    <button className='logIn myButtonWhite Log-In-Button' style={{ marginTop: '2em' }}
                        onClick={this.handleLogInButton}>Log In</button> :
                    <button className='mobile myButtonWhite' style={{ marginTop: '2em' }}
                        onClick={this.toggleMobileMenu}>Menu</button>}

                {this.props.username !== '' && this.props.username !== 'Not logged in' &&
                    <div className='desktopNav buttonContainer' style={{ marginTop: '2em' }}>
                            {this.props.clickNewPost && <button className='myButtonWhite'
                                onClick={this.props.clickNewPost}>{this.props.newPost ? "Cancel" : "New Post"}</button>}
                        <button className='myButtonWhite' onClick={this.redirectToProfilePage}>Your Profile</button>
                        <button className='myButtonWhite' onClick={this.props.handleMuteButton}>
                            {this.props.muted ? 'Unmute' : 'Mute'}</button>
                        <button className='myButtonWhite' onClick={this.handleLogInButton}>Log Out</button>
                    </div>
                }

                {this.props.username !== '' && this.props.username !== 'Not logged in' &&
                    <div className={'mobileNav ' + (this.state.showMobileMenu ? 'showMobileNav' : 'hideMobileNav')}>
                        <h4 className='closeMenu' onClick={this.toggleMobileMenu}>Close Menu</h4>
                        {this.props.clickNewPost && <h4 onClick={this.props.clickNewPost}>
                                {this.props.newPost ? "Cancel" : "New Post"}</h4>}
                        <h4 onClick={this.redirectToProfilePage}>Your Profile</h4>
                        <h4 onClick={this.props.handleMuteButton}>
                            {this.props.muted ? 'Unmute' : 'Mute'}</h4>
                        <h4 onClick={this.handleLogInButton}>Log Out</h4>
                    </div>
                }
                {this.props.userId && (
                    (this.props.userId !== this.props.profilePageId) ?
                        <button className='myButtonOrange followButton' onClick={this.props.clickFollowButton}>
                            {this.props.loggedInUserFollowingProfileUser ? 'Unfollow' : 'Follow'}</button> :
                        <div className='coverImageSlider'>
                            {!this.state.adjustingCoverImage ?
                                <button className='adjustCoverImageButton myButtonOrange'
                                    onClick={this.adjustCoverImage}>Adjust Cover Image</button> :
                                <div style={{ height: '100%' }}>
                                    <CoverImageSlider
                                        max={100}
                                        defaultValue={this.trimOffPercent(this.state.startingProfilePicY)}
                                        valueLabelDisplay="auto"
                                        aria-labelledby="range-slider"
                                        valueLabelFormat={(value, index) => {
                                            return value + '%';
                                        }}
                                        orientation='vertical'
                                        onChange={this.handleSliderChange}
                                    />
                                    <div>
                                        <button className='saveCoverImageAdjustments myButtonOrange'
                                            onClick={this.saveCoverImageAdjustments}>Save</button>
                                        <button className='cancelCoverImageAdjustments myButtonOrange'
                                            onClick={this.adjustCoverImage}>Cancel</button>
                                    </div>
                                </div>
                            }
                        </div>)
                }
            </div>
        );
    }
}

export default ProfilePageHeader;

const CoverImageSlider = withStyles({
    root: {
        color: '#262cde',
        padding: '13px 0',
    },
    thumb: {
        height: 27,
        width: 27,
        backgroundColor: '#fff',
        border: '1px solid currentColor',
        marginTop: -12,
        marginLeft: '-9px !important',
        '&:focus, &:hover, &$active': {
            boxShadow: '#ccc 0 2px 3px 1px',
        },
    },
    active: {},
    rail: {
        color: '#d8d8d8',
        opacity: 1,
        width: '10px !important',
        borderRadius: 1
    },
    track: {
        width: '10px !important',
        borderRadius: 1
    },
})(Slider);