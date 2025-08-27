import React from 'react';

interface Product {
  id: string;
  link: string;
  category: string;
  createdAt?: string;
}

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const imageUrl = `https://placehold.co/400x300?text=${encodeURIComponent(`${product.category}+Affiliate+Product`)}`;
  
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "https://placehold.co/400x300?text=Product+Image+Unavailable";
  };

  return (
    <div className="group bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <a 
        href={product.link} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="block"
      >
        <div className="aspect-w-4 aspect-h-3 bg-gray-100">
          <img 
            src={imageUrl} 
            alt={`Affiliate product in ${product.category} category`}
            onError={handleImageError}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {product.category}
          </h3>
          <p className="text-sm text-gray-500 mb-3">
            Affiliate Product
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-600 font-medium">
              View Product →
            </span>
            {product.createdAt && (
              <span className="text-xs text-gray-400">
                Added {new Date(product.createdAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </a>
    </div>
  );
};
