export enum category_t{
    sweet ='sweety',
    salty = 'salty',
    drink = 'drink'
};

export interface Product{
    id: number,
    name: string,
    value: number,
    description: string,
    quantity: number,
    barCode: string,
    imgUrl : string,
    category: category_t
};

