import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import NavBar from '../components/NavBar'
import LogInModal from '../components/LogInModal'
import SignUpModal from '../components/SignUpModal'

class App extends Component {
    constructor(props) {
        this.toggleModal = this.toggleModal.bind(this)
    }

    // Toggles modal specified in params.
    toggleModal(modal) {
        const { toggleModal } = this.props
        toggleModal(modal)
    }

    render() {
        return (
            <div>
                <NavBar
                    onLogInClick={this.toggleModal}
                    onSignUpClick={this.toggleModal} />

                <LogInModal toggleLogInModal={this.toggleModal} />
                <SignUpModal toggleSignUpModal={this.toggleModal}/>

                // Children of the parent Route.
                {this.props.children}

            </div>
        )
    }
}

App.PropTypes = {

}

mapDispatchToProps = dispatch => {
    // toggleModal: dispatch(toggleModal())
}

export default connect(mapDispatchToProps)(App)
