import {db} from '~/db.server'

export function getAllRestaurants() {
	return db.restaurant.findMany({
		orderBy: {
			name: 'asc',
		},
		include: {
			items: true,
		},
	})
}
