import EventDispatcher from "../../@shared/event/event-dispatcher";
import CustomerCreatedEvent from "./customer-created.event";
import CustomerAddressChangedEvent from "./customer-address-changed.event";
import EnviaConsoleLog1Handler from "./handler/envia-console-log1.handler";
import EnviaConsoleLog2Handler from "./handler/envia-console-log2.handler";
import EnviaConsoleLogHandler from "./handler/envia-console-log.handler";
import Customer from "../entity/customer";
import Address from "../value-object/address";

describe("Customer domain events", () => {
  it("should notify both handlers when customer is created", () => {
    const eventDispatcher = new EventDispatcher();
    const handler1 = new EnviaConsoleLog1Handler();
    const handler2 = new EnviaConsoleLog2Handler();
    const spy1 = jest.spyOn(handler1, "handle");
    const spy2 = jest.spyOn(handler2, "handle");

    eventDispatcher.register("CustomerCreatedEvent", handler1);
    eventDispatcher.register("CustomerCreatedEvent", handler2);

    const event = new CustomerCreatedEvent({ id: "1", name: "John" });
    eventDispatcher.notify(event);

    expect(spy1).toHaveBeenCalledWith(event);
    expect(spy2).toHaveBeenCalledWith(event);
  });

  it("should notify address changed handler when customer address is changed", () => {
    const eventDispatcher = new EventDispatcher();
    const handler = new EnviaConsoleLogHandler();
    const spy = jest.spyOn(handler, "handle");

    eventDispatcher.register("CustomerAddressChangedEvent", handler);

    const address = new Address("Rua A", 123, "00000-000", "Cidade");
    const event = new CustomerAddressChangedEvent({
      id: "1",
      name: "John",
      address: address,
    });
    eventDispatcher.notify(event);

    expect(spy).toHaveBeenCalledWith(event);
  });
});
