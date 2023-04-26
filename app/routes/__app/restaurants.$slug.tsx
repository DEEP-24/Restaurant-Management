import {Anchor, Button} from '@mantine/core'
import type {LoaderArgs} from '@remix-run/node'
import {json} from '@remix-run/node'
import {Link, useLoaderData} from '@remix-run/react'
import {TailwindContainer} from '~/components/TailwindContainer'
import {useCart} from '~/context/CartContext'
import {useRestaurant} from '~/utils/hooks'

export const loader = async ({params}: LoaderArgs) => {
	const {slug} = params

	if (!slug) {
		throw new Response('No slug provided', {status: 404})
	}

	return json({slug})
}
export default function Restaurant() {
	return (
		<>
			<div className="flex flex-col gap-4 p-4">
				<ItemsGrid />
			</div>
		</>
	)
}

function ItemsGrid() {
	const {slug} = useLoaderData<typeof loader>()
	const restaurant = useRestaurant(slug)
	const {addItemToCart} = useCart()
	// This scenario is unlikely
	// as the slug is checked in the loader
	if (!restaurant) {
		return null
	}

	return (
		<div className="bg-white">
			<TailwindContainer>
				<div className="py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
					<h2 className="mb-6 py-6 text-center text-2xl font-extrabold tracking-tight text-gray-900">
						{restaurant.name}
					</h2>

					<div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 sm:gap-x-6 md:grid-cols-3 md:gap-y-0 lg:grid-cols-4 lg:gap-x-8">
						{restaurant?.items.map(item => (
							<div
								key={item.id}
								className="group relative mx-auto sm:mx-[unset]"
							>
								<div className="overflow-hidden rounded-md bg-gray-200 shadow group-hover:opacity-75">
									<Link
										to={`/items/${item.slug}`}
										prefetch="intent"
										className="overflow-hidden rounded-lg bg-gray-200 group-hover:opacity-75"
									>
										<img
											src={item.image}
											alt={item.name}
											className="aspect-square w-full object-cover object-center"
										/>
									</Link>
								</div>

								<h3 className="mt-4 text-sm text-gray-700">
									<Anchor
										to={`/items/${item.slug}`}
										prefetch="intent"
										component={Link}
									>
										{item.name}
									</Anchor>
								</h3>

								<p className="mt-1 text-sm font-medium text-gray-900">
									${item.price}
								</p>

								<Button
									variant="light"
									fullWidth
									type="submit"
									mt="md"
									onClick={() =>
										addItemToCart({
											...item,
											quantity: 1,
										})
									}
								>
									Add to cart
								</Button>
							</div>
						))}
					</div>
				</div>
			</TailwindContainer>
		</div>
	)
}
