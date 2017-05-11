import * as reducers from './index'
import * as types from '../actions/constants'

// Test entities reducer.
describe('entities reducer', () => {
    const entities = reducers.entities
    // const entity = reducers.entity
    const votesWithVote = {
        users: {},
        posts: {},
        votes: {
            "1": {
                id: "1",
                userId: "5",
                postId: "2"
            }
        },
        comments: {},
        relationships: {}
    }

    it('should return default initial state', () => {
        expect(
            entities(undefined, {})
        ).toEqual({
            users: {},
            posts: {},
            votes: {},
            comments: {},
            relationships: {}
        })
    })

    it('should handle an action with response.entities', () => {
        expect(
            entities({
                users: {},
                posts: {},
                votes: {},
                comments: {},
                relationships: {}
            }, {
                type: types.CREATE_VOTE_SUCCESS,
                response: {
                    entities: {
                        votes: {
                            "1": {
                                id: "1",
                                userId: "5",
                                postId: "2"
                            }
                        }
                    }
                }
            })
        ).toEqual(votesWithVote)
    })

    it('should return state if action is not listened for', () => {
        expect(
            entities(votesWithVote, {
                type: types.RESET_ERROR_MESSAGE
            })
        ).toEqual(votesWithVote)
    })

    // This tests entity reducer indirectly. It comes into play when an
    // element is deleted from an entity.
    it('should handle an action with response.keysArray', () => {
        expect(
            entities({
                users: {},
                posts: {},
                votes: {
                    "1": {
                        id: "1",
                        userId: "5",
                        postId: "2"
                    },
                    "2": {
                        id: "2",
                        userId: "2",
                        postId: "2"
                    }
                },
                comments: {},
                relationships: {}
            }, {
                type: types.DELETE_VOTE_SUCCESS,
                response: {
                    entity: 'votes',
                    keysArray: ['2']
                }
            })
        ).toEqual({
            users: {},
            posts: {},
            votes: {
                "2": {
                    id: "2",
                    userId: "2",
                    postId: "2"
                }
            },
            comments: {},
            relationships: {}
        })
    })
})

// Test entity reducer.
describe('entity reducer', () => {
    const singleEntity = reducers.singleEntity

    it('should return default initial state', () => {
        expect(
            singleEntity(undefined, {})
        ).toEqual({})
    })

    it('should handle action with response.keysArray', () => {
        expect(
            singleEntity({
                "1": {
                    id: "1",
                    userId: "5",
                    postId: "5"
                },
                "2": {
                    id: "2",
                    userId: "5",
                    postId: "2"
                }
            }, {
                type: types.DELETE_VOTE_SUCCESS,
                response: {
                    entity: 'votes',
                    keysArray: ["1"]
                }
            })
        ).toEqual({
            "1": {
                id: "1",
                userId: "5",
                postId: "5"
            }
        })
    })

    it('should return state if action is not listened for', () => {
        expect(
            singleEntity({
                "1": {
                    id: "1",
                    userId: "5",
                    postId: "5"
                }
            }, {
                type: types.CREATE_VOTE_SUCCESS,
                response: {
                    "1": {
                        id: "1"
                    }
                }
            })
        ).toEqual({
            "1": {
                id: "1",
                userId: "5",
                postId: "5"
            }
        })
    })
})

// Test currentGallery reducer.
describe('currentGallery reducer', () => {
    const currentGallery = reducers.currentGallery

    it('should return default initial state', () => {
        expect(
            currentGallery(undefined, {})
        ).toEqual('home')
    })

    it('should handle UPDATE_CURRENT_GALLERY', () => {
        const newCurrentGallery = 'fresh'

        expect(
            currentGallery('home', {
                type: types.UPDATE_CURRENT_GALLERY,
                gallery: newCurrentGallery
            })
        ).toEqual(newCurrentGallery)
    })

    it('should return state if action type is not listened for', () => {
        expect(
            currentGallery('fresh', {
                type: types.RESET_ERROR_MESSAGE
            })
        ).toEqual('fresh')
    })
})

// Test errorMessage reducer.
describe('errorMessage reducer', () => {
    const errorMessage = reducers.errorMessage

    it('should return default initial state', () => {
        expect(
            errorMessage(undefined, {})
        ).toEqual(null)
    })

    it('should handle RESET_ERROR_MESSAGE', () => {
        expect(
            errorMessage('Some error message.', {
                type: types.RESET_ERROR_MESSAGE
            })
        ).toEqual(null)
    })

    it('should add an error message', () => {
        const error = 'some error message'
        expect(
            errorMessage(null, {
                type: types.COMMENT_FAILURE,
                error: error
            })
        ).toEqual(error)
    })

    it('should return state if action type is not listened for', () => {
        expect(
            errorMessage(null, {
                type: types.COMMENT_SUCCESS,
            })
        ).toEqual(null)
    })
})