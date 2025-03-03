"use client";

import { Avatar, AvatarImage } from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { OrderStatus, Prisma } from "@prisma/client";
import { ChevronRightIcon } from "lucide-react";
import { Separator } from "../../components/ui/separator";
import { formatCurrency } from "@/app/helpers/price";
import Link from "next/link";
import { useContext } from "react";
import { CartContext } from "@/app/context/cart";
import { useRouter } from "next/navigation";

type OrderItemProps = {
  order: Prisma.OrderGetPayload<{
    include: {
      restaurant: true;
      products: {
        include: {
          product: true;
        };
      };
    };
  }>;
};

const OrderItem = ({ order }: OrderItemProps) => {
  const { addProductsToCart } = useContext(CartContext);
  const router = useRouter();

  const getOrderStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case "CANCELED":
        return "Cancelado";
      case "COMPLETED":
        return "Finalizado";
      case "CONFIRMED":
        return "Confirmado";
      case "DELIVERING":
        return "Em transporte";
      case "PREPARING":
        return "Preparando";
      default:
        return "Desconhecido";
    }
  };

  const handleReDoOrderClick = () => {
    for (const orderProduct of order.products) {
      addProductsToCart({
        product: { ...orderProduct.product, restaurant: order.restaurant },
        quantity: orderProduct.quantity,
      });
    }

    router.push(`/restaurants/${order.restautrantId}`);
  };

  return (
    <Card>
      <CardContent className="p-5">
        <div
          className={`w-fit rounded-full bg-[#EEEEEE] px-2 py-1 text-muted-foreground ${order.status !== "COMPLETED" && "bg-green-500 text-white"}`}
        >
          <span className="block text-xs font-semibold">
            {getOrderStatusLabel(order.status)}
          </span>
        </div>

        <div className="flex items-center justify-between pt-3">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={order.restaurant.imageUrl} />
            </Avatar>

            <span className="text-sm font-semibold">
              {order.restaurant.name}
            </span>
          </div>

          <Button
            size="icon"
            variant="link"
            className="h-5 w-5 text-black"
            asChild
          >
            <Link href={`/restaurants/${order.restautrantId}`}>
              <ChevronRightIcon />
            </Link>
          </Button>
        </div>

        <div className="py-3">
          <Separator />
        </div>

        <div className="space-y-2">
          {order.products.map((product) => (
            <div key={product.id} className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted-foreground">
                <span className="block text-xs text-white">
                  {product.quantity}
                </span>
              </div>
              <span className="block text-xs text-muted-foreground">
                {product.product.name}
              </span>
            </div>
          ))}
        </div>

        <div className="py-3">
          <Separator />
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs">{formatCurrency(Number(order.totalPrice))}</p>
          <Button
            size="sm"
            className="text-xs text-primary"
            variant="ghost"
            disabled={order.status !== "COMPLETED"}
            onClick={handleReDoOrderClick}
          >
            Refazer pedido
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderItem;
