import {
	CheckCircleIcon,
	InformationCircleIcon,
	MinusCircleIcon,
} from '@heroicons/react/24/solid'
import {Button} from '@mantine/core'
import {
	cleanNotifications,
	hideNotification,
	showNotification,
} from '@mantine/notifications'
import type {Item} from '@prisma/client'
import {Link} from '@remix-run/react'
import * as React from 'react'
import {useLocalStorageState} from '~/utils/hooks'
import type {DateToString} from '~/utils/types'

const LocalStorageKey = 'restaurant-cart'

export type CartItem = DateToString<Item>

interface ICartContext {
	itemsInCart: Array<CartItem>
	addItemToCart: (item: CartItem) => void
	removeItemFromCart: (itemId: CartItem['id']) => void
	clearCart: () => void
	totalPrice: number
}

const CartContext = React.createContext<ICartContext | undefined>(undefined)

export function CartProvider({children}: {children: React.ReactNode}) {
	const [items, setItems] = useLocalStorageState<CartItem[]>({
		key: LocalStorageKey,
		defaultValue: [],
	})

	const totalPrice = items.reduce(
		(acc, item) => acc + item.price * item.quantity,
		0
	)

	const clearCart = React.useCallback(() => {
		cleanNotifications()
		setItems([])
		showNotification({
			title: 'Successfully cleared',
			message: 'All items in the cart are cleared',
			icon: <CheckCircleIcon className="h-7 w-7" />,
			color: 'green',
		})
	}, [setItems])

	const addItemToCart = React.useCallback(
		(item: CartItem) => {
			const isOrderFromDifferentRestaurant = items.some(
				cartItem => cartItem.restaurantId !== item.restaurantId
			)
			const isAlreadyInCart = items.some(i => i.id === item.id)

			cleanNotifications()

			if (isOrderFromDifferentRestaurant) {
				showNotification({
					id: 'different-restaurant',
					title: 'Order from different restaurant',
					message: (
						<div className="space-y-2">
							<span>You can only order from one restaurant at a time</span>
							<div className="flex items-center gap-4">
								<Button
									variant="subtle"
									color="red"
									onClick={async () => {
										clearCart()
										hideNotification('different-restaurant')
									}}
								>
									Clear previous order
								</Button>

								<Button
									component={Link}
									color="blue"
									to="/cart"
									size="sm"
									onClick={() => hideNotification('different-restaurant')}
								>
									View cart
								</Button>
							</div>
						</div>
					),
					color: 'blue',
					icon: <InformationCircleIcon className="h-9 w-9" />,
					autoClose: false,
				})
				return
			}

			if (!isAlreadyInCart) {
				setItems(prev => [...prev, item])
				showNotification({
					title: 'Successfully added',
					message: `Added ${item.name} to cart`,
					color: 'green',
					icon: <CheckCircleIcon className="h-9 w-9" />,
				})
				return
			}

			setItems(prevItems => {
				const newItems = [...prevItems]

				const index = newItems.findIndex(i => i.id === item.id)
				if (index > -1) {
					newItems[index].quantity = newItems[index].quantity + item.quantity
				}

				return newItems
			})

			showNotification({
				title: 'Item already present in cart',
				message: `Quantity increased by ${item.quantity}`,
				icon: <CheckCircleIcon className="h-7 w-7" />,
				color: 'green',
			})
		},
		[clearCart, items, setItems]
	)

	const removeItemFromCart = (itemId: CartItem['id']) => {
		setItems(prev => prev.filter(item => item.id !== itemId))
		showNotification({
			title: 'Successfully removed',
			message: 'Item removed from cart',
			icon: <MinusCircleIcon className="h-7 w-7" />,
			color: 'red',
		})
	}

	return (
		<CartContext.Provider
			value={{
				itemsInCart: items,
				totalPrice,
				addItemToCart,
				removeItemFromCart,
				clearCart,
			}}
		>
			{children}
		</CartContext.Provider>
	)
}

export function useCart() {
	const context = React.useContext(CartContext)
	if (!context) {
		throw new Error('`useCart()` must be used within a <CartProvider />')
	}

	return context
}
