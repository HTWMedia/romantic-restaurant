import { EventTarget } from 'cc';

export const Events = {
  CoinsChanged: 'CoinsChanged',
  MenuChanged: 'MenuChanged',
  CustomerCountChanged: 'CustomerCountChanged',
};

export const bus = new EventTarget();
