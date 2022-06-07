import { createContext, ReactNode, useContext, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product, Stock } from "../types";

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem("@RocketShoes:cart");

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const checkStock = async (
    productId: number,
    amount: number
  ): Promise<boolean> => {
    const { data: stock } = await api.get<Stock>(`/stock/${productId}`);

    if (amount > stock.amount) {
      toast.error("Quantidade solicitada fora de estoque");
      return false;
    }

    return true;
  };

  const getProductById = async (productId: number): Promise<Product> => {
    const { data: product } = await api.get<Product>(`/products/${productId}`);

    return product;
  };

  const addProduct = async (productId: number) => {
    try {
      const amount = 1;

      const inStock = await checkStock(productId, amount);

      if (!inStock) return;

      const product = await getProductById(productId);

      setCart([...cart, { ...product, amount }]);
    } catch {
      toast.error("Erro na adição do produto");
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if (amount <= 0) return;

      const inStock = await checkStock(productId, amount);

      if (!inStock) return;

      const newCart = cart.map((product) =>
        product.id === productId ? { ...product, amount } : product
      );

      setCart(newCart);
    } catch {
      toast.error("Erro na alteração de quantidade do produto");
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
