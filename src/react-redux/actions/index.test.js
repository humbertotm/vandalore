import * as actions from './index'
import { RESET_ERROR_MESSAGE, TOGGLE_MODAL, UPDATE_CURRENT_GALLERY } from './constants'

describe('actions', () => {
    it('should create an action to toggle specified modal', () => {
        const modal = 'signUpForm'
        const expectedAction = {
            type: TOGGLE_MODAL,
            contentForm: modal
        }
        expect(actions.toggleModal(modal)).toEqual(expectedAction)
    })
})

describe('actions', () => {
    it('should create an action to modify currentGallery', () => {
        const gallery = 'hot'
        const expectedAction = {
            type: UPDATE_CURRENT_GALLERY,
            gallery
        }
        expect(actions.updateCurrentGallery(gallery)).toEqual(expectedAction)
    })
})

describe('actions', () => {
    it('should create an action to reset error messages', () => {
        const expectedAction = {
            type: RESET_ERROR_MESSAGE,
        }
        expect(actions.resetErrorMessage()).toEqual(expectedAction)
    })
})
