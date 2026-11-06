/* American Pizza & Grill — menu, builder and hours data.
   Source: the restaurant's menu posted on Instagram (@apgsaipan, Sept 5, 2025)
   and the "Temporary Business Hours" post (Oct 4, 2026). Prices in USD.
   Menu photos marked `real` were taken at the restaurant; the others are free-license
   Unsplash sample photos to swap for the restaurant's own. `focus`, `depth` and `fx`
   tune the 3D view (js/dish3d.js): focal point, depth mix [sharpness, center, height]
   and atmosphere. */

window.APG = {
  phone: { main: '+16702331180', mainLabel: '(670) 233-1180', alt: '+16709892355', altLabel: '(670) 989-2355' },
  email: 'apgsaipan670@gmail.com',
  address: '4081 Beach Road, Garapan, Saipan, MP 96950',

  /* Minutes after midnight, Saipan time (ChST, UTC+10). 0 = Sunday. */
  hours: {
    0: [690, 1260], 1: [1020, 1200], 2: [1020, 1200], 3: [1020, 1200],
    4: [1020, 1200], 5: [1020, 1260], 6: [690, 1260]
  },
  hoursRows: [
    { days: [1, 2, 3, 4], label: 'Mon – Thu', time: '5:00 – 8:00 PM' },
    { days: [5], label: 'Friday', time: '5:00 – 9:00 PM' },
    { days: [6, 0], label: 'Sat – Sun', time: '11:30 AM – 9:00 PM' }
  ],

  menu: [
    {
      id: 'pizzas', label: 'Pizzas', title: 'Signature Pizzas',
      kicker: 'Red sauce or white. Ten inches or fourteen. Built by hand on the line.',
      feature: { img: 'img/menu-pizza.jpg', alt: 'A Margherita pizza with fresh mozzarella and basil', caption: 'Margherita', tag: 'from $14', focus: [.47, .55], depth: [.5, .3, .2], fx: 'steam' },
      groups: [
        {
          name: 'Red sauce', cols: ['10"', '14"'], items: [
            { n: 'Margherita', d: 'Marinara, fresh mozzarella, Parmesan & fresh basil', p: [14, 26] },
            { n: 'BBQ Chicken', d: 'BBQ sauce, shredded mozzarella, chicken, red onions & parsley', p: [16, 30] },
            { n: 'Spicy Beef & Mushroom', d: 'Marinara, shredded mozzarella, spicy beef & mushrooms', p: [16, 30] },
            { n: 'Italian Sausage & Goat Cheese', d: 'Marinara, goat cheese, Italian sausage, caramelized onions & arugula', p: [18, 34] },
            { n: 'Meat Lovers', d: 'Marinara, shredded mozzarella, ham, bacon, Italian sausage, pepperoni & spicy beef', p: [20, 38], star: true },
            { n: 'American Combo', d: 'Marinara, shredded mozzarella, pepperoni, sausage, mushrooms, red onions, bell peppers & olives', p: [20, 38] }
          ]
        },
        {
          name: 'White sauce', cols: ['10"', '14"'], items: [
            { n: 'Roasted Garlic', d: 'Garlic butter sauce, shredded mozzarella, caramelized onions & parsley', p: [14, 26] },
            { n: 'Goat Cheese, Arugula & Honey', d: 'White sauce, goat cheese, honey & arugula', p: [16, 30] },
            { n: '4 Cheeses', d: 'White sauce, shredded mozzarella, cheddar, Parmesan & fresh mozzarella', p: [18, 34] },
            { n: 'Truffle Mushroom', d: 'White sauce, fresh mozzarella, caramelized onions, mushrooms, parsley, truffle oil & honey balsamic', p: [18, 34] },
            { n: 'Italian Sausage & Hot Honey', d: 'White sauce, goat cheese, Italian sausage, caramelized onions & hot honey', p: [18, 34] },
            { n: 'Truffle Steak', d: 'Garlic butter sauce, sliced steak, mushrooms, fresh mozzarella, parsley, truffle oil & honey balsamic', p: [20, 38], star: true }
          ]
        }
      ],
      cta: { href: '#build', label: 'Or build your own from $10' }
    },
    {
      id: 'burgers', label: 'Burgers', title: 'Signature Burgers',
      kicker: 'Certified Angus beef on a brioche bun baked in house. Every burger comes with fries.',
      feature: { img: 'img/burger.jpg', alt: 'Truffle Mushroom Burger with onion rings, Swiss cheese and fries', caption: 'Truffle Mushroom Burger', tag: 'from $14', real: true, focus: [.5, .5], fx: 'steam' },
      groups: [
        {
          name: 'Burgers', cols: ['Single', 'Double'], items: [
            { n: 'Cheeseburger', d: 'Cheddar, caramelized onions, lettuce, pickles & tomato', p: [14, 18], star: true },
            { n: 'Bacon Cheeseburger', d: 'Cheddar, bacon, caramelized onions, lettuce, pickles & tomato', p: [16, 20] },
            { n: 'Southwest Burger', d: 'Pepper jack, caramelized onions, grilled peppers & jalapeños', p: [16, 20] },
            { n: 'BBQ Bacon Burger', d: 'Swiss, bacon & fried onions', p: [16, 20] },
            { n: 'Truffle Mushroom Burger', d: 'Swiss, mushrooms, fried onions, truffle oil & honey balsamic vinaigrette', p: [16, 20] },
            { n: 'California Club Burger', d: 'Cheddar, bacon, avocado, lettuce, pickles & tomato', p: [16, 20] },
            { n: 'Grilled Pineapple BBQ Burger', d: 'Swiss, crispy bacon & grilled pineapple', p: [16, 20] },
            { n: 'Truffle Steak Burger', d: 'Sliced steak, Swiss, caramelized onions, fried onions, truffle oil & balsamic vinaigrette', p: [24, null] }
          ]
        }
      ]
    },
    {
      id: 'wings', label: 'Wings', title: 'Signature Wings',
      kicker: 'Hot and crispy, four ways. The extra spicy gets a kick of Tinian hot pepper.',
      feature: { img: 'img/menu-wings.jpg', alt: 'Glazed chicken wings with sesame seeds and scallions', caption: 'Honey Gochujang Wings', tag: '$10', focus: [.55, .5], depth: [.3, .45, .25], fx: 'steam' },
      groups: [
        {
          name: 'Wings', items: [
            { n: 'Honey Gochujang', d: 'Hot & crispy wings with honey gochujang', p: 10, star: true },
            { n: 'Garlic Parmesan', d: 'Hot & crispy wings with garlic Parmesan', p: 10 },
            { n: 'Buffalo', d: 'Hot & crispy wings with a spicy, tangy buffalo sauce', p: 10 },
            { n: 'Extra Spicy Buffalo', d: 'Buffalo sauce & Tinian hot pepper', p: 10 }
          ]
        }
      ]
    },
    {
      id: 'chicken', label: 'Fried Chicken', title: 'Fried Chicken',
      kicker: 'Marinated with herbs & spices, breaded, and fried fresh to order, with your choice of sides.',
      feature: { img: 'img/chicken.jpg', alt: 'Fried chicken with a baked potato and soup', caption: 'Fried fresh to order', tag: 'from $12', real: true, focus: [.5, .5], fx: 'steam' },
      groups: [
        {
          name: 'Assorted pieces', items: [
            { n: '2 Pieces', d: 'With 2 signature sides', p: 12 },
            { n: '3 Pieces', d: 'With 2 signature sides', p: 15 },
            { n: '5 Pieces', d: 'With 3 signature sides', p: 20 },
            { n: '12 Pieces', d: 'With 6 signature sides. Feeds the table', p: 40, star: true }
          ]
        }
      ],
      sides: true
    },
    {
      id: 'steaks', label: 'Steaks & Ribs', title: 'Steaks & Ribs',
      kicker: 'Big cuts, served with signature sides. The porterhouse is built for two.',
      feature: { img: 'img/plate.jpg', alt: 'Steak plate with salad, baked potato and sides', caption: 'From the grill', tag: 'from $45', real: true, focus: [.45, .45], depth: [.35, .45, .2], fx: 'grill' },
      groups: [
        {
          name: 'From the grill', items: [
            { n: '14 oz NY Steak', d: 'With 2 signature sides', p: 45 },
            { n: '16 oz Rib-Eye Steak', d: 'With 2 signature sides', p: 60 },
            { n: '32 oz Porterhouse Steak', d: 'With 4 signature sides. Good for 2 people', p: 85, star: true },
            { n: 'Half-Rack BBQ Ribs', d: 'With 2 signature sides', p: 45 }
          ]
        }
      ],
      sides: true
    },
    {
      id: 'pastas', label: 'Pastas', title: 'Signature Pastas',
      kicker: 'Fresh spaghetti and fettuccine, tossed in the pan to order.',
      feature: { img: 'img/menu-pasta.jpg', alt: 'Spaghetti with shrimp and cherry tomatoes in a pan', caption: 'Spicy Shrimp Spaghetti', tag: 'from $14', focus: [.47, .5], depth: [.25, .6, .15], fx: 'steam' },
      groups: [
        {
          name: 'Pasta', items: [
            { n: 'Marinara Spaghetti', d: 'Fresh spaghetti with marinara', a: 'Add meatballs +$4', p: 14 },
            { n: 'Pesto Parmesan Cream Pasta', d: 'Fresh spaghetti with pesto & Parmesan', a: 'Add shrimp +$6', p: 14, star: true },
            { n: 'Bacon Fettuccine Alfredo', d: 'Fresh fettuccine with Alfredo, bacon & Parmesan', a: 'Add grilled chicken +$4', p: 14 },
            { n: 'Beef Tomato Cream Pasta', d: 'Fresh pasta with tomato cream & ground beef', p: 18 },
            { n: 'Truffle Mushroom Pasta', d: 'Fresh fettuccine with garlic butter, truffle oil & mushrooms', p: 18 },
            { n: 'Spicy Shrimp Spaghetti', d: 'Fresh spaghetti with spicy marinara & shrimp', p: 20 },
            { n: 'Garlic Butter Pasta with Clams', d: 'Fresh fettuccine with garlic butter, white wine & clams', p: 20 },
            { n: 'Seafood Marinara Spaghetti', d: 'Fresh pasta with marinara, calamari, shrimp & clams', p: 20 }
          ]
        }
      ]
    },
    {
      id: 'starters', label: 'Starters', title: 'Starters',
      kicker: 'For the table, before the pizza lands.',
      feature: { img: 'img/nachos.jpg', alt: 'Tortilla chips around a skillet of hot dip', caption: 'Chips & dip for the table', tag: 'from $8', real: true, focus: [.5, .55], depth: [.4, .4, .2], fx: 'steam' },
      groups: [
        {
          name: 'To share', items: [
            { n: 'French Fries', p: 8 },
            { n: 'Onion Rings', d: 'With BBQ sauce', p: 8 },
            { n: 'Guacamole & Chips', p: 12 },
            { n: 'Spinach Dip & Chips', p: 12, star: true },
            { n: 'Popcorn Chicken', d: 'With ranch', p: 12 },
            { n: 'Fried Calamari', d: 'With marinara', p: 12 },
            { n: 'Mozzarella Sticks', d: 'With marinara', p: 12 },
            { n: 'Loaded Nachos', p: 14 },
            { n: 'Truffle Steak Fries', p: 16 }
          ]
        }
      ]
    },
    {
      id: 'salads', label: 'Soups & Salads', title: 'Soups & Salads',
      kicker: 'Big bowls, house dressings, and soups served with garlic focaccia.',
      feature: { img: 'img/menu-salad.jpg', alt: 'Caesar salad with croutons, shaved Parmesan and Caesar dressing', caption: 'Caesar Salad', tag: 'from $8', focus: [.45, .55], depth: [.55, .3, .15], fx: 'fresh' },
      groups: [
        {
          name: 'Salads', items: [
            { n: 'Green Salad', d: 'Lettuce, spinach, tomato, bell peppers, onions, olives, Parmesan & croutons, balsamic vinaigrette', a: 'Add avocado or grilled chicken +$4', p: 10 },
            { n: 'Italian Chopped Salad', d: 'Lettuce, tomato, bell peppers, cucumbers, red onion, Parmesan, olives & croutons, creamy Italian', a: 'Add avocado or grilled chicken +$4', p: 12 },
            { n: 'Caesar Salad', d: 'Lettuce, Parmesan, garlic chips, fried onions & croutons, Caesar dressing', a: 'Add grilled chicken +$4', p: 12 },
            { n: 'Cobb Salad', d: 'Lettuce, avocado, boiled egg, tomato, bell peppers, olives & croutons, ranch', a: 'Add bacon +$2', p: 12 },
            { n: 'Arugula Goat Cheese Salad', d: 'Arugula, goat cheese, cranberries & candied walnuts, honey balsamic vinaigrette', a: 'Add steak +$8', p: 14, star: true },
            { n: 'Bacon Spinach Salad', d: 'Spinach, bacon, Parmesan, goat cheese & croutons, bacon oil & honey balsamic vinaigrette', p: 14 }
          ]
        },
        {
          name: 'Soups', items: [
            { n: 'Mushroom Soup', d: 'With garlic focaccia bread', p: 8 },
            { n: 'Tomato Bisque', d: 'With garlic focaccia bread', p: 8 }
          ]
        }
      ]
    },
    {
      id: 'desserts', label: 'Desserts', title: 'Desserts',
      kicker: 'Save room. Or don’t, and order the brownie anyway.',
      feature: { img: 'img/menu-dessert.jpg', alt: 'A chocolate brownie with two scoops of vanilla ice cream and sauce', caption: 'Caramel Brownie', tag: 'from $5', focus: [.52, .45], depth: [.55, .3, .15], fx: 'cocoa' },
      groups: [
        {
          name: 'Sweet', items: [
            { n: 'Ice Cream, 2 Scoops', d: 'Chocolate, strawberry or vanilla', p: 5 },
            { n: 'Pie with Vanilla Ice Cream', d: 'Apple, pumpkin or taro coconut pie with caramel sauce', p: 8 },
            { n: 'Oreo Sundae, 2 Scoops', d: 'Vanilla ice cream, Oreo cookies, chocolate & caramel sauce, whipped cream', p: 8 },
            { n: 'Caramel Brownie', d: 'Ghirardelli chocolate brownie with vanilla ice cream & caramel sauce', p: 8, star: true }
          ]
        }
      ]
    },
    {
      id: 'cocktails', label: 'Cocktails', title: 'Cocktails',
      kicker: 'A cocktail menu made in collaboration with Cha Cafe. Start with the espresso martini.',
      feature: { img: 'img/menu-martini.jpg', alt: 'An espresso martini with coffee beans on a dark wooden bar', caption: 'Espresso Martini', tag: 'from $5', focus: [.5, .45], depth: [.5, .3, .2], fx: 'cocoa' },
      wide: true,
      groups: [
        {
          name: 'Classics', items: [
            { n: 'Espresso Martini', p: 8, star: true }, { n: 'Moscow Mule', p: 8 }, { n: 'Rum & Coke', p: 6 },
            { n: 'Vodka Soda', p: 7.5 }, { n: 'Cape Cod', p: 7.5 }, { n: 'Screwdriver', p: 7.5 },
            { n: 'Whiskey Sour', p: 9 }, { n: 'Daiquiri', p: 7 }, { n: 'Tequila Sunrise', p: 6 },
            { n: 'Long Island Iced Tea', p: 10 }, { n: 'Scotch Soda', p: 9 }, { n: 'Midori Sour', p: 8 },
            { n: 'Piña Colada', p: 8 }, { n: 'Gin & Tonic', p: 8 }
          ]
        },
        {
          name: 'Fruit', items: [
            { n: 'Mint Mojito', d: 'Mango, strawberry, pineapple, peach, lychee or passion fruit', p: 8 },
            { n: 'Margarita on the Rocks', d: 'Mango, strawberry, pineapple, peach, lychee or passion fruit', p: 9 }
          ]
        },
        {
          name: 'Spirits', items: [
            { n: 'Whiskey', d: 'Jameson, Jack Daniel’s, Johnnie Walker Black', p: 7 },
            { n: 'Tequila', d: 'Patrón Silver', p: 7 },
            { n: 'Gin', d: 'Bombay', p: 7 },
            { n: 'Vodka', d: 'Grey Goose', p: 7 },
            { n: 'Rum', d: 'Bacardi, Captain Morgan gold or silver', p: 5 }
          ]
        }
      ]
    },
    {
      id: 'drinks', label: 'Drinks', title: 'Beer, Wine & More',
      kicker: 'Cold beer, house wine, milkshakes and coffee.',
      feature: { img: 'img/cocktail.jpg', alt: 'A pink fruit drink in a mason jar with mint', caption: 'Something cold', tag: 'from $3', real: true, focus: [.5, .55], depth: [.5, .35, .15], fx: 'fizz' },
      wide: true,
      groups: [
        {
          name: 'Beer', items: [
            { n: 'Asahi Draft', p: 8 }, { n: 'Budweiser', p: 5 }, { n: 'Bud Light', p: 5 }, { n: 'Heineken', p: 6 },
            { n: 'Corona Light', p: 6 }, { n: 'Big Wave', p: 6 }, { n: 'Stella Artois', p: 6 }, { n: 'Guinness', p: 6 }
          ]
        },
        {
          name: 'Wine', cols: ['Glass', 'Bottle'], items: [
            { n: 'House Red or White', p: [6, 24] },
            { n: 'Premium House Red or White', p: [10, 40] }
          ]
        },
        {
          name: 'Shakes, coffee & soft drinks', items: [
            { n: 'Milkshake', d: 'Vanilla, chocolate or strawberry', p: 8, star: true },
            { n: 'Caramel Macchiato', p: 6 }, { n: 'Latte', p: 5.5 }, { n: 'Americano', p: 5 },
            { n: 'Southern Iced Tea', p: 3 }, { n: 'Black or Green Tea', p: 3 },
            { n: 'Juice', d: 'Orange, apple or fruit punch', p: 5 },
            { n: 'Soft Drinks', d: 'Coke, Diet Coke, Sprite, Ginger Ale, Dr Pepper, Orange Fanta', p: 3 }
          ]
        }
      ]
    }
  ],

  sides: ['Green Salad', 'French Fries', 'Onion Rings', 'Coleslaw', 'Baked Potato with Bacon & Cheese',
    'Garlic Mashed Potato with Gravy', 'Truffle Mac & Cheese', 'Buttered Corn Cob', 'Buttered Mixed Vegetables',
    'Rice with Finadene', 'Honey Cornbread', 'Soup of Your Choice'],

  /* Build Your Own Pizza: 10" mozzarella pizza from $10, 14" +$10, toppings x2 on 14". */
  build: {
    sizes: { 10: { base: 10, mult: 1, scale: 0.8, slices: 6 }, 14: { base: 20, mult: 2, scale: 1, slices: 8 } },
    sauces: [
      { id: 'tomato', name: 'Tomato', color: '#b23220' },
      { id: 'alfredo', name: 'Alfredo', color: '#efe2c2' },
      { id: 'garlic', name: 'Garlic Butter', color: '#e3c26a' }
    ],
    truffle: 2,
    tiers: [
      { id: 'garden', name: 'Garden', price: 1, color: '#7fa35a' },
      { id: 'classic', name: 'Classic', price: 2, color: '#d2601f' },
      { id: 'premium', name: 'Premium', price: 4, color: '#b23a4e' },
      { id: 'prime', name: 'Rib-Eye', price: 6, color: '#d6a442' }
    ],
    toppings: [
      { id: 'jalapeno', name: 'Jalapeño', tier: 'garden' },
      { id: 'onion', name: 'Onion', tier: 'garden' },
      { id: 'olive', name: 'Olives', tier: 'garden' },
      { id: 'tomato', name: 'Tomato', tier: 'garden' },
      { id: 'spinach', name: 'Spinach', tier: 'garden' },
      { id: 'pepper', name: 'Bell Pepper', tier: 'garden' },
      { id: 'arugula', name: 'Arugula', tier: 'garden' },
      { id: 'pineapple', name: 'Pineapple', tier: 'classic' },
      { id: 'pepperoni', name: 'Pepperoni', tier: 'classic' },
      { id: 'bacon', name: 'Bacon', tier: 'classic' },
      { id: 'sausage', name: 'Italian Sausage', tier: 'classic' },
      { id: 'mushroom', name: 'Portobello Mushroom', tier: 'classic' },
      { id: 'chicken', name: 'Chicken', tier: 'classic' },
      { id: 'beef', name: 'Spicy Beef', tier: 'classic' },
      { id: 'xmozz', name: 'Extra Mozzarella', tier: 'classic' },
      { id: 'ham', name: 'Honey Ham', tier: 'premium' },
      { id: 'feta', name: 'Feta Cheese', tier: 'premium' },
      { id: 'fmozz', name: 'Fresh Mozzarella', tier: 'premium' },
      { id: 'goat', name: 'Goat Cheese', tier: 'premium' },
      { id: 'steak', name: 'Rib-Eye Steak', tier: 'prime' }
    ],
    preset: { size: 10, sauce: 'tomato', toppings: ['pepperoni', 'mushroom', 'olive'] }
  }
};
