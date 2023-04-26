import { Anchor } from '@mantine/core'
import { Link } from '@remix-run/react'
import { TailwindContainer } from '~/components/TailwindContainer'
import { useAppData } from '~/utils/hooks'

export default function Restaurants() {
  const { restaurants } = useAppData()

  return (
    <div className='flex flex-col gap-4 p-4'>
      <div className='bg-white'>
        <TailwindContainer>
          <div className='py-16 px-4 sm:py-20 sm:px-6 lg:px-8'>
            <h2 className='text-2xl font-extrabold tracking-tight text-gray-900'>
              Restaurants
            </h2>

            <div className='mt-6 grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8'>
              {restaurants.map((restaurant) => {
                return (
                  <div key={restaurant.id} className='mx-auto sm:mx-[unset]'>
                    <div className='aspect-square h-48 overflow-hidden rounded-md bg-gray-200 shadow lg:h-64'>
                      <img
                        src={restaurant.image}
                        alt={restaurant.name}
                        className='h-full w-full object-cover object-center'
                      />
                    </div>

                    <h3 className='mt-4 text-sm text-gray-700'>
                      <Anchor
                        to={restaurant.slug}
                        prefetch='intent'
                        component={Link}
                      >
                        {restaurant.name}
                      </Anchor>
                    </h3>
                  </div>
                )
              })}
            </div>
          </div>
        </TailwindContainer>
      </div>
    </div>
  )
}
