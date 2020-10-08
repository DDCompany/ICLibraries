interface BaubleDescription {
    /**
     * Item id
     */
    id: number,
    /**
     * Type of bauble. Tells which slot the item can be put in
     */
    type: BaubleType
    /**
     * Called when equipping the item and upon entering the world if the item is equipped
     */
    onEquip?: (client: ConnectedClient, container: ItemContainer, slotName: string) => void
    /**
     * Called when a player take off the item or dies
     */
    onTakeOff?: (client: ConnectedClient, container: ItemContainer, slotName: string) => void
    /**
     * Called every tick if the the item is equipped
     */
    tick: (client: ConnectedClient, container: ItemContainer, slotName: string) => void
}