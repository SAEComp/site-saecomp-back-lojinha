export enum category_t{
    sweety = 0,
    salty,
    drink
} 

export interface Product{
    id: number;
    name: string;
    value: number;
    description: string;
    quantity: number;
    barCode: string;
    category: number;
}

