// Duncan Echols-Jones
// 2/18/2021
// React Profile Component, used to render our Profile page for all of the users' information

import React from 'react';
import UserService from '../services/UserService';
import MessageService from '../services/MessageService';
import SearchService from '../services/SearchService';
import MessageComponent from '../components/messages/MessageComponent';
import './ProfileComponentStyles.css';

// Display the logged in users' data as well as incoming and outgoing messages, and suggests other users
// who have the same conditions that they do. Then, allows them to easily go to that other person's 
// profile and message them
class ProfileComponent extends React.Component {

    state = {
        user: {},
        condition: {},
        commonConditionId: null,
        incomingMessages: [],
        sentMessages: [],
        otherUsersWithCondition: [],
        showIncoming: false,
        showSent: false,
        editingMode: false
    }

    // On mount, get logged in user, incmoing and outgoing messages, and find other users with a 
    // randomly selected condition that that user suffers from
    componentDidMount() {
        UserService.getLoggedInUser().then(actualUser => {
            this.setState({ user: actualUser })
            MessageService.getIncomingMessages(this.state.user.userId)
                .then(actualMessages => this.setState({ incomingMessages: actualMessages }))
            MessageService.getOutgoingMessages(this.state.user.userId)
                .then(actualMessages => this.setState({ sentMessages: actualMessages }))
            UserService.getOtherUsersWithCondition().then(actualUsers => {
                this.setState({ otherUsersWithCondition: actualUsers })
                SearchService.getConditionDetails(this.findCommonCondition()).then(actualCondition =>
                    this.setState({ condition: actualCondition })
                )
            })
        })
    }

    // Update inbox / outbox for a sent or receieved message without page refresh
    componentDidUpdate(prevProps, prevState) {
        if (prevState.sentMessages.length !== this.state.sentMessages.length ||
            !prevState.sentMessages.every((value, index) => value === this.state.sentMessages[index])) {
            MessageService.getOutgoingMessages(this.state.user.userId)
                .then(actualMessages => this.setState({ sentMessages: actualMessages }))
        }
    }

    // Function to identify which condition is the one that both the logged in user and each suggested
    // user have in common
    findCommonCondition() {
        console.log(this.state.user.conditions)
        console.log(this.state.otherUsersWithCondition)
        console.log(this.state.otherUsersWithCondition[0].conditions)
        const commonConditions = this.state.user.conditions.filter(value =>
            this.state.otherUsersWithCondition[0].conditions.includes(value))
        console.log("COMMON CONDITIONS")
        console.log(commonConditions)
        const index = commonConditions.indexOf("");
        if (index > -1) {
            commonConditions.splice(index, 1);
        }
        this.setState({ commonConditionId: commonConditions[0] })
        return commonConditions[0]
    }

    // Send message
    sendMessage = (fromUserId, toUserId, messageText) => {
        var message = {}
        message['fromUserId'] = fromUserId
        message['toUserId'] = toUserId
        message['messageText'] = messageText
        MessageService.sendMessage(message)
    }

    // These toggles allow us to make a drop down view for all messages
    toggleIncoming() {
        this.setState({ showIncoming: !this.state.showIncoming })
    }

    toggleSent() {
        this.setState({ showSent: !this.state.showSent })
    }

    handleLogout() {
        UserService.logout().then(response =>
            this.setState({ user: {} })
        )
    }

    handleEditMode = () => {
        this.setState({
            editingMode: !this.state.editingMode
        })
    }

    // CRUD functionality for profile
    saveProfileChanges = () => {
        this.handleEditMode()
        UserService.updateUser(this.state.user.userId, this.state.user)
            .then(updatedUser =>
                this.setState({
                    user: updatedUser
                })
            )
    }

    handleDeleteProfile = () => {
        if (window.confirm("Are you sure you want to delete your profile?")) {
            UserService.deleteUser(this.state.user.userId).then(response => {
                this.props.history.push('/')
            }
            )
        } else {
            return
        }
    }

    updateProfilePicture() {
        // Currently, not working due to local resource issues. Would need to figure out a way to 
        // either enable local links (less preferred, security issue) or instead save image with upload
        // and then render that saved image
        console.log(document.getElementById('profile-img-input').value)
        this.setState({ user: { ...this.state.user, imageURL: document.getElementById('profile-img-input').value } })
        UserService.updateUser(this.state.user.userId, this.state.user)
            .then(updatedUser =>
                this.setState({
                    user: updatedUser
                })
            )
    }

    render() {
        return (
            <div className="container-fluid">
                {!this.state.user.username &&
                    <div className="unlogged-message">
                        <h5>You are not logged in. <a href="/login">Go to login</a></h5>
                    </div>
                }

                {this.state.user.username &&
                    <div>
                        <div className="row">
                            <button onClick={() => this.handleLogout()} className="btn btn-secondary">Logout</button>
                            <h1>Logged in as {this.state.user.username}</h1>
                        </div>
                        <div className="row">
                            <div className="col-sm-6">
                                <div className="jumbotron">
                                    <h1 className="display-4">Your Profile</h1>
                                    <hr className="my-4" />
                                    <div className="row">
                                        <div className="col-sm-7">
                                            <div className="card profile-card">

                                                <input type='file' id="profile-img-input" onChange={() => this.updateProfilePicture()} />
                                                <object className="card-img-top" data={require('../../src/profile/emptyprofile.png')} type="image/png">
                                                    <img className="card-img-top" src={this.state.user.imageURL}
                                                        alt="Not found" />
                                                </object>
                                                {/* <img className="card-img-top" src={this.state.user.imageURL}
                                                    defaultValue={require('../../src/profile/emptyprofile.png')} alt="Not found" /> */}

                                                <hr className="my-4" />
                                                <h5 className="card-title"> {this.state.user.firstName} {this.state.user.lastName}</h5>
                                            </div>
                                        </div>
                                        <div className="col-sm-5">
                                            {this.state.editingMode === false &&
                                                <div>
                                                    <button className="btn btn-warning" onClick={() => this.handleEditMode()}>Edit your profile</button>
                                                    <p className="lead">Name: {this.state.user.firstName} {this.state.user.lastName}</p>
                                                    <p className="lead">Email: {this.state.user.email}</p>
                                                    <p className="lead">Phone: {this.state.user.phone}</p>
                                                    <p className="lead">User type: {this.state.user.role}</p>
                                                </div>
                                            }
                                            {this.state.editingMode === true &&
                                                <p className="lead">
                                                    <button className="btn btn-danger" onClick={() => this.handleDeleteProfile()}>Delete your profile</button>
                                                    <form>
                                                        <div className="form-group">
                                                            <label htmlFor="usernameInput">Username:
                                                                <input
                                                                    defaultValue={this.state.user.username}
                                                                    onChange={(e) => this.setState({ user: { ...this.state.user, username: e.target.value } })}
                                                                />
                                                            </label>

                                                        </div>
                                                        <div className="form-group">
                                                            <label htmlFor="firstNameInput">First name:
                                                                <input
                                                                    defaultValue={this.state.user.firstName}
                                                                    onChange={(e) => this.setState({ user: { ...this.state.user, firstName: e.target.value } })}
                                                                />
                                                            </label>

                                                        </div>
                                                        <div className="form-group">
                                                            <label htmlFor="lastNameInput">Last name:
                                                                <input
                                                                    defaultValue={this.state.user.lastName}
                                                                    onChange={(e) => this.setState({ user: { ...this.state.user, lastName: e.target.value } })}
                                                                />
                                                            </label>

                                                        </div>
                                                        <div className="form-group">
                                                            <label htmlFor="emailInput">Email:
                                                                <input
                                                                    defaultValue={this.state.user.email}
                                                                    onChange={(e) => this.setState({ user: { ...this.state.user, email: e.target.value } })}
                                                                />
                                                            </label>

                                                        </div>
                                                        <div className="form-group">
                                                            <label htmlFor="phoneInput">Phone:
                                                                <input
                                                                    defaultValue={this.state.user.phone}
                                                                    onChange={(e) => this.setState({ user: { ...this.state.user, phone: e.target.value } })}
                                                                />
                                                            </label>

                                                        </div>
                                                        <button onClick={() => this.saveProfileChanges()}>Save your profile changes</button>
                                                    </form>
                                                </p>
                                            }
                                        </div>
                                    </div>
                                </div>

                            </div>
                            <div className="col-sm-2">
                            </div>
                            <div className="col-sm-4">
                                <div className="jumbotron message-center-jumbotron">
                                    <div className="row">
                                        <h4>Message Center</h4>
                                    </div>
                                    <hr className="my-4" />
                                    <div className="row">
                                        <button onClick={() => this.toggleIncoming()} type="button" className="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                            View incoming messages
                                        </button>
                                        {this.state.showIncoming &&
                                            <ul className="container-fluid incoming-message-div">
                                                {
                                                    this.state.incomingMessages.map((message, index) => {
                                                        return <MessageComponent
                                                            key={message.id}
                                                            userId={this.state.user.userId}
                                                            message={message}
                                                            sendMessage={this.sendMessage}
                                                        />
                                                    })
                                                }
                                            </ul>
                                        }
                                    </div>
                                    <hr className="my-4" />
                                    <div className="row">
                                        <button onClick={() => this.toggleSent()} type="button" className="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                            View sent messages
                                        </button>
                                        {this.state.showSent &&
                                            <ul className="container-fluid sent-message-div">
                                                {
                                                    this.state.sentMessages.map((message, index) => {
                                                        return <MessageComponent
                                                            key={message.id}
                                                            userId={this.state.user.userId}
                                                            message={message}
                                                            sendMessage={this.sendMessage}
                                                        />
                                                    })
                                                }
                                            </ul>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                        {this.state.otherUsersWithCondition &&
                            <div className="jumbotron">
                                <p className="lead">Other users in the <a href={`/search/${this.state.commonConditionId}`}>{this.state.condition.Name}</a> community </p>
                                <div className="row">
                                    {this.state.otherUsersWithCondition.map((user, index) =>
                                        <div className="card other-user-condition-card">
                                            <img className="card-img-top" src={require('../../src/profile/emptyprofile.png')} alt="Card image cap" />
                                            <div className="card-body">
                                                <h5 className="card-title">{user.username}</h5>
                                                <a href={`profile/${user.userId}`} className="btn btn-primary">See profile</a>
                                            </div>
                                        </div>
                                    )
                                    }
                                </div>
                            </div>
                        }
                    </div>
                }
            </div>
        )


    }

}

export default ProfileComponent