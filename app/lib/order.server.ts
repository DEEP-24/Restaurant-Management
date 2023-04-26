import type {
	Invoice,
	Order,
	OrderType,
	PaymentMethod,
	User,
} from '@prisma/client'
import {OrderStatus} from '@prisma/client'
import type {CartItem} from '~/context/CartContext'
import {db} from '~/db.server'

export function getOrders(userId: User['id']) {
	return db.order.findMany({
		where: {
			userId,
		},
		orderBy: {
			createdAt: 'desc',
		},
		include: {
			invoice: true,
			items: {
				include: {
					item: true,
				},
			},
		},
	})
}

export function createOrder({
	userId,
	items,
	amount,
	orderType,
	paymentMethod,
	address,
}: {
	userId: User['id']
	items: Array<CartItem>
	amount: Invoice['amount']
	paymentMethod: PaymentMethod
	orderType: OrderType
	address: Invoice['address']
}) {
	return db.order.create({
		data: {
			userId,
			type: orderType,
			status: OrderStatus.PENDING,
			items: {
				createMany: {
					data: items.map(item => ({
						itemId: item.id,
						quantity: item.quantity,
					})),
				},
			},
			invoice: {
				create: {
					amount,
					totalAmount: amount,
					paymentMethod,
					address,
				},
			},
		},
	})
}

export async function cancelOrder(orderId: Order['id']) {
	const order = await db.order.findUnique({
		where: {
			id: orderId,
		},
		include: {
			items: {
				include: {
					item: true,
				},
			},
		},
	})

	if (!order) {
		throw new Error('Order not found')
	}

	return db.order.update({
		where: {
			id: orderId,
		},
		data: {
			status: OrderStatus.CANCELLED,
		},
	})
}
