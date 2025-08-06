import React, { useState } from 'react';
import { ShoppingCart, Plus } from 'lucide-react';
import { Product } from '../../shared/types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string, quantity: number) => void;
  disabled?: boolean;
}

export function ProductCard({ product, onAddToCart, disabled = false }: ProductCardProps) {
  const [isClicked, setIsClicked] = useState(false);
  
  const handleAddToCart = () => {
    console.log('=== ProductCard handleAddToCart Called ===');
    console.log('Product ID:', product.id);
    console.log('Product Name:', product.name);
    console.log('Disabled:', disabled);
    console.log('onAddToCart function:', typeof onAddToCart);
    
    if (!disabled) {
      console.log('ProductCard: Calling onAddToCart with:', { productId: product.id, quantity: 1 });
      
      // 添加视觉反馈
      setIsClicked(true);
      setTimeout(() => setIsClicked(false), 200);
      
      try {
        onAddToCart(product.id, 1);
        console.log('ProductCard: onAddToCart called successfully');
      } catch (error) {
        console.error('ProductCard: Error calling onAddToCart:', error);
      }
    } else {
      console.log('ProductCard: Button is disabled, not calling onAddToCart');
    }
    
    console.log('=== ProductCard handleAddToCart End ===');
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {/* 商品图片 */}
      <div className="aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      
      {/* 商品信息 */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {product.name}
        </h3>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.description}
        </p>
        
        {/* 价格和按钮 */}
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-blue-600">
            ¥{product.price.toLocaleString()}
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={disabled}
            className={
              `flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 transform ${
                disabled
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : isClicked
                  ? 'bg-green-600 text-white scale-95'
                  : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 hover:scale-105'
              }`
            }
          >
            <ShoppingCart size={16} />
            <span className="hidden sm:inline">加入购物车</span>
            <Plus size={16} className="sm:hidden" />
          </button>
        </div>
      </div>
    </div>
  );
}