import React, { useEffect, useState } from "react";
import { MdAddShoppingCart } from "react-icons/md";
import { format } from "util";
import { useCart } from "../../hooks/useCart";
import { api } from "../../services/api";
import { ProductList } from "./styles";

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
}

interface ProductFormatted extends Product {
  priceFormatted: string;
}

interface CartItemsAmount {
  [key: number]: number;
}

const Home = (): JSX.Element => {
  const [products, setProducts] = useState<ProductFormatted[]>([]);
  const { addProduct, updateProductAmount, cart } = useCart();

  const cartItemsAmount = cart.reduce(
    (sumAmount, product) => ({
      ...sumAmount,
      [product.id]: product.amount,
    }),
    {} as CartItemsAmount
  );

  useEffect(() => {
    async function loadProducts() {
      const { data: products } = await api.get<ProductFormatted[]>("/products");
      setProducts(products);
    }

    loadProducts();
  }, []);

  function handleAddProduct(id: number) {
    const product = cart.find((product) => product.id === id);

    if (!product) {
      addProduct(id);
    } else {
      updateProductAmount({ productId: id, amount: product.amount + 1 });
    }
  }

  return (
    <ProductList>
      {products.map((product) => (
        <li key={product.id}>
          <img src={product.image} alt={product.title} />
          <strong>{product.title}</strong>
          <span>{format(product.price)}</span>
          <button
            type="button"
            data-testid="add-product-button"
            onClick={() => handleAddProduct(product.id)}
          >
            <div data-testid="cart-product-quantity">
              <MdAddShoppingCart size={16} color="#FFF" />
              {cartItemsAmount[product.id] || 0}
            </div>

            <span>ADICIONAR AO CARRINHO</span>
          </button>
        </li>
      ))}
    </ProductList>
  );
};

export default Home;
