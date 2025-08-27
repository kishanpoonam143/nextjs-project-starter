import React from 'react';

interface ProductFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelect: (category: string) => void;
}

export const ProductFilter: React.FC<ProductFilterProps> = ({ 
  categories, 
  selectedCategory, 
  onSelect 
}) => {
  const allCategories = ['All', ...categories];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter by Category</h3>
      <div className="flex flex-wrap gap-2">
        {allCategories.map(category => (
          <button 
            key={category} 
            onClick={() => onSelect(category === 'All' ? '' : category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              (category === 'All' && selectedCategory === '') || selectedCategory === category
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
      {selectedCategory && (
        <div className="mt-3 text-sm text-gray-600">
          Showing products in: <span className="font-medium text-blue-600">{selectedCategory}</span>
        </div>
      )}
    </div>
  );
};
