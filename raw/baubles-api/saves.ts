interface BaublesSaverScope {
    data: BaublesData
    _format: number
}

Saver.addSavesScope("Baubles",
    (scope: BaublesSaverScope) => {
        if (!scope._format) {
            Logger.Log("Old saves detected. Converting...", LOG_TAG);
            // @ts-ignore
            const container: UI.Container = scope.container;
            const cache: { [key: string]: number } = {};
            const slots = container.slots;
            for (let slotName in slots) {
                cache[slotName] = slots[slotName].id;
            }

            Baubles.data = {
                [Player.get()]: {
                    // @ts-ignore
                    container: new ItemContainer(scope.container),
                    cache: cache
                }
            };
            return;
        }

        const data = scope.data;
        Baubles.data = data;
        for (const uid in data) {
            Baubles.setupContainer(parseInt(uid), data[uid].container);
        }
    },
    () => {
        return {data: Baubles.data, _format: 1};
    }
);