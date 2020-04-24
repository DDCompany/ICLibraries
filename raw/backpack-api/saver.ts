interface IBackpacksSaverScope {
    nextUnique: number;
    containers: { [key: string]: UI.Container }
}

Saver.addSavesScope("BackpacksScope",
    function read(scope: IBackpacksSaverScope) {
        BackpackRegistry.nextUnique = scope.nextUnique ?? 1;
        BackpackRegistry.containers = scope.containers ?? {};
    },

    function save(): IBackpacksSaverScope {
        return {
            nextUnique: BackpackRegistry.nextUnique,
            containers: BackpackRegistry.containers
        };
    }
);