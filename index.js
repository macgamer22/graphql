const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

// Sample data
let restaurants = [
  {
    id: 1,
    name: "WoodsHill",
    description: "American cuisine, farm to table, with fresh produce every day",
    dishes: [
      { name: "Swordfish grill", price: 27 },
      { name: "Roasted Broccoli", price: 11 }
    ]
  },
  {
    id: 2,
    name: "Fiorellas",
    description: "Italian-American home cooked food with fresh pasta and sauces",
    dishes: [
      { name: "Flatbread", price: 14 },
      { name: "Carbonara", price: 18 },
      { name: "Spaghetti", price: 19 }
    ]
  },
  {
    id: 3,
    name: "Karma",
    description: "Malaysian-Chinese-Japanese fusion, with great bar and bartenders",
    dishes: [
      { name: "Dragon Roll", price: 12 },
      { name: "Pancake roll", price: 11 },
      { name: "Cod cakes", price: 13 }
    ]
  }
];

// Construct a schema, using GraphQL schema language
const schema = buildSchema(`
  type Query {
    restaurant(id: Int!): Restaurant
    restaurants: [Restaurant]
  }
  type Restaurant {
    id: Int
    name: String
    description: String
    dishes: [Dish]
  }
  type Dish {
    name: String
    price: Int
  }
  input RestaurantInput {
    name: String
    description: String
  }
  type DeleteResponse {
    ok: Boolean!
  }
  type Mutation {
    setRestaurant(input: RestaurantInput): Restaurant
    deleteRestaurant(id: Int!): DeleteResponse
    editRestaurant(id: Int!, name: String, description: String): Restaurant
  }
`);

// The root provides a resolver function for each API endpoint
const root = {
  restaurant: ({ id }) => restaurants.find(restaurant => restaurant.id === id),
  restaurants: () => restaurants,
  setRestaurant: ({ input }) => {
    const id = restaurants.length + 1;
    const newRestaurant = { id, ...input, dishes: [] };
    restaurants.push(newRestaurant);
    return newRestaurant;
  },
  deleteRestaurant: ({ id }) => {
    const ok = restaurants.some(restaurant => restaurant.id === id);
    restaurants = restaurants.filter(restaurant => restaurant.id !== id);
    return { ok };
  },
  editRestaurant: ({ id, name, description }) => {
    const restaurant = restaurants.find(restaurant => restaurant.id === id);
    if (!restaurant) {
      throw new Error("Restaurant doesn't exist");
    }
    if (name !== undefined) restaurant.name = name;
    if (description !== undefined) restaurant.description = description;
    return restaurant;
  }
};

const app = express();
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true
  })
);

const port = 5500;
app.listen(port, () => console.log(`Running GraphQL on Port: ${port}`));