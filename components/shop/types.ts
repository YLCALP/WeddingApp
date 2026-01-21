export interface Product {
    id: string;
    name: string;
    description: string | null;
    price_cents: number;
    images: string[];
    is_active: boolean;
    category_id?: string;
    min_quantity?: number;
    increment_amount?: number;
    customization_required?: boolean;
    customization_prompt?: string;
}

export interface Category {
    id: string;
    name: string;
    sort_order: number;
}

export interface CartItemType extends Product {
    quantity: number;
    customization_text?: string;
}

export const formatCurrency = (cents: number): string => {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
    }).format(cents / 100);
};
