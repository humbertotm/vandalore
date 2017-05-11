import * as ActionTypes from '../actions/constants'

export const modal = (state = {
    isOpen: false,
    contentForm: null
}, action) => {
    if(action.type === ActionTypes.TOGGLE_MODAL) {
        const { contentForm } = action

        return {
            ...state,
            isOpen: !state.isOpen,
            contentForm
        }
    }

    return state
}