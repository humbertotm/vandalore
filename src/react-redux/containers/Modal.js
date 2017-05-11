import React, { Component, PropTypes } from 'react'
import Modal from 'react-modal'
import FormContainer from './FormContainer'

export default class Modal extends Component {
    render() {
        const { modal } = this.props
        const isOpen = modal.isOpen
        const contentForm = modal.contentForm

        return (
            <div>
                <Modal isOpen={isOpen} contentLabel={'formModal'}>
                    <FormContainer contentLabel={contentForm} />
                </Modal>
            </div>
        )
    }
}

Modal.PropTypes = {

}

mapStateToProps = state => {
    // modal: state.modal
}