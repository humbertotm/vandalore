import * as actionTypes from '../actions/constants'

const currentUser = (state = {
    isLoggingIn: false,
    isLoggingOut: false,
    currentUserId: null
}, action) => {
    switch(action.type) {
        // Refactor this with [CALL_API].
        case actionTypes.LOGIN_REQUEST:
            return {
                ...state,
                isLoggingIn: true
            }

        case actionTypes.LOGIN_SUCCESS:
            return {
                ...state,
                isLoggingIn: false,
                currentUserId: action.response.entities.id
            }

        case actionTypes.LOGIN_FAILURE:
            return {
                ...state,
                isLoggingIn: false,
                currentUserId: null
            }

        case actionTypes.LOGOUT_REQUEST:
            return {
                ...state,
                isLoggingOut: true
            }

        case actionTypes.LOGOUT_SUCCESS:
            return {
                ...state,
                isLoggingOut: false,
                currentUserId: null
            }

            case LOGOUT_FAILURE:
                return {
                    ...state,
                    isLoggingOut: false
                }

        default:
            return state
    }
}

export default currentUser