import { faker } from '@faker-js/faker'

export const restaurantSeedData = [
  {
    name: 'Chipotle',
    image:
      'https://www.nicepng.com/png/full/220-2204766_chipotle-logo-transparent-chipotle-mexican-grill-logo.png',
    items: [
      {
        name: 'Pizza',
        description:
          "Pizza is a savory dish of Italian origin, consisting of a usually round, flattened base of leavened wheat-based dough topped with tomatoes, cheese, and often, anchovies or olives, often with various additional toppings baked into a pizza-dough. Pizza is popular in many countries, including the United States, Europe, Africa, and Oceania. The term pizza is derived from the Italian word pizza, which means 'small dish'",
        image:
          'https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&w=800&q=80',
        price: Number(faker.finance.amount(5, 50, 2)),
      },
      {
        name: 'Burger',
        description:
          'A burger is a sandwich consisting of one or more cooked patties of ground meat, usually beef, placed inside a sliced bread roll or bun. It is yummy.',
        image:
          'https://images.unsplash.com/photo-1572448862527-d3c904757de6?auto=format&fit=crop&w=800&q=80',
        price: Number(faker.finance.amount(5, 50, 2)),
      },
    ],
  },
  {
    name: 'McDonalds',
    image:
      "https://media.designrush.com/inspiration_images/134933/conversions/_1511456189_555_McDonald's-preview.jpg",
    items: [
      {
        name: 'Hot Dog',
        description:
          'A hot dog is a sandwich consisting of a cooked sausage, usually beef, placed inside a sliced bread roll or bun.',
        image:
          'https://images.unsplash.com/photo-1653964158593-716a5a01de7c?auto=format&fit=crop&w=800&q=80',
        price: Number(faker.finance.amount(5, 50, 2)),
      },
    ],
  },
  {
    name: 'Pizza Hut',
    image:
      'https://img.restaurantguru.com/w550/h367/re43-Pizza-Hut-Netanya-logo.jpg',
    items: [
      {
        name: 'Salad',
        description:
          'A salad is a dish of food that has been cooked and mixed with various ingredients, such as eggs, cheese, vegetables, oil, and other ingredients.',
        image:
          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
        price: Number(faker.finance.amount(5, 50, 2)),
      },
    ],
  },
  {
    name: 'Subway',
    image:
      'https://images.squarespace-cdn.com/content/v1/545a5bafe4b0e5667b97fbca/1471288871116-UEPFUTVZ3R37LEQA9UY6/image-asset.jpeg?format=400w',
    items: [
      {
        name: 'Fries',
        description:
          'French fries, also called chips, finger chips, fries, or French pommes frites, side dish or snack typically made from deep-fried potatoes that have been cut into various shapes, especially thin strips. Fries are often salted and served with other items, including ketchup, mayonnaise, or vinegar.',
        image:
          'https://images.unsplash.com/photo-1639744091981-2f826321fae6?auto=format&fit=crop&w=800&q=80',
        price: Number(faker.finance.amount(5, 50, 2)),
      },
    ],
  },
]
