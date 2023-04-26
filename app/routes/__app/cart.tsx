import {TrashIcon} from '@heroicons/react/24/outline'
import {MinusCircleIcon, ShoppingCartIcon} from '@heroicons/react/24/solid'
import {
	ActionIcon,
	Anchor,
	Button,
	Input,
	Modal,
	Select,
	Textarea,
} from '@mantine/core'
import {cleanNotifications, showNotification} from '@mantine/notifications'
import {OrderType, PaymentMethod} from '@prisma/client'
import type {ActionArgs} from '@remix-run/node'
import {redirect} from '@remix-run/node'
import {Link, useFetcher, useLocation} from '@remix-run/react'
import * as React from 'react'
import ReactInputMask from 'react-input-mask'
import {TailwindContainer} from '~/components/TailwindContainer'
import type {CartItem} from '~/context/CartContext'
import {useCart} from '~/context/CartContext'
import {createOrder} from '~/lib/order.server'
import {getUserId} from '~/session.server'
import {useOptionalUser} from '~/utils/hooks'
import {titleCase} from '~/utils/misc'
import {badRequest, unauthorized} from '~/utils/misc.server'

type ActionData = Partial<{
	success: boolean
	message: string
	discount: number
}>

export async function action({request}: ActionArgs) {
	const formData = await request.formData()

	const userId = await getUserId(request)
	const intent = formData.get('intent')?.toString()

	if (!userId || !intent) {
		return unauthorized({success: false, message: 'Unauthorized'})
	}

	switch (intent) {
		case 'place-order': {
			const stringifiedItems = formData.get('items[]')?.toString()
			const amount = formData.get('amount')?.toString()
			const orderType = formData.get('orderType')?.toString()
			const paymentMethod = formData.get('paymentMethod')?.toString()
			const address = formData.get('address')?.toString()

			if (!stringifiedItems || !amount || !paymentMethod || !orderType) {
				return badRequest<ActionData>({
					success: false,
					message: 'Invalid request body',
				})
			}

			const items = JSON.parse(stringifiedItems) as Array<CartItem>

			await createOrder({
				userId,
				items,
				amount: Number(amount),
				paymentMethod: paymentMethod as PaymentMethod,
				orderType: orderType as OrderType,
				address: address || '',
			})

			return redirect('/order-history/?success=true')
		}

		default:
			return badRequest<ActionData>({success: false, message: 'Invalid intent'})
	}
}

export default function Cart() {
	const id = React.useId()
	const location = useLocation()
	const fetcher = useFetcher<ActionData>()

	const {clearCart, itemsInCart, totalPrice} = useCart()
	const {user} = useOptionalUser()

	const [orderType, setOrderType] = React.useState<OrderType>(OrderType.PICKUP)
	const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>(
		PaymentMethod.CREDIT_CARD
	)
	const [isPaymentModalOpen, setIsPaymentModalOpen] = React.useState(false)
	const [address, setAddress] = React.useState(user?.address ?? '')

	const closePaymentModal = () => setIsPaymentModalOpen(false)
	const showPaymentModal = () => setIsPaymentModalOpen(true)
	const placeOrder = () => {
		const formData = new FormData()
		formData.append('items[]', JSON.stringify(itemsInCart))
		formData.append('amount', totalPrice.toString())
		formData.append('intent', 'place-order')
		formData.append('orderType', orderType)
		formData.append('paymentMethod', paymentMethod)
		formData.append('address', address)
		fetcher.submit(formData, {
			method: 'post',
			replace: true,
		})
	}

	const isSubmitting = fetcher.state !== 'idle'
	const isDelivery = orderType === OrderType.DELIVERY

	React.useEffect(() => {
		if (fetcher.type !== 'done') {
			return
		}

		cleanNotifications()
		if (!fetcher.data.success) {
			showNotification({
				title: 'Error',
				message: fetcher.data.message,
				icon: <MinusCircleIcon className="h-7 w-7" />,
				color: 'red',
			})
			return
		}
	}, [fetcher.data, fetcher.type])

	return (
		<>
			<div className="flex flex-col gap-4 p-4">
				<div className="bg-white">
					<TailwindContainer>
						<div className="sm:px-4py-16 py-16 px-4 sm:py-20">
							<div className="flex items-center justify-between">
								<div>
									<h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
										Your cart
									</h1>
									<p className="mt-2 text-sm text-gray-500">
										Check the cuisines in your cart
									</p>
								</div>

								{itemsInCart.length > 0 ? (
									<div className="space-x-2">
										<Button
											variant="subtle"
											color="red"
											onClick={() => clearCart()}
											disabled={isSubmitting}
										>
											Clear cart
										</Button>

										{user ? (
											<Button
												variant="light"
												loading={isSubmitting}
												onClick={() => showPaymentModal()}
											>
												Make payment
											</Button>
										) : (
											<Button
												variant="light"
												component={Link}
												to={`/login?redirectTo=${encodeURIComponent(
													location.pathname
												)}`}
											>
												Sign in to order
											</Button>
										)}
									</div>
								) : null}
							</div>

							<div className="mt-16">
								<h2 className="sr-only">Current cuisines in cart</h2>

								<div className="flex flex-col gap-12">
									{itemsInCart.length > 0 ? <CartItems /> : <EmptyState />}
								</div>
							</div>
						</div>
					</TailwindContainer>
				</div>
			</div>

			<Modal
				opened={!!user && isPaymentModalOpen}
				onClose={closePaymentModal}
				title="Payment"
				centered
				overlayBlur={1}
				overlayOpacity={0.5}
			>
				<fetcher.Form method="post" replace className="flex flex-col gap-4">
					<div className="flex flex-col gap-2">
						<h2 className="text-sm text-gray-600">
							<span className="font-semibold">Amount: </span>
							<span>${totalPrice.toFixed(2)}</span>
						</h2>
					</div>

					<Select
						label="Order type"
						value={orderType}
						clearable={false}
						onChange={e => setOrderType(e as OrderType)}
						data={Object.values(OrderType).map(type => ({
							label: titleCase(type.replace(/_/g, ' ')),
							value: type,
						}))}
					/>

					<Select
						label="Payment method"
						value={paymentMethod}
						clearable={false}
						onChange={e => setPaymentMethod(e as PaymentMethod)}
						data={Object.values(PaymentMethod).map(method => ({
							label: titleCase(method.replace(/_/g, ' ')),
							value: method,
						}))}
					/>

					<Input.Wrapper
						id={id}
						label="Card Number"
						required
						labelProps={{className: '!text-[13px] !font-semibold'}}
					>
						<Input
							id={id}
							name="cardNumber"
							component={ReactInputMask}
							mask="9999 9999 9999 9999"
							placeholder="XXXX XXXX XXXX XXXX"
							alwaysShowMask={false}
							defaultValue="54326787678756467"
						/>
					</Input.Wrapper>

					<div className="flex items-center gap-4">
						<Input.Wrapper
							id={id + 'cvv'}
							label="CVV"
							labelProps={{className: '!text-[13px] !font-semibold'}}
							required
							className="w-full"
						>
							<Input
								name="cvv"
								id={id + 'cvv'}
								component={ReactInputMask}
								mask="999"
								placeholder="XXX"
								alwaysShowMask={false}
								defaultValue="123"
							/>
						</Input.Wrapper>

						<Input.Wrapper
							id={id + 'expiry'}
							label="Expiry"
							labelProps={{className: '!text-[13px] !font-semibold'}}
							required
							className="w-full"
						>
							<Input
								name="Expiry"
								id={id + 'expiry'}
								component={ReactInputMask}
								mask="99/9999"
								placeholder="XX/XXXX"
								alwaysShowMask={false}
								defaultValue="122026"
							/>
						</Input.Wrapper>
					</div>

					{isDelivery ? (
						<Textarea
							label="Delivery address"
							name="address"
							value={address}
							onChange={e => setAddress(e.target.value)}
							required
						/>
					) : null}

					<div className="mt-6 flex items-center gap-4 sm:justify-end">
						<Button
							variant="subtle"
							color="red"
							onClick={() => closePaymentModal()}
						>
							Cancel
						</Button>

						<Button
							variant="filled"
							onClick={() => placeOrder()}
							loading={isSubmitting}
							loaderPosition="right"
						>
							Place order
						</Button>
					</div>
				</fetcher.Form>
			</Modal>
		</>
	)
}

function CartItems() {
	const {itemsInCart, removeItemFromCart, totalPrice} = useCart()

	return (
		<>
			<table className="mt-4 w-full text-gray-500 sm:mt-6">
				<caption className="sr-only">Cuisine</caption>
				<thead className="sr-only text-left text-sm text-gray-500 sm:not-sr-only">
					<tr>
						<th scope="col" className="py-3 pr-8 font-normal sm:w-2/5 lg:w-1/3">
							Cuisine
						</th>
						<th
							scope="col"
							className="hidden py-3 pr-8 font-normal sm:table-cell"
						>
							Price
						</th>
						<th
							scope="col"
							className="hidden py-3 pr-8 font-normal sm:table-cell"
						>
							Total price
						</th>

						<th scope="col" className="w-0 py-3 text-right font-normal" />
					</tr>
				</thead>

				<tbody className="divide-y divide-gray-200 border-b border-gray-200 text-sm sm:border-t">
					{itemsInCart.map(item => (
						<tr key={item.id}>
							<td className="py-6 pr-8">
								<div className="flex items-center">
									<img
										src={item.image}
										alt={item.name}
										className="mr-6 h-16 w-16 rounded object-cover object-center"
									/>
									<div>
										<div className="font-medium text-gray-900">
											<Anchor
												component={Link}
												to={`/items/${item.slug}`}
												size="sm"
											>
												{item.name}
											</Anchor>{' '}
											(x{item.quantity})
										</div>
									</div>
								</div>
							</td>

							<td className="hidden py-6 pr-8 sm:table-cell">${item.price}</td>
							<td className="hidden py-6 pr-8 font-semibold sm:table-cell">
								${(item.price * item.quantity).toFixed(2)}
							</td>
							<td className="whitespace-nowrap py-6 text-right font-medium">
								<ActionIcon onClick={() => removeItemFromCart(item.id)}>
									<TrashIcon className="h-5 w-5 text-red-400" />
								</ActionIcon>
							</td>
						</tr>
					))}

					<tr>
						<td className="py-6 pr-8">
							<div className="flex items-center">
								<div>
									<div className="font-medium text-gray-900" />
									<div className="mt-1 sm:hidden" />
								</div>
							</div>
						</td>

						<td className="hidden py-6 pr-8 sm:table-cell" />
						<td className="hidden py-6 pr-8 font-semibold sm:table-cell">
							${totalPrice.toFixed(2)}
						</td>
					</tr>
				</tbody>
			</table>
		</>
	)
}

function EmptyState() {
	return (
		<div className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
			<ShoppingCartIcon className="mx-auto h-9 w-9 text-gray-500" />
			<span className="mt-4 block text-sm font-medium text-gray-500">
				Your cart is empty
			</span>
		</div>
	)
}
