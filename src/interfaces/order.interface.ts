import { Item } from "./Item.interface"

export interface BuyOrder{
    id: number,
    usersId: number,
    date: string,
    status: string,
    items: Item[]
};