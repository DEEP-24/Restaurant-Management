import {Anchor} from '@mantine/core'
import {Link} from '@remix-run/react'
import appConfig from 'appConfig'
import {TailwindContainer} from '~/components/TailwindContainer'
import {useAppData} from '~/utils/hooks'

export default function Dashboard() {
	return (
		<div className="flex flex-col gap-4 p-4">
			<RestaurantList />
			<ItemList />
		</div>
	)
}

function RestaurantList() {
	const {restaurants} = useAppData()

	return (
		<div className="bg-white">
			<TailwindContainer>
				<div className="py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
					<div className="md:flex md:items-center md:justify-between">
						<h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
							Restaurants
						</h2>
						<Anchor
							component={Link}
							to="restaurants"
							prefetch="intent"
							className="hidden md:block"
						>
							Browse all restaurants<span aria-hidden="true"> &rarr;</span>
						</Anchor>
					</div>

					<div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 sm:gap-x-6 md:grid-cols-3 md:gap-y-0 lg:grid-cols-4 lg:gap-x-8">
						{restaurants.map((restaurant, index) => {
							if (index >= appConfig.cardsLimit) {
								return null
							}

							return (
								<div
									key={restaurant.id}
									className="group relative mx-auto sm:mx-[unset]"
								>
									<div className="overflow-hidden rounded-md bg-gray-200 shadow group-hover:opacity-75">
										<Link
											to={`/restaurants/${restaurant.slug}`}
											prefetch="intent"
											className="overflow-hidden rounded-lg bg-gray-200 group-hover:opacity-75"
										>
											<img
												src={restaurant.image}
												alt={restaurant.name}
												className="aspect-square w-full object-cover object-center"
											/>
										</Link>
									</div>

									<h3 className="mt-4 text-sm text-gray-700">
										<Anchor
											to={`/restaurants/${restaurant.slug}`}
											prefetch="intent"
											component={Link}
										>
											{restaurant.name}
										</Anchor>
									</h3>
								</div>
							)
						})}
					</div>

					<div className="mt-8 md:hidden">
						<Anchor
							component={Link}
							to="restaurants"
							prefetch="intent"
							size="sm"
						>
							Browse all restaurants<span aria-hidden="true"> &rarr;</span>
						</Anchor>
					</div>
				</div>
			</TailwindContainer>
		</div>
	)
}

function ItemList() {
	const {items} = useAppData()

	return (
		<div className="bg-white">
			<TailwindContainer>
				<div className="py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
					<div className="md:flex md:items-center md:justify-between">
						<h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
							Dishes
						</h2>
						<Anchor
							component={Link}
							to="items"
							prefetch="intent"
							className="hidden md:block"
						>
							Browse all dishes<span aria-hidden="true"> &rarr;</span>
						</Anchor>
					</div>

					<div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 sm:gap-x-6 md:grid-cols-3 md:gap-y-0 lg:grid-cols-4 lg:gap-x-8">
						{items.map((item, index) => {
							if (index >= appConfig.cardsLimit) {
								return null
							}

							return (
								<div
									key={item.id}
									className="group relative mx-auto sm:mx-[unset]"
								>
									<div className="aspect-square overflow-hidden rounded-md bg-gray-200 shadow group-hover:opacity-75">
										<Link
											to={`/items/${item.slug}`}
											prefetch="intent"
											className="overflow-hidden rounded-lg bg-gray-200 group-hover:opacity-75"
										>
											<img
												src={item.image}
												alt={item.name}
												className="w-full object-cover object-center"
											/>
										</Link>
									</div>

									<h3 className="mt-4 text-sm text-gray-700">
										<Anchor
											to={`items/${item.slug}`}
											prefetch="intent"
											component={Link}
										>
											{item.name}
										</Anchor>
									</h3>

									<p className="mt-1 text-sm font-medium text-gray-900">
										${item.price}
									</p>
								</div>
							)
						})}
					</div>

					<div className="mt-8 text-sm md:hidden">
						<Anchor component={Link} to="items" prefetch="intent" size="sm">
							Browse all restaurants<span aria-hidden="true"> &rarr;</span>
						</Anchor>
					</div>
				</div>
			</TailwindContainer>
		</div>
	)
}
