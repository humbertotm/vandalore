import { CALL_API, Schemas } from '../middleware/api'
import { RESET_ERROR_MESSAGE, TOGGLE_MODAL, UPDATE_CURRENT_GALLERY } from './constants'

// Resets the currently visible error message.
export const resetErrorMessage = () => ({
    type: RESET_ERROR_MESSAGE
})

// Toggles specified modal.
export const toggleModal = form => ({
    type: TOGGLE_MODAL,
    contentForm: form
})

// Updates current gallery.
export const updateCurrentGallery = gallery => ({
    type: UPDATE_CURRENT_GALLERY,
    gallery
})
