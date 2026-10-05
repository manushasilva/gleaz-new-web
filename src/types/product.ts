export type Product = {
  id: string;
  title: string;
  price: number;
  discountedPrice?: number | null;
  discountPercentage?: number | null;
  slug: string;
  quantity: number;
  updatedAt: Date;
  reviews: number;
  shortDescription: string;
  productVariants: {
    color: string;
    image: string;
    size: string;
    isDefault: boolean;
  }[];
};

// Add discountPercentage here too if StoreProduct is mapped from or related to this type
export type StoreProduct = {
  id: string;
  title: string;
  price: number;
  discountedPrice?: number | null;
  discountPercentage?: number | null; // <--- Add this
  slug: string;
  quantity: number;
  // ... any other fields StoreProduct has
};

export type IProductByDetails = {
  id: string;
  title: string;
  shortDescription: string;
  description: string | null;
  price: number;
  discountedPrice?: number | null;
  discountPercentage?: number | null; // <--- Add this here as well
  slug: string;
  quantity: number;
  updatedAt: Date;
  category: {
    title: string;
    slug: string;
  } | null;
  productVariants: {
    color: string;
    image: string;
    size: string;
    isDefault: boolean;
  }[];
  reviews: number;
  additionalInformation: {
    name: string;
    description: string;
  }[];
  customAttributes: {
    attributeName: string;
    attributeValues: {
      id: string;
      title: string;
    }[];
  }[];
  body: string | null;
  tags: string[] | null;
  offers: string[] | null;
  sku: string | null;
};
