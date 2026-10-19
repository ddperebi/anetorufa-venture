import cannedFoodsImg from '../assets/images/canned_packaged_goods_1792414096694.jpg';
import garriYamImg from '../assets/images/garri_and_yam_tubers_1792414111676.jpg';

export interface ProductCategory {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
  image?: string;
  badge?: string;
}

export interface BankingService {
  id: string;
  title: string;
  description: string;
  iconName: 'deposit' | 'withdraw' | 'transfer' | 'airtime' | 'data' | 'bill' | 'balance';
}

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  {
    id: 'rice-grains',
    number: 1,
    title: 'Rice and Grains',
    subtitle: 'Daily Energy & Household Staples',
    description: 'High quality long-grain parboiled rice, fragrant basmati rice, local Nigerian varieties, white rice, maize, sorghum, and wholesome grain cereals for family cooking and bulk needs.',
    highlights: ['Parboiled Rice', 'Basmati Rice', 'White Rice', 'Maize & Sorghum', 'Breakfast Cereals'],
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
    badge: 'High Demand',
  },
  {
    id: 'beans-staples',
    number: 2,
    title: 'Beans and Other Staple Foods',
    subtitle: 'Rich Protein Legumes',
    description: 'Carefully sorted and clean brown beans, honey beans (ewa oloyin), white cowpeas, black-eyed peas, and nourishing legumes selected for easy cooking and delicious taste.',
    highlights: ['Brown Beans', 'Honey Beans (Oloyin)', 'White Beans', 'Cowpeas & Legumes', 'Clean & Sorted'],
    image: 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?auto=format&fit=crop&w=800&q=80',
    badge: 'Fresh Stock',
  },
  {
    id: 'garri-yam-cassava',
    number: 3,
    title: 'Garri, Yam, Cassava Products & Local Staples',
    subtitle: 'Authentic Traditional Nigerian Staples',
    description: 'Finely processed white and yellow garri (Ijebu and Edo varieties), fresh whole yam tubers, dried yam flour (elubo for amala), fufu, and diverse cassava food products.',
    highlights: ['Yellow Garri', 'White Ijebu Garri', 'Whole Yam Tubers', 'Yam Flour (Elubo)', 'Cassava Derivatives'],
    image: garriYamImg,
    badge: 'Popular',
  },
  {
    id: 'cooking-oil-ingredients',
    number: 4,
    title: 'Cooking Oil and Essential Cooking Ingredients',
    subtitle: 'Pure Oils & Flavorful Seasonings',
    description: 'Healthy refined vegetable cooking oils, traditional unadulterated red palm oil, pure groundnut oil, table salt, curry, thyme, bouillon seasoning cubes, and culinary spices.',
    highlights: ['Pure Vegetable Oil', 'Red Palm Oil', 'Groundnut Oil', 'Bouillon Seasonings', 'Spices & Curry'],
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'canned-packaged-foods',
    number: 5,
    title: 'Canned and Packaged Foods',
    subtitle: 'Quick, Convenient & Long Shelf-Life',
    description: 'Tinned fish, sardines, corned beef, canned mackerel, sweet corn, baked beans, canned green peas, tomato paste sachets & tins, evaporated milk tins, and easy-prep foods.',
    highlights: ['Tinned Fish & Sardines', 'Tomato Paste Sachets/Tins', 'Sweet Corn & Baked Beans', 'Corned Beef', 'Evaporated Milk'],
    image: cannedFoodsImg,
  },
  {
    id: 'packaged-provisions-groceries',
    number: 6,
    title: 'Packaged Provisions and Groceries',
    subtitle: 'Everyday Household Provisions',
    description: 'Nutritious chocolate beverage powders, powdered whole milk, instant noodles, spaghetti, macaroni, granulated sugar, tea bags, crunchy biscuits, and breakfast cereals.',
    highlights: ['Chocolate Beverages', 'Powdered Milk', 'Spaghetti & Noodles', 'Sugar & Tea Bags', 'Biscuits & Snacks'],
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    badge: 'Everyday Essentials',
  },
  {
    id: 'fresh-vegetables',
    number: 7,
    title: 'Fresh Vegetables and Food Items',
    subtitle: 'Fresh Daily Market Produce',
    description: 'Fresh market red tomatoes, fiery scotch bonnet peppers (atarodo), red and white onions, sweet bell peppers, ginger, garlic, and seasonal fresh culinary produce.',
    highlights: ['Fresh Tomatoes', 'Scotch Bonnet (Atarodo)', 'Onions', 'Fresh Ginger & Garlic', 'Market Vegetables'],
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    badge: 'Market Fresh',
  },
  {
    id: 'household-products',
    number: 8,
    title: 'Essential Household Products',
    subtitle: 'Hygiene, Cleaning & Sanitation',
    description: 'Multi-purpose laundry detergents, bathing and laundry bar soaps, liquid disinfectants, antiseptics, toilet rolls, paper towels, scouring pads, and daily household maintenance supplies.',
    highlights: ['Laundry Detergents', 'Bar & Toilet Soaps', 'Antiseptics & Disinfectants', 'Toilet Rolls & Napkins', 'Cleaning Supplies'],
    image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=800&q=80',
  },
];

export const BANKING_SERVICES: BankingService[] = [
  {
    id: 'cash-deposit',
    title: 'Cash Deposit',
    description: 'Deposit funds instantly into any commercial or microfinance bank account in Nigeria without long bank queues.',
    iconName: 'deposit',
  },
  {
    id: 'cash-withdrawal',
    title: 'Cash Withdrawal',
    description: 'Quickly access physical cash with your debit card (Mastercard, Visa, Verve) right at our store counter.',
    iconName: 'withdraw',
  },
  {
    id: 'money-transfer',
    title: 'Money Transfer',
    description: 'Send money reliably to relatives, business partners, suppliers, and bank accounts nationwide in minutes.',
    iconName: 'transfer',
  },
  {
    id: 'airtime-topup',
    title: 'Airtime Top-Up',
    description: 'Instant recharge for all Nigerian mobile networks including MTN, Airtel, Glo, and 9mobile.',
    iconName: 'airtime',
  },
  {
    id: 'data-subscription',
    title: 'Data Subscription',
    description: 'Renew your mobile data plans quickly for smooth browsing, remote work, and streaming.',
    iconName: 'data',
  },
  {
    id: 'bill-payments',
    title: 'Bill Payments',
    description: 'Pay your electricity bills (prepaid tokens & postpaid meters) and cable TV subscriptions (DStv, GOtv, Startimes) easily.',
    iconName: 'bill',
  },
  {
    id: 'balance-enquiry',
    title: 'Balance Enquiry',
    description: 'Check your current bank account balance and print instant verification receipts in seconds.',
    iconName: 'balance',
  },
];

export const BUSINESS_INFO = {
  name: 'Anetorufa Ventures',
  tagline: 'Quality Provisions, Healthy Living, Convenient Banking.',
  phone: '08137590538',
  phoneFormatted: '+234 813 759 0538',
  phoneTel: 'tel:08137590538',
  whatsappNumber: '2348137590538',
  whatsappMessage: 'Hello Anetorufa Ventures. I would like to make an enquiry about your products or services.',
  colors: {
    purple: '#650A80',
    green: '#07852D',
    lime: '#72E52E',
    white: '#FFFFFF',
    lightGrey: '#F7F7F7',
  },
};
