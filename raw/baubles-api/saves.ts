interface BaublesSavesScope {
    container: UI.Container
}

Saver.addSavesScope("Baubles",
    function read(scope: BaublesSavesScope) {
        if (scope.container) {
            Baubles.container = scope.container;
            Baubles.cache();
        } else {
            Baubles.container = new UI.Container();
        }
    },
    function save() {
        return {container: Baubles.container};
    }
);