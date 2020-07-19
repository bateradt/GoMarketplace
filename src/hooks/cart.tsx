import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
  clearCart(): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE

      const storagedProducts = await AsyncStorage.getItem(
        'GoFinances:products',
      );

      if (storagedProducts) {
        setProducts(JSON.parse(storagedProducts));
      }

      // console.log(`storagedProducts: ${storagedProducts}`);
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART
      const existProduct = products.find(prod => prod.id === product.id);

      if (existProduct) {
        const newProducts = products.map(prod =>
          prod.id === product.id
            ? { ...product, quantity: prod.quantity + 1 }
            : prod,
        );
        setProducts(newProducts);
      } else {
        const produto = product;
        produto.quantity = 1;
        setProducts([...products, produto]);
      }

      await AsyncStorage.setItem(
        'GoFinances:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const clearCart = useCallback(async () => {
    await AsyncStorage.removeItem('GoFinances:products');
    setProducts([]);
  }, []);

  const increment = useCallback(
    async id => {
      const newProducts = products.map(prod =>
        prod.id === id ? { ...prod, quantity: prod.quantity + 1 } : prod,
      );

      setProducts(newProducts);

      await AsyncStorage.setItem(
        'GoFinances:products',
        JSON.stringify(newProducts),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const newProducts = products.map(prod =>
        prod.id === id ? { ...prod, quantity: prod.quantity - 1 } : prod,
      );

      const product = newProducts.find(prod => prod.id === id);

      const index = newProducts.findIndex(prod => prod.id === id);

      if (product && product.quantity <= 0) {
        newProducts.splice(index, 1);
      }

      setProducts(newProducts);

      await AsyncStorage.setItem(
        'GoFinances:products',
        JSON.stringify(newProducts),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products, clearCart }),
    [products, addToCart, increment, decrement, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
