Saver.addSavesScope("Baubles",
    function read(data: BaublesData) {
        Baubles.data = data;
        for (const uid in data) {
            const save = data[uid];
            Baubles.setupContainer(save.container, parseInt(uid));
        }
    },
    function save() {
        return Baubles.data;
    }
);