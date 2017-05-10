import { modal } from './modalsReducer'
import * as types from '../actions/constants'

// Test modals reducer.
describe('modals reducer', () => { 
	it('should return default initial state', () => {
		expect(
			modal(undefined, {})
		).toEqual({
			isOpen: false,
			contentForm: null
		})
	})

	it('should handle TOGGLE_MODAL action', () => {
		expect(
			modal({
				isOpen: false,
				contentForm: null
			}, {
				type: types.TOGGLE_MODAL,
				contentForm: 'logInForm'
			})
		).toEqual({
			isOpen: true,
			contentForm: 'logInForm'
		})
	})

	it('should return state if action is not listened for', () => {
		expect(
			modal({
				isOpen: false,
				contentForm: null
			}, {
				type: types.RESET_ERROR_MESSAGE
			})
		).toEqual({
			isOpen: false,
			contentForm: null
		})
	})
})