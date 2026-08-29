import { Dish } from './types';

export const DISHES: Dish[] = [
  { id: 'fries',   name: '薯条', price: 10,  cookTime: 4,  unlockCost: 0,   artKey: 'dish-fries' },
  { id: 'burger',  name: '汉堡', price: 15,  cookTime: 6,  unlockCost: 0,   artKey: 'dish-burger' },
  { id: 'pizza',   name: '披萨', price: 30,  cookTime: 9,  unlockCost: 80,  artKey: 'dish-pizza' },
  { id: 'pasta',   name: '意面', price: 45,  cookTime: 12, unlockCost: 200, artKey: 'dish-pasta' },
  { id: 'steak',   name: '牛排', price: 70,  cookTime: 16, unlockCost: 450, artKey: 'dish-steak' },
  { id: 'dessert', name: '甜品', price: 100, cookTime: 20, unlockCost: 800, artKey: 'dish-dessert' },
];

export function dishById(id: string): Dish | undefined {
  return DISHES.find(d => d.id === id);
}
