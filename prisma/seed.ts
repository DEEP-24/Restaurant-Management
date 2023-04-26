import {faker} from '@faker-js/faker'
import {PrismaClient, Role} from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import slugify from 'slugify'
import {createPasswordHash} from '~/utils/misc'
import {restaurantSeedData} from './data'

const db = new PrismaClient()

async function seed() {
	await db.item.deleteMany()
	await db.restaurant.deleteMany()
	await db.user.deleteMany()

	await db.user.upsert({
		where: {
			email: 'demo@gmail.com',
		},
		update: {},
		create: {
			firstName: faker.name.firstName(),
			lastName: faker.name.lastName(),
			email: 'demo@gmail.com',
			passwordHash: await bcrypt.hash('demoaccount', 12),
		},
	})

	await db.user.create({
		data: {
			firstName: faker.name.firstName(),
			lastName: faker.name.lastName(),
			email: 'staff@gmail.com',
			passwordHash: await createPasswordHash('staffaccount'),
			role: Role.STAFF,
		},
	})

	for (const restaurant of restaurantSeedData) {
		await db.restaurant.create({
			data: {
				...restaurant,
				slug: slugify(restaurant.name, {lower: true, strict: true}),
				items: {
					createMany: {
						data: restaurant.items.map(item => ({
							...item,
							quantity: 100,
							slug: slugify(item.name, {lower: true, strict: true}),
						})),
					},
				},
			},
		})
	}

	console.log(`Database has been seeded. 🌱`)
}

seed()
	.catch(e => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await db.$disconnect()
	})
