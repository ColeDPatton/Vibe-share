import React, { Component } from 'react';
import '../style/App.css';
import queryString from 'query-string';
import logo from '../img/VibeShareLogo.svg';

class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showMobileMenu: false,
        };
        this.redirectToHomePage = this.redirectToHomePage.bind(this);
        this.handleLogInButton = this.handleLogInButton.bind(this);
        this.toggleMobileMenu = this.toggleMobileMenu.bind(this);
        this.redirectToProfilePage = this.redirectToProfilePage.bind(this);
        this.clickOuterMobileNav = this.clickOuterMobileNav.bind(this);
        this.clickNewPostFromMobileNav = this.clickNewPostFromMobileNav.bind(this);
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
    clickOuterMobileNav() {
        this.setState({
            showMobileMenu: !this.state.showMobileMenu
        });
    }
    clickNewPostFromMobileNav() {
        this.setState({
            showMobileMenu: false
        });
        this.props.clickNewPost();
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

    render() {
        return (
            <div>
                <div className={'blurScreen ' + (this.state.showMobileMenu ? 'showBlurScreen' : 'hideBlurScreen')}
                    onMouseDown={this.clickOuterMobileNav} />
                <div className='header'>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div>
                            <img className="logo" src={logo} onClick={this.redirectToHomePage}></img>
                            <h3 className='usernameTitle'>{this.props.username}</h3>
                        </div>
                        {this.props.username === 'Not logged in' ?
                            <button className='logIn myButtonWhite Log-In-Button' onClick={this.handleLogInButton}>Log In</button> :
                            <button className='mobile myButtonWhite' onClick={this.toggleMobileMenu}>Menu</button>}

                        {this.props.username !== '' && this.props.username !== 'Not logged in' &&
                            <div className='desktopNav buttonContainer '>
                                {this.props.clickNewPost && <button className='myButtonWhite'
                                    onClick={this.props.clickNewPost}>{this.props.newPost ? "Cancel" : "New Post"}</button>}
                                <button className='myButtonWhite' onClick={this.redirectToProfilePage}>Your Profile</button>
                                <button className='myButtonWhite' onClick={this.props.handleMuteButton}>
                                    {this.props.muted ? 'Unmute' : 'Mute'}</button>
                                <button className='myButtonWhite' onClick={this.handleLogInButton}>Log Out</button>
                            </div>
                        }
                    </div>
                </div>
                <div>
                    {this.props.username !== '' && this.props.username !== 'Not logged in' &&
                        <div className={'mobileNav ' + (this.state.showMobileMenu ? 'showMobileNav' : 'hideMobileNav')}>
                            <h4 className='closeMenu' onClick={this.toggleMobileMenu}>Close Menu</h4>
                            {this.props.clickNewPost && <h4 onClick={this.clickNewPostFromMobileNav}>
                                {this.props.newPost ? "Cancel" : "New Post"}</h4>}
                            <h4 onClick={this.redirectToProfilePage}>Your Profile</h4>
                            <h4 onClick={this.props.handleMuteButton}>
                                {this.props.muted ? 'Unmute' : 'Click to Mute'}</h4>
                            <h4 onClick={this.handleLogInButton}>Log Out</h4>
                        </div>
                    }
                </div>
            </div>

        );
    }
}

export default Header;