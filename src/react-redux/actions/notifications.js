import { 
	NOTIFICATIONS_REQUEST, 
	NOTIFICATIONS_SUCCESS, 
	NOTIFICATIONS_FAILURE 
} from './constants'
import { CALL_API, Schemas } from '../middleware/api'

// Fetches notifications for user. Relies on api middleware.
const fetchNotifications = userId => {
	[CALL_API]: {
		types: [ NOTIFICATIONS_REQUEST, NOTIFICATIONS_SUCCESS, NOTIFICATIONS_FAILURE ],
		method: 'GET',
		endpoint: `/notifications?userId=${userId}`,
		schema: Schemas.notificationSchema
	}
} 