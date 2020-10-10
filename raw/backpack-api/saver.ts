interface IBackpacksSaverScope {
    nextUnique: number;
    containers: { [key: string]: ItemContainer }
    _format: number
}

Saver.addSavesScope("BackpacksScope",
    function read(scope: IBackpacksSaverScope) {
        BackpackRegistry.nextUnique = scope.nextUnique ?? 1;

        if (!scope._format) {
            Logger.Log("Old saves detected. Converting...", LOG_TAG);
            // @ts-ignore
            const oldContainers: { [key: string]: UI.Container } = scope.containers;
            const containers: { [key: string]: ItemContainer } = {};
            for (let key in oldContainers) {
                containers[key] = new ItemContainer(oldContainers[key]);
            }
            BackpackRegistry.containers = containers;
        } else {
            BackpackRegistry.containers = scope.containers ?? {};
        }
    },

    function save(): IBackpacksSaverScope {
        return {
            nextUnique: BackpackRegistry.nextUnique,
            containers: BackpackRegistry.containers,
            _format: 1
        };
    }
);