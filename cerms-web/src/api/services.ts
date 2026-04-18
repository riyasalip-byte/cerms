import { assetsMockData, customersMockData, rentalsMockData } from './mockData'

function withDelay<T>(data: T, delayMs = 550): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delayMs)
  })
}

export function getAssets() {
  return withDelay(assetsMockData)
}

export function getCustomers() {
  return withDelay(customersMockData)
}

export function getRentals() {
  return withDelay(rentalsMockData)
}

