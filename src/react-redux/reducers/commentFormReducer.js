import UPDATE_COMMENT_FORM_COUNTER from '../actions/constants'

export const commentUI = (state = {
    commentFormCounter: 140
}, action) => {
    switch(action.type) {
        case(UPDATE_COMMENT_FORM_COUNTER) {
            return {
                merge({}, state, action.commentFormCounter)
            }
        }

        default return state
    }
}