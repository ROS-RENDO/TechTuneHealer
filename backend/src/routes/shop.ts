import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import type { Request, Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// --- Products ---

// GET /shop/products
router.get("/products", async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true },
    });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching products" });
  }
});

// GET /shop/products/:id
router.get("/products/:id", async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id as string },
      include: { category: true },
    });
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching product" });
  }
});

// --- Cart ---

// GET /shop/cart
router.get("/cart", authenticate, async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) return;

  try {
    let cart = await prisma.cart.findUnique({
      where: { customerId: userId },
      include: { items: { include: { product: true } } },
    });
    if (!cart) {
      cart = await prisma.cart.create({
        data: { customerId: userId },
        include: { items: { include: { product: true } } },
      });
    }
    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching cart" });
  }
});

// POST /shop/cart/items
router.post("/cart/items", authenticate, async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) return;

  const { productId, quantity } = req.body;
  const qty = Math.floor(quantity);

  if (!productId || typeof qty !== "number" || !Number.isInteger(qty) || qty < 1) {
    res.status(400).json({ message: "Quantity must be a positive integer" });
    return;
  }

  try {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    let cart = await prisma.cart.findUnique({ where: { customerId: userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { customerId: userId } });
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + qty },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity: qty,
        },
      });
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { product: true } } },
    });

    res.status(200).json(updatedCart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding to cart" });
  }
});

// --- Orders ---

// POST /shop/orders/checkout
router.post("/orders/checkout", authenticate, async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) return;

  try {
    const order = await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { customerId: userId },
        include: { items: { include: { product: true } } },
      });

      if (!cart || cart.items.length === 0) {
        throw new HttpError(400, "Cart is empty");
      }

      let totalAmount = 0;
      const orderItemsData: { productId: string; quantity: number; priceAtBuy: number }[] = [];

      for (const item of cart.items) {
        if (!Number.isInteger(item.quantity) || item.quantity < 1) {
          throw new HttpError(400, "Invalid item quantity");
        }
        if (item.product.stock < item.quantity) {
          throw new HttpError(400, `Insufficient stock for ${item.product.name}`);
        }

        // Reserve stock (guarded update — fails if stock changed concurrently)
        const reserved = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (reserved.count === 0) {
          throw new HttpError(400, `Insufficient stock for ${item.product.name}`);
        }

        totalAmount += item.product.price * item.quantity;
        orderItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          priceAtBuy: item.product.price,
        });
      }

      const order = await tx.order.create({
        data: {
          customerId: userId,
          totalAmount,
          status: "PENDING",
          items: {
            create: orderItemsData,
          },
        },
      });

      // Clear cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return order;
    });

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (error) {
    if (error instanceof HttpError) {
      res.status(error.status).json({ message: error.message });
      return;
    }
    console.error(error);
    res.status(500).json({ message: "Error during checkout" });
  }
});

export default router;
