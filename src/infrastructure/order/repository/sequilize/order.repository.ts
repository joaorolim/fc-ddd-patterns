import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";

export default class OrderRepository {
  
  async create(entity: Order): Promise<void> {
    await OrderModel.create(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        })),
      },
      {
        include: [{ model: OrderItemModel }],
      }
    );
  }

  async update(entity: Order): Promise<void> {
  
    // Atualize os dados principais da ordem no OrderModel
    await OrderModel.update(
      {
        customer_id: entity.customerId,
        total: entity.total(),
      },
      {
        where: {
          id: entity.id,
        },
      }
    );
  
    // Atualize ou insira cada item relacionado na OrderItemModel
    for (const item of entity.items) {
      await OrderItemModel.upsert({
        id: item.id,
        order_id: entity.id, // Certifique-se de associar o item à ordem correta
        name: item.name,
        price: item.price,
        product_id: item.productId,
        quantity: item.quantity,
      });
    }
  }

  async find(id: string): Promise<Order> {
    try {
      const orderModel = await OrderModel.findOne({
        where: { id },
        rejectOnEmpty: true,
      });
  
      const orderItems = await OrderItemModel.findAll({
        where: { order_id: orderModel.id },
      });
  
      const arrayOfOrderItems = orderItems.map((orderItem) => {
        return new OrderItem(
          orderItem.id,
          orderItem.name,
          orderItem.price,
          orderItem.product_id,
          orderItem.quantity
        );
      });
  
      const order = new Order(
        orderModel.id,
        orderModel.customer_id,
        arrayOfOrderItems
      );
  
      // console.log("find order:", order);
  
      return order;
    } catch (error) {
      throw new Error(`Order with ID ${id} not found`);
    }
  }

  async findAll(): Promise<Order[]> {
    const orderModels = await OrderModel.findAll({
      include: ["items"],
    });

    return orderModels.map((orderModel) => {
      const orderItems = orderModel.items.map((item) => {
        return new OrderItem(
          item.id,
          item.name,
          item.price,
          item.product_id,
          item.quantity
        );
      });

      return new Order(orderModel.id, orderModel.customer_id, orderItems);
    });
  }

}
