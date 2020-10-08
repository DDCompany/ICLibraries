Saver.addSavesScope("Baubles",
    (data: BaublesData) => {
        Baubles.data = data;
        for (const uid in data) {
            Baubles.setupContainer(parseInt(uid), data[uid].container);
        }
    },
    () => Baubles.data);