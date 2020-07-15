import React, { Component } from 'react';
import '../style/App.css';
import queryString from 'query-string';
import { Filter } from '../components/NewPost'
import { FollowerLink } from '../pages/UserProfile'
import { loadAllUsers } from '../backendCalls'

class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showMobileMenu: false,
            searching: false,
            searchResults: []
        };
        this.redirectToHomePage = this.redirectToHomePage.bind(this);
        this.handleLogInButton = this.handleLogInButton.bind(this);
        this.toggleMobileMenu = this.toggleMobileMenu.bind(this);
        this.redirectToProfilePage = this.redirectToProfilePage.bind(this);
        this.updateSearchResults = this.updateSearchResults.bind(this);
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
        if (this.state.filterString === "" && this.state.searching) {
            this.setState({ searching: false, searchResults: [] });
        } else if (this.state.searching) {
            this.updateSearchResults(this.state.filterString);
        }

        return (
            <div>
                <div className={'blurScreen ' + (this.state.showMobileMenu ? 'showBlurScreen' : 'hideBlurScreen')}
                    onMouseDown={this.clickOuterMobileNav} />
                <div className='header'>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div>
                            <h1 onClick={this.redirectToHomePage}>Vibe Share</h1>
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