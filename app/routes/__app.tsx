import {
	ArrowLeftOnRectangleIcon,
	ArrowRightOnRectangleIcon,
	MagnifyingGlassIcon,
	UserPlusIcon,
} from '@heroicons/react/24/solid'

import {ShoppingBagIcon, ShoppingCartIcon} from '@heroicons/react/24/outline'

import {
	ActionIcon,
	Anchor,
	Avatar,
	Button,
	Divider,
	Footer,
	Group,
	Indicator,
	Menu,
	ScrollArea,
	Text,
} from '@mantine/core'
import type {SpotlightAction} from '@mantine/spotlight'
import {SpotlightProvider, useSpotlight} from '@mantine/spotlight'
import type {LoaderArgs, SerializeFrom} from '@remix-run/node'
import {redirect} from '@remix-run/node'
import {json} from '@remix-run/node'
import type {ShouldReloadFunction} from '@remix-run/react'
import {
	Form,
	Link,
	Outlet,
	useLoaderData,
	useLocation,
	useNavigate,
} from '@remix-run/react'
import appConfig from 'appConfig'
import * as React from 'react'
import {TailwindContainer} from '~/components/TailwindContainer'
import {useCart} from '~/context/CartContext'
import {getAllRestaurants} from '~/lib/restaurant.server'
import {useOptionalUser} from '~/utils/hooks'
import {isStaff} from '~/session.server'

export type AppLoaderData = SerializeFrom<typeof loader>
export const loader = async ({request}: LoaderArgs) => {
	if (await isStaff(request)) {
		return redirect('/staff')
	}

	const restaurants = await getAllRestaurants()
	const items = restaurants.reduce((acc, restaurant) => {
		restaurant.items.forEach(item => acc.push(item))
		return acc
	}, [] as typeof restaurants[number]['items'])

	return json({restaurants, items})
}

export default function AppLayout() {
	const navigate = useNavigate()
	const {restaurants, items} = useLoaderData<typeof loader>()

	const [actions] = React.useState<SpotlightAction[]>(() => {
		const actions = [] as SpotlightAction[]

		restaurants.forEach(restaurant => {
			actions.push({
				title: restaurant.name,
				icon: <Avatar src={restaurant.image} radius="xl" size="sm" />,
				onTrigger: () => navigate(`/restaurants/${restaurant.slug}`),
			})
		})

		items.forEach(item => {
			actions.push({
				title: item.name,
				icon: <Avatar src={item.image} radius="xl" size="sm" />,
				onTrigger: () => navigate(`/items/${item.slug}`),
			})
		})

		return actions
	})

	return (
		<>
			<SpotlightProvider
				shortcut={['mod + K', '/']}
				highlightQuery
				searchPlaceholder="Search for restaurants or menu..."
				searchIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
				limit={5}
				actionsWrapperComponent={ActionsWrapper}
				nothingFoundMessage={<Text>Nothing found</Text>}
				actions={actions}
			>
				<div className="flex h-full flex-col">
					<HeaderComponent />
					<ScrollArea classNames={{root: 'flex-1 bg-gray-100'}}>
						<Content />
					</ScrollArea>

					<FooterComponent />
				</div>
			</SpotlightProvider>
		</>
	)
}

function HeaderComponent() {
	const spotlight = useSpotlight()
	const location = useLocation()
	const {user} = useOptionalUser()
	const {itemsInCart} = useCart()

	return (
		<>
			<Form replace action="/api/auth/logout" method="post" id="logout-form" />
			<header className="max-h-28 bg-gray-900 py-8">
				<TailwindContainer>
					<div className="flex h-full w-full items-center justify-between">
						<div className="flex flex-shrink-0 items-center gap-4">
							<Anchor component={Link} to="/">
								<img
									className="h-20 object-cover object-center"
									src={appConfig.logo}
									alt="Logo"
								/>
							</Anchor>
						</div>

						<div className="flex items-center gap-4">
							{/* Searchbar */}
							<ActionIcon
								title="Search"
								size="lg"
								onClick={() => spotlight.openSpotlight()}
							>
								<MagnifyingGlassIcon className="h-5 w-5 text-white hover:text-gray-700" />
							</ActionIcon>

							<Indicator
								label={itemsInCart.length}
								inline
								size={16}
								disabled={itemsInCart.length <= 0}
								color="gray"
								offset={7}
							>
								<Button
									px={8}
									component={Link}
									variant="subtle"
									to="/cart"
									title="Cart"
									color="gray"
								>
									<ShoppingCartIcon className="h-5 w-5 text-white hover:text-gray-700" />
								</Button>
							</Indicator>

							<Menu
								position="bottom-start"
								withArrow
								transition="pop-top-right"
							>
								<Menu.Target>
									<button>
										{user ? (
											<Avatar color="blue" size="md">
												{user.firstName.charAt(0)}
												{user.lastName.charAt(0)}
											</Avatar>
										) : (
											<Avatar />
										)}
									</button>
								</Menu.Target>

								<Menu.Dropdown>
									{user ? (
										<>
											<Menu.Item disabled>
												<div className="flex flex-col">
													<p>
														{user.firstName} {user.lastName}{' '}
													</p>
													<p className="mt-0.5 text-sm">{user.email}</p>
												</div>
											</Menu.Item>
											<Divider />

											<Menu.Item
												icon={
													<ShoppingBagIcon className="w- h-4 text-white hover:text-gray-700" />
												}
												component={Link}
												to="/order-history"
											>
												Your orders
											</Menu.Item>
											<Menu.Item
												icon={
													<ArrowLeftOnRectangleIcon className="h-4 w-4 text-white hover:text-gray-700" />
												}
												type="submit"
												form="logout-form"
											>
												Logout
											</Menu.Item>
										</>
									) : (
										<>
											<Menu.Item
												icon={
													<ArrowRightOnRectangleIcon className="h-4 w-4 text-white" />
												}
												component={Link}
												to={`/login?redirectTo=${encodeURIComponent(
													location.pathname
												)}`}
											>
												Login
											</Menu.Item>
											<Menu.Item
												icon={<UserPlusIcon className="h-4 w-4 text-white" />}
												component={Link}
												to={`/register?redirectTo=${encodeURIComponent(
													location.pathname
												)}`}
											>
												Create account
											</Menu.Item>
										</>
									)}
								</Menu.Dropdown>
							</Menu>
						</div>
					</div>
				</TailwindContainer>
			</header>
		</>
	)
}

function Content() {
	return (
		<main>
			<Outlet />
		</main>
	)
}

function FooterComponent() {
	return (
		<Footer
			height={44}
			p="md"
			className="flex items-center justify-center py-1 text-center text-sm"
		>
			<span className="text-gray-400">
				©{new Date().getFullYear()} {appConfig.name}, Inc. All rights reserved.
			</span>
		</Footer>
	)
}

function ActionsWrapper({children}: {children: React.ReactNode}) {
	return (
		<div>
			{children}
			<Group
				position="right"
				px={15}
				py="xs"
				className="border-t border-gray-300"
			>
				<Text size="xs" color="dimmed">
					Search powered by FoodCircles
				</Text>
			</Group>
		</div>
	)
}

export const unstable_shouldReload: ShouldReloadFunction = ({
	submission,
	prevUrl,
	url,
}) => {
	if (!submission && prevUrl.pathname === url.pathname) {
		return false
	}

	return true
}
